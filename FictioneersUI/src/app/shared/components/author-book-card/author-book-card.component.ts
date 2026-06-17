import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../models/library.model';

@Component({
  selector: 'app-author-book-card',
  imports: [RouterLink],
  templateUrl: './author-book-card.component.html',
})
export class AuthorBookCardComponent {
  private readonly bookService = inject(BookService);

  readonly book = input.required<Book>();
  readonly deleteBook = output<string>();

  protected readonly coverUrl = computed(() =>
    this.bookService.getCoverPublicUrl(this.book().cover_path, this.book().updated_at),
  );

  protected onDelete(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.deleteBook.emit(this.book().id);
  }
}
