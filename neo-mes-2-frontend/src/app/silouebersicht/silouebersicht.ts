import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SiloStore } from '../store/Silo-Ext2/Silo.store';

@Component({
  selector: 'app-silouebersicht',
  imports: [DecimalPipe, CommonModule],
  templateUrl: './silouebersicht.html',
  styleUrl: './silouebersicht.css',
})
export class Silouebersicht {
  protected readonly store = inject(SiloStore);

  ngOnInit(): void {
    this.store.startPolling();
  }

  ngOnDestroy(): void {
    this.store.stopPolling();
  }

  fillY(pct: number): number {
    return 40 - 30 * pct;
  }

  fillH(pct: number): number {
    return 30 * pct;
  }
}
