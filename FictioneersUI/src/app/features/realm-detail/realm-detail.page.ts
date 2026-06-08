import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RealmService } from '../../core/services/realm.service';
import { Realm } from '../../shared/models/realm.model';

@Component({
  selector: 'app-realm-detail',
  imports: [RouterLink],
  templateUrl: './realm-detail.page.html',
})
export class RealmDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly realmService = inject(RealmService);

  protected readonly realm = signal<Realm | undefined>(undefined);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';

    this.realmService.getRealmBySlug(slug).subscribe((realm) => {
      this.realm.set(realm);
      this.loading.set(false);
    });
  }
}
