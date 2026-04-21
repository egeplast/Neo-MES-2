import { Controller, Get, Param, Query } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SkipAudit } from "./audit.decorators";

@Controller("audit")
@SkipAudit()
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query("resource") resource?: string,
    @Query("resourceId") resourceId?: string,
    @Query("userAzureId") userAzureId?: string,
    @Query("take") take = "100",
    @Query("skip") skip = "0",
  ) {
    const takeNum = Math.min(parseInt(take, 10) || 100, 500);
    const skipNum = parseInt(skip, 10) || 0;

    const where = {
      ...(resource && { resource }),
      ...(resourceId && { resourceId }),
      ...(userAzureId && { userAzureId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: takeNum,
        skip: skipNum,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, take: takeNum, skip: skipNum };
  }

  @Get(":id")
  async getOne(@Param("id") id: string) {
    return this.prisma.auditLog.findUnique({ where: { id } });
  }
}
