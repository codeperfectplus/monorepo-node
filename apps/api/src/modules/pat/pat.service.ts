import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import { compare, hash } from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatDto } from './dto/create-pat.dto';
import type { Role } from '../auth/decorators/roles.decorator';

export type PatRecord = {
  id: string;
  name: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
};

export type PatValidationResult = {
  userId: string;
  email: string;
  role: Role;
  expiresAt: Date;
};

@Injectable()
export class PATService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreatePatDto,
  ): Promise<{ plainToken: string; record: PatRecord }> {
    const tokenId = randomUUID();
    const secret = randomBytes(32).toString('hex');
    // Format: pat_{uuid}_{hex} — uuid uses hyphens only, hex uses 0-9a-f only, no underscores
    const plainToken = `pat_${tokenId}_${secret}`;
    const tokenHash = await hash(plainToken, 12);

    const expiresInDays = dto.expiresInDays ?? 90;
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000,
    );

    const record = await this.prisma.personalAccessToken.create({
      data: {
        id: tokenId,
        userId,
        name: dto.name.trim(),
        tokenHash,
        expiresAt,
      },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });

    return { plainToken, record };
  }

  list(userId: string): Promise<PatRecord[]> {
    return this.prisma.personalAccessToken.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(userId: string, tokenId: string): Promise<void> {
    const record = await this.prisma.personalAccessToken.findFirst({
      where: { id: tokenId, userId },
      select: { id: true, revokedAt: true },
    });

    if (!record) {
      throw new NotFoundException('Token not found.');
    }

    if (record.revokedAt) {
      return; // already revoked — idempotent
    }

    await this.prisma.personalAccessToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  async validate(rawToken: string): Promise<PatValidationResult | null> {
    if (!rawToken.startsWith('pat_')) {
      return null;
    }

    // Split exactly on underscores: ['pat', uuid, hexSecret]
    const underscoreIdx = rawToken.indexOf('_', 4); // skip 'pat_'
    if (underscoreIdx === -1) return null;

    const afterPrefix = rawToken.slice(4); // remove 'pat_'
    const secondUnderscoreIdx = afterPrefix.indexOf('_');
    if (secondUnderscoreIdx === -1) return null;

    const tokenId = afterPrefix.slice(0, secondUnderscoreIdx);

    const UUID_REGEX =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(tokenId)) return null;

    const record = await this.prisma.personalAccessToken.findUnique({
      where: { id: tokenId },
      include: {
        user: {
          select: { id: true, email: true, role: true, isActive: true },
        },
      },
    });

    if (!record || record.revokedAt || !record.user.isActive) return null;
    if (record.expiresAt <= new Date()) return null;

    const isMatch = await compare(rawToken, record.tokenHash);
    if (!isMatch) return null;

    return {
      userId: record.user.id,
      email: record.user.email,
      role: record.user.role as Role,
      expiresAt: record.expiresAt,
    };
  }
}
