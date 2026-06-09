import { Controller, Get } from '@nestjs/common';
import { Public } from '../../../libs/shared/auth/src';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      service: 'ventas',
      status: 'ok',
    };
  }
}
