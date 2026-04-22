import {
  Controller,
  Get,
  Param,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { GraphService, GraphUserInfo } from "./graph.service";

@Controller("graph")
export class GraphController {
  constructor(private readonly graphService: GraphService) {}

  @Get("me")
  async getMe(@Req() req: Request): Promise<GraphUserInfo> {
    const token = this.extractBearerToken(req);
    return this.graphService.getMe(token);
  }

  @Get("users/:email")
  async getUser(
    @Param("email") email: string,
    @Req() req: Request,
  ): Promise<GraphUserInfo> {
    const token = this.extractBearerToken(req);
    return this.graphService.getUserByEmail(email, token);
  }

  private extractBearerToken(req: Request): string {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException(
        "Bearer token missing in Authorization header.",
      );
    }
    return authHeader.slice(7);
  }
}
