import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@shared/database';

@Injectable()
export class PrismaService extends PrismaClient {}
