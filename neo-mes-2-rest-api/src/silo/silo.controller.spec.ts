import { Test, TestingModule } from '@nestjs/testing';
import { SiloController } from './silo.controller';
import { SiloService } from './silo.service';

describe('SiloController', () => {
  let controller: SiloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiloController],
      providers: [SiloService],
    }).compile();

    controller = module.get<SiloController>(SiloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
