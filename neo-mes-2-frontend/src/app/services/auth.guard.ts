import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { forkJoin, map, tap } from "rxjs";
import { MsalGraphService } from "./msal-graph.service";

export const authGuard: CanActivateFn = (route) => {
  const msalGraphService = inject(MsalGraphService);
  const router = inject(Router);

  const requiredGroupIds = (route.data["requiredGroups"] as string[]) ?? [];
  if (requiredGroupIds.length === 0) return true;

  return forkJoin(
    requiredGroupIds.map((id) => msalGraphService.isMemberOf(id)),
  ).pipe(
    map((results) => results.some((isMember) => isMember === true)),
    tap((allowed) => {
      if (!allowed) router.navigate([""]);
    }),
  );
};
