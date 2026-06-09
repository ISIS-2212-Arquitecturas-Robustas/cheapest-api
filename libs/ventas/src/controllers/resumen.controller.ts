import { Controller, Get } from '@nestjs/common';
import { ResumenService, ResumenOperativoDto } from '../services/resumen.service';

@Controller('ventas')
export class ResumenController {
  constructor(private readonly resumenService: ResumenService) {}

  @Get('resumen-operativo')
  async getResumenOperativo(): Promise<ResumenOperativoDto> {
    return this.resumenService.getResumenOperativo();
  }
}
