import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { filter, Subject, takeUntil } from 'rxjs';
import { HeaderComponent } from './header/header';
import { NotificationComponent } from './notification/notification';
import { MsalGraphService } from './services/msal-graph.service';
import { SidebarComponent } from './sidebar/sidebar';
import { NeoMES2Store } from './store/NeoMES2/NeoMES2.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  title = 'neo-mes-2-frontend';

  private readonly destroy$ = new Subject<void>();
  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);
  private readonly msalGraphService = inject(MsalGraphService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly store = inject(NeoMES2Store);

  constructor() {
    const url = new URL(window.location.href);
    const hasCode = url.searchParams.has('code') || window.location.hash.includes('code=');
    const hasState = url.searchParams.has('state');
    if (hasState && !hasCode) {
      url.searchParams.delete('state');
      url.searchParams.delete('session_state');
      url.searchParams.delete('client_info');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }

  ngOnInit() {
    this.msalService.handleRedirectObservable().pipe(takeUntil(this.destroy$)).subscribe();

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        this.msalGraphService.setActiveAccountAndLoadData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
