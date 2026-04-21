import { NgTemplateOutlet } from "@angular/common";
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  Signal,
} from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { filter } from "rxjs";
import { ThemeStore } from "../store/theme/theme.store";
import { toSignal } from "@angular/core/rxjs-interop";
import {
  MsalGraphService,
  SecurityGroup,
} from "../services/msal-graph.service";

export interface NavElement {
  title: string;
  link?: string;
  icon: string;
  active?: boolean;
  children?: NavElement[];
  requiredGroupIds?: string[];
}

@Component({
  selector: "app-sidebar",
  imports: [NgTemplateOutlet],
  templateUrl: "./sidebar.html",
  styleUrl: "./sidebar.css",
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  readonly themeStore = inject(ThemeStore);
  private readonly msalGraphService = inject(MsalGraphService);
  private readonly userSecurityGroups = toSignal(
    this.msalGraphService.userSecurityGroups$,
    { initialValue: [] as SecurityGroup[] },
  );

  collapsed = false;

  /** Developer: Add your navigation elements here */
  elements: NavElement[] = [];

  readonly visibleElements: Signal<NavElement[]> = computed(() =>
    this.filterByGroups(this.elements, this.userSecurityGroups()),
  );

  private readonly expandedKeys = new Set<string>();

  private mobileQuery: MediaQueryList | null = null;
  private readonly onViewportChange = (e: MediaQueryListEvent) => {
    this.collapsed = e.matches;
  };

  ngOnInit(): void {
    if (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function"
    ) {
      this.mobileQuery = window.matchMedia("(max-width: 1023px)");
      this.collapsed = this.mobileQuery.matches;
      this.mobileQuery.addEventListener("change", this.onViewportChange);
    }

    this.syncActiveState(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects.split("?")[0];
        this.syncActiveState(url);
      });
  }

  ngOnDestroy(): void {
    this.mobileQuery?.removeEventListener("change", this.onViewportChange);
  }

  isActive(el: NavElement): boolean {
    if (!el.link) return false;
    const url = this.router.url.split("?")[0];
    return url === el.link || url.startsWith(el.link + "/");
  }

  hasChildren(el: NavElement): boolean {
    return !!el.children && el.children.length > 0;
  }

  isExpanded(el: NavElement): boolean {
    return this.expandedKeys.has(this.keyOf(el));
  }

  isBranchActive(el: NavElement): boolean {
    if (this.isActive(el)) return true;
    if (!el.children) return false;
    return el.children.some((c) => this.isBranchActive(c));
  }

  toggle(el: NavElement, event: Event): void {
    event.stopPropagation();
    const key = this.keyOf(el);
    if (this.expandedKeys.has(key)) {
      this.expandedKeys.delete(key);
    } else {
      this.expandedKeys.add(key);
    }
  }

  onItemClick(el: NavElement, event: Event): void {
    if (this.hasChildren(el)) {
      if (this.collapsed) return;
      this.toggle(el, event);
      return;
    }
    if (el.link) {
      this.router.navigate([el.link]);
    }
  }

  sanitizeIcon(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  cycleTheme(): void {
    this.themeStore.cycleMode();
  }

  private keyOf(el: NavElement): string {
    return el.link ?? el.title;
  }

  private filterByGroups(
    items: NavElement[],
    userGroups: SecurityGroup[],
  ): NavElement[] {
    const result: NavElement[] = [];
    for (const el of items) {
      if (!this.canShow(el, userGroups)) continue;
      const filteredChildren = el.children
        ? this.filterByGroups(el.children, userGroups)
        : undefined;
      if (el.children && el.children.length > 0) {
        if (!filteredChildren || filteredChildren.length === 0) continue;
      }
      result.push({ ...el, children: filteredChildren });
    }
    return result;
  }

  private canShow(el: NavElement, userGroups: SecurityGroup[]): boolean {
    if (!el.requiredGroupIds || el.requiredGroupIds.length === 0) return true;
    if (userGroups.length === 0) return false;
    return userGroups.some((g) => el.requiredGroupIds!.includes(g.id));
  }

  private syncActiveState(currentUrl: string): void {
    const url = currentUrl.split("?")[0];
    const walk = (items: NavElement[]): boolean => {
      let branchMatched = false;
      for (const el of items) {
        const selfActive =
          !!el.link && (url === el.link || url.startsWith(el.link + "/"));
        const childMatched = el.children ? walk(el.children) : false;
        el.active = selfActive;
        if (childMatched) {
          this.expandedKeys.add(this.keyOf(el));
        }
        if (selfActive || childMatched) {
          branchMatched = true;
        }
      }
      return branchMatched;
    };
    walk(this.elements);
  }

  logout(): void {
    this.msalGraphService.logout();
  }
}
