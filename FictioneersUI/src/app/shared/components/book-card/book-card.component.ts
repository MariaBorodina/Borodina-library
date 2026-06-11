import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../models/library.model';

@Component({
  selector: 'app-book-card',
  imports: [RouterLink],
  templateUrl: './book-card.component.html',
})
export class BookCardComponent {
  private readonly bookService = inject(BookService);

  readonly book = input.required<Book>();

  protected readonly coverUrl = computed(() =>
    this.bookService.getCoverPublicUrl(this.book().cover_path),
  );
}
