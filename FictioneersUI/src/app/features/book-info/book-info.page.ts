import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../shared/models/library.model';

@Component({
  selector: 'app-book-info',
  imports: [RouterLink],
  templateUrl: './book-info.page.html',
})
export class BookInfoPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookService = inject(BookService);

  protected readonly book = signal<Book | undefined>(undefined);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';

    this.bookService.getBookById(id).subscribe({
      next: (book) => {
        this.book.set(book);
        this.loading.set(false);
      },
      error: () => {
        this.book.set(undefined);
        this.loading.set(false);
      },
    });
  }
}
