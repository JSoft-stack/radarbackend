import { Module } from '@nestjs/common';
import { AppUpdate } from './app.update';
import { AppService } from './app.service';
import { TelegrafModule } from 'nestjs-telegraf';
import LocalSession from 'telegraf-session-local';
import {TG_TOKEN } from './constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Photo } from './photo.entity';

// Initialize local session middleware
const localSession = new LocalSession({ database: 'session_db.json' });

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads', // ← URL путь
    }),
    
    TelegrafModule.forRoot({
      middlewares: [ localSession.middleware()],
      token: TG_TOKEN,
      include: [],
    }),

    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   url: process.env.DATABASE_URL, // Railway'dan olinadi
    //   autoLoadEntities: true,
    //   synchronize: true, // dev uchun, productionda false qil
    //   ssl: {
    //     rejectUnauthorized: false, // Railway uchun kerak
    //   },
    // }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'geoRadar',
      entities: [join(__dirname + '/**/*.entity{.ts,.js}')],
      migrations: [join(__dirname + '/migrations/*{.ts,.js}')],
      synchronize: true,
    }),

    UsersModule,
    TypeOrmModule.forFeature([User, Photo]),

  ],
  controllers: [PhotosController],
  providers: [AppService, AppUpdate, PhotosService],
  // exports:[PhotosService],


})
export class AppModule {}
