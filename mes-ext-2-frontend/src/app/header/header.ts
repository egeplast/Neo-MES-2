import { Component } from "@angular/core";
import { inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MsalGraphService } from "../services/msal-graph.service";

export interface NavItem {
  label: string;
  url: string;
  iconPath: string;
}

@Component({
  selector: "app-header",
  imports: [],
  templateUrl: "./header.html",
  styleUrl: "./header.css",
})
export class HeaderComponent {
  private readonly msalGraphService = inject(MsalGraphService);
  readonly userData = toSignal(this.msalGraphService.userData$, {
    initialValue: null,
  });
  readonly profilePicture = toSignal(this.msalGraphService.profilePicture$, {
    initialValue: "",
  });

  /** Developer: Add your navigation items here */
  navItems: NavItem[] = [];
}
