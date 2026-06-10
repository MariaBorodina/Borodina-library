import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../shared/models/library.model';

@Component({
  selector: 'app-books-by-me',
  templateUrl: './books-by-me.page.html',
})
export class BooksByMePage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly books = inject(BookService);

  protected readonly myBooks = signal<Book[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    const userId = this.auth.user()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.books.getMyBooks(userId).subscribe({
      next: (items) => {
        this.myBooks.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
