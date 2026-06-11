import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, tap } from 'rxjs';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../shared/models/library.model';

@Component({
  selector: 'app-reading',
  imports: [RouterLink],
  templateUrl: './reading.page.html',
})
export class ReadingPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bookService = inject(BookService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly book = signal<Book | undefined>(undefined);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.book.set(undefined);
        }),
        switchMap((params) => {
          const id = params.get('id') ?? '';
          return this.bookService.getBookById(id);
        }),
        tap((book) => {
          this.book.set(book);
          this.loading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: () => {
          this.book.set(undefined);
          this.loading.set(false);
        },
      });
  }
}
