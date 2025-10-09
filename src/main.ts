import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { join } from 'path';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- 1. Создаём папку uploads, если нет ---
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Папка uploads создана автоматически');
  }

  // Получаем native Express instance и сохраняем в global
  const expressApp = app.getHttpAdapter().getInstance();
  // безопасно присваиваем глобально
  (global as unknown as { express?: import('express').Express }).express = expressApp;

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin:'*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
}
bootstrap();
