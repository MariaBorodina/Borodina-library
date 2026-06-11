import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { RealmService } from '../../core/services/realm.service';
import { RealmCardComponent } from '../../shared/components/realm-card/realm-card.component';
import { Realm } from '../../shared/models/realm.model';

@Component({
  selector: 'app-browse-realms',
  imports: [RealmCardComponent],
  templateUrl: './browse-realms.page.html',
})
export class BrowseRealmsPage {
  private readonly realmService = inject(RealmService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly realms = signal<Realm[]>([]);

  constructor() {
    this.loadRealms();
  }

  private loadRealms(): void {
    this.loading.set(true);

    this.realmService
      .getRealms()
      .pipe(
        catchError(() => of([] as Realm[])),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (realms) => {
          this.realms.set(realms);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
}
