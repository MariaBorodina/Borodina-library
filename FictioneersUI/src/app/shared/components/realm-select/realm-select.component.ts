import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { RealmService } from '../../../core/services/realm.service';
import { Realm } from '../../models/realm.model';

/** Reusable realm dropdown for author book forms (US-P-12) */
@Component({
  selector: 'app-realm-select',
  templateUrl: './realm-select.component.html',
})
export class RealmSelectComponent implements OnInit {
  private readonly realmService = inject(RealmService);

  readonly label = input('Realm');
  readonly value = input('');
  readonly valueChange = output<string>();

  protected readonly realms = signal<Realm[]>([]);

  ngOnInit(): void {
    this.realmService.getRealms().subscribe((realms) => this.realms.set(realms));
  }

  protected onSelectionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.valueChange.emit(select.value);
  }
}
