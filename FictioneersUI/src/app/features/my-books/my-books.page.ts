import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { Book } from '../../shared/models/library.model';
import { LibraryService } from '../../core/services/library.service';

@Component({
  selector: 'app-my-books',
  imports: [RouterLink, BookCardComponent],
  templateUrl: './my-books.page.html',
})
export class MyBooksPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly library = inject(LibraryService);

  protected readonly books = signal<Book[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    const userId = this.auth.user()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }

    this.library.getSavedBooks(userId).subscribe({
      next: (books) => {
        this.books.set(books);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
