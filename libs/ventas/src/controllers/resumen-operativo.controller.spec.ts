import { Test, TestingModule } from '@nestjs/testing';
import { ResumenOperativoResponseDto } from '../dtos';
import { ResumenOperativoService } from '../services';
import { ResumenOperativoController } from './resumen-operativo.controller';

describe('ResumenOperativoController', () => {
  let controller: ResumenOperativoController;
  let service: jest.Mocked<ResumenOperativoService>;

  beforeEach(async () => {
    const mockService = { getResumenOperativo: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumenOperativoController],
      providers: [{ provide: ResumenOperativoService, useValue: mockService }],
    }).compile();

    controller = module.get(ResumenOperativoController);
    service = module.get(ResumenOperativoService);
  });

  it('delegates to the service with the requested tiendaId', async () => {
    const response: ResumenOperativoResponseDto = {
      tiendaId: 'tienda-1',
      catalogos: [],
      inventario: [],
      ventas: [],
    };
    service.getResumenOperativo.mockResolvedValue(response);

    const result = await controller.getResumenOperativo({
      tiendaId: 'tienda-1',
    });

    expect(service.getResumenOperativo).toHaveBeenCalledWith('tienda-1');
    expect(result).toBe(response);
  });
});
