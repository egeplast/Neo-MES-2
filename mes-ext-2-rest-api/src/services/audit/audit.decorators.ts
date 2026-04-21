import { SetMetadata } from "@nestjs/common";

export const AUDIT_SKIP_KEY = "audit:skip";
export const AUDIT_FORCE_KEY = "audit:force";
export const AUDIT_RESOURCE_KEY = "audit:resource";
export const AUDIT_ACTION_KEY = "audit:action";

/**
 * Auditing für diese Methode/Controller explizit überspringen,
 * auch bei Mutations (POST/PATCH/PUT/DELETE).
 */
export const SkipAudit = () => SetMetadata(AUDIT_SKIP_KEY, true);

/**
 * Auditing auch für GET-Methoden erzwingen (standardmäßig nur Mutations).
 */
export const Audited = () => SetMetadata(AUDIT_FORCE_KEY, true);

/**
 * Ressourcen-Name für das Audit-Log überschreiben.
 * Default: erstes Pfad-Segment.
 */
export const AuditResource = (resource: string) =>
  SetMetadata(AUDIT_RESOURCE_KEY, resource);

/**
 * Aktions-Name überschreiben. Default: HTTP-Methode (CREATE/UPDATE/DELETE/READ).
 */
export const AuditAction = (action: string) =>
  SetMetadata(AUDIT_ACTION_KEY, action);
