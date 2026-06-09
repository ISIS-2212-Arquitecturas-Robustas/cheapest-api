import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.on('finish', () => {
      const status = res.statusCode;
      if (status === 401 || status === 403) {
        const user = req['user'];
        const sub = user?.sub ?? 'anon';
        const groups = (user?.['cognito:groups'] ?? []).join(',') || '—';
        console.log(
          `AUTH_FAIL ${status} ${req.method} ${req.path} - user=${sub} groups=[${groups}]`,
        );
      }
    });
    next();
  }
}
