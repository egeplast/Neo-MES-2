import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SiloService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.silo.findMany({
      include: { material: true },
      orderBy: { nummer: 'asc' },
    });
  }

  findOne(nummer: number) {
    return this.prisma.silo.findUnique({
      where: { nummer },
      include: { material: true },
    });
  }
}
