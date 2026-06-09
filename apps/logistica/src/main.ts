import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  AuthLoggerMiddleware,
  JwtAuthGuard,
  RolesGuard,
} from '../../../libs/shared/auth/src';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(new AuthLoggerMiddleware().use.bind(new AuthLoggerMiddleware()));
  app.useGlobalGuards(app.get(JwtAuthGuard), app.get(RolesGuard));
  const port = process.env.PORT || 3001;
  await app.listen(port);
}

void bootstrap();
