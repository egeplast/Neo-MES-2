import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { MsalGraphService, SecurityGroup } from '../services/msal-graph.service';
import { ThemeStore } from '../store/theme/theme.store';

export interface NavElement {
  title: string;
  link?: string;
  icon: string;
  active?: boolean;
  children?: NavElement[];
  requiredGroupIds?: string[];
}

@Component({
  selector: 'app-sidebar',
  imports: [NgTemplateOutlet],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly sanitizer = inject(DomSanitizer);
  readonly themeStore = inject(ThemeStore);
  private readonly msalGraphService = inject(MsalGraphService);
  private readonly userSecurityGroups = toSignal(this.msalGraphService.userSecurityGroups$, {
    initialValue: [] as SecurityGroup[],
  });

  collapsed = false;

  /** Developer: Add your navigation elements here */
  elements: NavElement[] = [
    {
      title: 'Halle',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 11l9-7 9 7"/>
      <path d="M5 10v10h14V10"/>
      <path d="M9 20v-5h6v5"/>
    </svg>`,
      children: [
        {
          title: 'Silo',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 8l6-4 6 4"/>
          <rect x="6" y="8" width="12" height="12" rx="0.5"/>
          <path d="M6 20l2 2h8l2-2"/>
          <line x1="6" y1="13" x2="18" y2="13"/>
        </svg>`,
          children: [
            {
              title: 'Ext1',
              link: '/silouebersicht-ext1',
              icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8l6-4 6 4"/>
              <rect x="6" y="8" width="12" height="12" rx="0.5"/>
              <path d="M6 20l2 2h8l2-2"/>
              <line x1="6" y1="13" x2="18" y2="13"/>
            </svg>`,
            },
            {
              title: 'Ext2',
              link: '/silouebersicht-ext2',
              icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 8l6-4 6 4"/>
              <rect x="6" y="8" width="12" height="12" rx="0.5"/>
              <path d="M6 20l2 2h8l2-2"/>
              <line x1="6" y1="13" x2="18" y2="13"/>
            </svg>`,
            },
          ],
        },
      ],
    },
    {
      title: 'VorF Linie',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="9" width="5" height="6" rx="0.5"/>
      <path d="M8 12h3"/>
      <circle cx="13" cy="12" r="2"/>
      <path d="M15 12h3"/>
      <path d="M18 10l3 2-3 2z" fill="currentColor"/>
    </svg>`,
      children: [
        {
          title: 'Linie 201',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h4l2-3 4 6 2-3h6"/>
        </svg>`,
        },
        {
          title: 'Linie 203',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h4l2-3 4 6 2-3h6"/>
        </svg>`,
        },
        {
          title: 'Linie 205',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h4l2-3 4 6 2-3h6"/>
        </svg>`,
        },
        {
          title: 'Linie 207',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h4l2-3 4 6 2-3h6"/>
        </svg>`,
        },
        {
          title: 'Linie 209',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h4l2-3 4 6 2-3h6"/>
        </svg>`,
        },
        {
          title: 'Reports',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <path d="M14 3v6h6"/>
          <path d="M8 13h8M8 17h8M8 9h3"/>
        </svg>`,
          children: [],
        },
      ],
    },
    {
      title: 'VorF QS',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11l2 2 4-4"/>
      <path d="M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z"/>
    </svg>`,
      children: [
        {
          title: 'QS Station',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="7"/>
          <path d="M21 21l-4.3-4.3"/>
          <path d="M8 11l2 2 4-4"/>
        </svg>`,
        },
        {
          title: 'Nachprüfung',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12a9 9 0 1 0 3-6.7"/>
          <path d="M3 4v5h5"/>
        </svg>`,
        },
        {
          title: 'VorF QS Kleintrommel',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="6" rx="7" ry="2.5"/>
          <path d="M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6"/>
          <path d="M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5"/>
        </svg>`,
        },
      ],
    },
    {
      title: 'EndF Linie',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="14" height="8" rx="1"/>
      <circle cx="6" cy="18" r="2"/>
      <circle cx="12" cy="18" r="2"/>
      <path d="M16 12h4l2 3v3h-6"/>
    </svg>`,
      children: [
        {
          title: 'Linie 215',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h4l2-3 4 6 2-3h6"/>
        </svg>`,
        },
        {
          title: 'Linie 217',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h4l2-3 4 6 2-3h6"/>
        </svg>`,
        },
        {
          title: 'Linie 219',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12h4l2-3 4 6 2-3h6"/>
        </svg>`,
        },
        {
          title: 'Reports',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <path d="M14 3v6h6"/>
          <path d="M8 13h8M8 17h8M8 9h3"/>
        </svg>`,
        },
      ],
    },
  ];

  readonly visibleElements: Signal<NavElement[]> = computed(() =>
    this.filterByGroups(this.elements, this.userSecurityGroups()),
  );

  private readonly expandedKeys = new Set<string>();

  private mobileQuery: MediaQueryList | null = null;
  private readonly onViewportChange = (e: MediaQueryListEvent) => {
    this.collapsed = e.matches;
  };

  ngOnInit(): void {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      this.mobileQuery = window.matchMedia('(max-width: 1023px)');
      this.collapsed = this.mobileQuery.matches;
      this.mobileQuery.addEventListener('change', this.onViewportChange);
    }

    this.syncActiveState(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
        this.syncActiveState(url);
      });
  }

  ngOnDestroy(): void {
    this.mobileQuery?.removeEventListener('change', this.onViewportChange);
  }

  isItemActive(el: NavElement): boolean {
    return el.link === this.router.url;
  }

  isActive(el: NavElement): boolean {
    if (!el.link) return false;
    const url = this.router.url.split('?')[0];
    const linkPath = el.link.split('?')[0];
    return url === linkPath || url.startsWith(linkPath + '/');
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
      if (this.collapsed) {
        this.collapsed = false;
        this.expandedKeys.add(this.keyOf(el));
        return;
      }
      this.toggle(el, event);
      return;
    }
    if (el.link) {
      const [path, queryString] = el.link.split('?');
      const queryParams = queryString
        ? Object.fromEntries(new URLSearchParams(queryString))
        : undefined;
      this.router.navigate([path], { queryParams }).catch(() => {
        window.location.href = path;
      });
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

  private filterByGroups(items: NavElement[], userGroups: SecurityGroup[]): NavElement[] {
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
    const url = currentUrl.split('?')[0];
    const walk = (items: NavElement[]): boolean => {
      let branchMatched = false;
      for (const el of items) {
        const linkPath = el.link?.split('?')[0];
        const selfActive = !!linkPath && (url === linkPath || url.startsWith(linkPath + '/'));
        const childMatched = el.children ? walk(el.children) : false;
        el.active = selfActive;
        if (childMatched) this.expandedKeys.add(this.keyOf(el));
        if (selfActive || childMatched) branchMatched = true;
      }
      return branchMatched;
    };
    walk(this.elements);
  }

  logout(): void {
    this.msalGraphService.logout();
  }
}
