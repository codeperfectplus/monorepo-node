import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());

  // Enable CORS for frontend communication
  app.enableCors({
    origin: 'http://localhost:3000', // Next.js dev server
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
