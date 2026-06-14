import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, switchMap, tap } from 'rxjs';
import { SearchService } from '../../core/services/search.service';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { Book } from '../../shared/models/library.model';

@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink, BookCardComponent],
  templateUrl: './search.page.html',
})
export class SearchPage implements OnInit {
  private readonly searchService = inject(SearchService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchTrigger = new Subject<string>();

  query = '';
  protected readonly results = signal<Book[]>([]);
  protected readonly loading = signal(false);
  protected readonly searched = signal(false);
  protected readonly error = signal(false);
  protected readonly lastQuery = signal('');

  ngOnInit(): void {
    this.searchTrigger
      .pipe(
        tap((trimmed) => {
          this.loading.set(true);
          this.searched.set(true);
          this.error.set(false);
          this.lastQuery.set(trimmed);
          this.results.set([]);
        }),
        switchMap((trimmed) => this.searchService.searchBooks(trimmed)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (books) => {
          this.results.set(books);
          this.loading.set(false);
        },
        error: () => {
          this.results.set([]);
          this.loading.set(false);
          this.error.set(true);
        },
      });

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const q = params.get('q')?.trim() ?? '';
      if (q && q !== this.lastQuery()) {
        this.query = q;
        this.searchTrigger.next(q);
      }
    });
  }

  search(event?: Event): void {
    event?.preventDefault();
    const trimmed = this.query.trim();
    if (!trimmed) {
      return;
    }

    void this.router.navigate([], {
      queryParams: { q: trimmed },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.searchTrigger.next(trimmed);
  }

  retrySearch(): void {
    const q = this.lastQuery();
    if (q) {
      this.searchTrigger.next(q);
    }
  }
}
