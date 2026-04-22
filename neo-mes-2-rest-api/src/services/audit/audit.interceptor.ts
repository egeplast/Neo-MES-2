import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request, Response } from "express";
import { Observable, tap } from "rxjs";
import {
  AUDIT_ACTION_KEY,
  AUDIT_FORCE_KEY,
  AUDIT_RESOURCE_KEY,
  AUDIT_SKIP_KEY,
} from "./audit.decorators";
import { AuditService } from "./audit.service";
import { GraphService } from "../graph/graph.service";

const MUTATION_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

const METHOD_TO_ACTION: Record<string, string> = {
  POST: "CREATE",
  PATCH: "UPDATE",
  PUT: "UPDATE",
  DELETE: "DELETE",
  GET: "READ",
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
    private readonly graphService: GraphService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") return next.handle();

    const skip = this.reflector.getAllAndOverride<boolean>(AUDIT_SKIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const method = req.method.toUpperCase();
    const isMutation = MUTATION_METHODS.has(method);
    const forced = this.reflector.getAllAndOverride<boolean>(AUDIT_FORCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isMutation && !forced) return next.handle();

    const resourceOverride = this.reflector.getAllAndOverride<string>(
      AUDIT_RESOURCE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const actionOverride = this.reflector.getAllAndOverride<string>(
      AUDIT_ACTION_KEY,
      [context.getHandler(), context.getClass()],
    );

    const { resource, resourceId } = this.parsePath(req.path);
    const action = actionOverride ?? METHOD_TO_ACTION[method] ?? method;

    return next.handle().pipe(
      tap({
        next: async (response) => {
          const res = context.switchToHttp().getResponse<Response>();
          const user = await this.resolveUser(req);
          await this.auditService.log({
            userAzureId: user.azureId,
            userEmail: user.email,
            userDisplay: user.displayName,
            method,
            path: req.path,
            resource: resourceOverride ?? resource,
            resourceId,
            action,
            statusCode: res.statusCode,
            payload: req.body ?? null,
            response,
            ipAddress: this.extractIp(req),
            userAgent: req.headers["user-agent"] ?? null,
          });
        },
        error: async (err) => {
          const statusCode = typeof err?.status === "number" ? err.status : 500;
          const user = await this.resolveUser(req);
          await this.auditService.log({
            userAzureId: user.azureId,
            userEmail: user.email,
            userDisplay: user.displayName,
            method,
            path: req.path,
            resource: resourceOverride ?? resource,
            resourceId,
            action,
            statusCode,
            payload: req.body ?? null,
            response: { error: err?.message ?? "Unknown error" },
            ipAddress: this.extractIp(req),
            userAgent: req.headers["user-agent"] ?? null,
          });
        },
      }),
    );
  }

  private parsePath(path: string): {
    resource: string | null;
    resourceId: string | null;
  } {
    const cleaned = path.replace(/^\/?api\//, "").replace(/^\/+|\/+$/g, "");
    const segments = cleaned.split("/").filter(Boolean);
    if (segments.length === 0) return { resource: null, resourceId: null };
    const resource = segments[0] ?? null;
    const resourceId =
      segments[1] && this.looksLikeId(segments[1]) ? segments[1] : null;
    return { resource, resourceId };
  }

  private looksLikeId(segment: string): boolean {
    return /^[0-9a-f-]{8,}$/i.test(segment) || /^\d+$/.test(segment);
  }

  private extractIp(req: Request): string | null {
    const xff = req.headers["x-forwarded-for"];
    if (typeof xff === "string" && xff.length > 0)
      return xff.split(",")[0]!.trim();
    return req.ip ?? null;
  }

  private async resolveUser(req: Request): Promise<{
    azureId: string | null;
    email: string | null;
    displayName: string | null;
  }> {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.slice(7);
        const graphUser = await this.graphService.getMe(token);
        return {
          azureId: graphUser.azureId,
          email: graphUser.email,
          displayName: graphUser.displayName,
        };
      } catch {
        // Token ungültig oder Graph nicht erreichbar → system fallback
      }
    }
    return { azureId: null, email: null, displayName: "system" };
  }
}
