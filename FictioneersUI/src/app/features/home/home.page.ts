import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HOME_REALM_PILLS } from '../../core/data/realm.seed';

@Component({
  selector: 'app-home',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './home.page.html',
})
export class HomePage {
  protected readonly realmPills = HOME_REALM_PILLS;
}
