import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { join } from 'path';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- 1. Создаём папку uploads, если нет ---
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Папка uploads создана автоматически');
  }

    // Статическая раздача
  // app.use('/uploads', express.static(uploadsDir));

  // // Если зашли просто на /uploads — возвращаем сообщение вместо ошибки
  // app.use('/uploads', (req, res) => {
  //   res.status(200).send('Uploads directory — доступ только к файлам.');
  // });
  // --- 2. Включаем CORS для всех ---



  app.enableCors({
    origin:'*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

   app.use(
    '/uploads',
    express.static(path.join(__dirname, '..', 'uploads'), {
      setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*'); // yoki front domeningni yoz
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
}
bootstrap();
