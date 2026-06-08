import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Realm } from '../../models/realm.model';

@Component({
  selector: 'app-realm-card',
  imports: [RouterLink],
  templateUrl: './realm-card.component.html',
})
export class RealmCardComponent {
  readonly realm = input.required<Realm>();
}
