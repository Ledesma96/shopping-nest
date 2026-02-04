import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: ['http://localhost:3001', 'http://192.168.1.33:3001', 'http://192.168.1.79:3001'],
    credentials: true,
  });
  await app.listen(3000, '0.0.0.0');

}
bootstrap();
