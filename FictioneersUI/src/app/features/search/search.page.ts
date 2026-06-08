import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink],
  templateUrl: './search.page.html',
})
export class SearchPage {
  query = '';
  searched = false;
  protected readonly results: unknown[] = [];

  search(event?: Event): void {
    event?.preventDefault();
    this.searched = true;
  }
}
