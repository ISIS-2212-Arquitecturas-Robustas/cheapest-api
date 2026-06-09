import { Global, Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CognitoJwtService } from './cognito-jwt.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthLoggerMiddleware } from './middleware/auth-logger.middleware';

@Global()
@Module({
  providers: [CognitoJwtService, JwtAuthGuard, RolesGuard, AuthLoggerMiddleware, Reflector],
  exports: [CognitoJwtService, JwtAuthGuard, RolesGuard, AuthLoggerMiddleware],
})
export class CognitoAuthModule {}
