import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of, switchMap, tap } from 'rxjs';
import { BookService } from '../../core/services/book.service';
import { RealmService } from '../../core/services/realm.service';
import { BookCardComponent } from '../../shared/components/book-card/book-card.component';
import { Book } from '../../shared/models/library.model';
import { Realm } from '../../shared/models/realm.model';

@Component({
  selector: 'app-realm-detail',
  imports: [RouterLink, BookCardComponent],
  templateUrl: './realm-detail.page.html',
})
export class RealmDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly realmService = inject(RealmService);
  private readonly bookService = inject(BookService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly realm = signal<Realm | undefined>(undefined);
  protected readonly books = signal<Book[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingBooks = signal(true);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.loadingBooks.set(true);
          this.realm.set(undefined);
          this.books.set([]);
        }),
        switchMap((params) => {
          const slug = params.get('slug') ?? '';
          return this.realmService.getRealmBySlug(slug);
        }),
        tap((realm) => {
          this.realm.set(realm);
          this.loading.set(false);
        }),
        switchMap((realm) => {
          if (!realm) {
            this.loadingBooks.set(false);
            return of([] as Book[]);
          }
          return this.bookService.getBooksByRealm(realm.id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((books) => {
        this.books.set(books);
        this.loadingBooks.set(false);
      });
  }
}
