import { Test, TestingModule } from '@nestjs/testing';
import { SiloService } from './silo.service';

describe('SiloService', () => {
  let service: SiloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SiloService],
    }).compile();

    service = module.get<SiloService>(SiloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
