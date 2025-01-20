import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 启用 CORS
  app.enableCors();
  
  // 配置静态文件服务
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  await app.listen(3000);
}
bootstrap();
