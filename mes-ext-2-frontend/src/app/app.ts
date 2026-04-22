import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { combineLatest, filter, Subject, takeUntil } from 'rxjs';
import { MsalGraphService } from './services/msal-graph.service';
import { HeaderComponent } from './header/header';
import { SidebarComponent } from './sidebar/sidebar';
import { NotificationComponent } from './notification/notification';
import { MesExt2Store } from './store/MesExt2/MesExt2.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  title = 'Neo-MES-2-frontend';

  private readonly destroy$ = new Subject<void>();
  private readonly msalService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);
  private readonly msalGraphService = inject(MsalGraphService);
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(MesExt2Store);

  ngOnInit() {
    this.msalService
      .handleRedirectObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {});

    combineLatest([
      this.msalBroadcastService.inProgress$.pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
      ),
      this.route.queryParams,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([status, params]) => {
        this.msalGraphService.setActiveAccountAndLoadData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
