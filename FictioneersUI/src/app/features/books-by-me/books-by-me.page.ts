import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { AuthorBookCardComponent } from '../../shared/components/author-book-card/author-book-card.component';
import { Book } from '../../shared/models/library.model';

export const DELETE_CONFIRM_MESSAGE =
  'This will permanently delete the book and all its increments. Are you sure?';

@Component({
  selector: 'app-books-by-me',
  imports: [RouterLink, AuthorBookCardComponent],
  templateUrl: './books-by-me.page.html',
})
export class BooksByMePage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly books = inject(BookService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly myBooks = signal<Book[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly deleteTarget = signal<string | null>(null);
  protected readonly deleteError = signal('');
  protected readonly deleting = signal(false);
  protected readonly publishingBookId = signal<string | null>(null);
  protected readonly publishError = signal('');

  protected readonly deleteConfirmMessage = DELETE_CONFIRM_MESSAGE;

  ngOnInit(): void {
    this.loadBooks();

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        if (this.router.url === '/books-by-me') {
          this.loadBooks();
        }
      });
  }

  protected loadBooks(): void {
    const userId = this.auth.user()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.books.getMyBooks(userId).subscribe({
      next: (items) => {
        this.myBooks.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load your books. Please refresh.');
        this.loading.set(false);
      },
    });
  }

  protected requestDelete(bookId: string): void {
    this.deleteTarget.set(bookId);
    this.deleteError.set('');
  }

  protected cancelDelete(): void {
    this.deleteTarget.set(null);
    this.deleteError.set('');
  }

  protected executeDelete(): void {
    const bookId = this.deleteTarget();
    if (!bookId || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.deleteError.set('');

    this.books.deleteBookIfEmpty(bookId).subscribe({
      next: () => {
        this.myBooks.update((items) => items.filter((book) => book.id !== bookId));
        this.deleteTarget.set(null);
        this.deleting.set(false);
      },
      error: (err) => {
        this.deleteError.set(this.books.mapBookError(err));
        this.deleting.set(false);
      },
    });
  }

  protected publishBook(bookId: string): void {
    if (this.publishingBookId()) {
      return;
    }

    const book = this.myBooks().find((item) => item.id === bookId);
    if (!book || book.status !== 'draft') {
      return;
    }

    this.publishingBookId.set(bookId);
    this.publishError.set('');

    this.books.publishBook(book).subscribe({
      next: (updated) => {
        this.myBooks.update((items) => items.map((item) => (item.id === bookId ? updated : item)));
        this.publishingBookId.set(null);
      },
      error: (err) => {
        this.publishError.set(this.books.mapBookError(err));
        this.publishingBookId.set(null);
      },
    });
  }
}
