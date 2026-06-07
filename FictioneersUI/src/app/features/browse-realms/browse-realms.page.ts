import { Component, inject, OnInit, signal } from '@angular/core';
import { RealmService } from '../../core/services/realm.service';
import { RealmCardComponent } from '../../shared/components/realm-card/realm-card.component';
import { Realm } from '../../shared/models/realm.model';

@Component({
  selector: 'app-browse-realms',
  imports: [RealmCardComponent],
  templateUrl: './browse-realms.page.html',
})
export class BrowseRealmsPage implements OnInit {
  private readonly realmService = inject(RealmService);

  protected readonly loading = signal(true);
  protected readonly realms = signal<Realm[]>([]);

  ngOnInit(): void {
    this.realmService.getRealms().subscribe((realms) => {
      this.realms.set(realms);
      this.loading.set(false);
    });
  }
}
