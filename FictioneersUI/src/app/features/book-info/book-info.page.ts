import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of, switchMap, tap } from 'rxjs';
import { BookService } from '../../core/services/book.service';
import { IncrementService } from '../../core/services/increment.service';
import { ProfileService } from '../../core/services/profile.service';
import { RealmService } from '../../core/services/realm.service';
import { Book } from '../../shared/models/library.model';
import { Realm } from '../../shared/models/realm.model';

@Component({
  selector: 'app-book-info',
  imports: [RouterLink],
  templateUrl: './book-info.page.html',
})
export class BookInfoPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookService = inject(BookService);
  private readonly profileService = inject(ProfileService);
  private readonly realmService = inject(RealmService);
  private readonly incrementService = inject(IncrementService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly book = signal<Book | undefined>(undefined);
  protected readonly authorName = signal('');
  protected readonly realm = signal<Realm | undefined>(undefined);
  protected readonly loading = signal(true);
  protected readonly readError = signal(false);

  protected readonly coverUrl = computed(() => {
    const currentBook = this.book();
    if (!currentBook) {
      return null;
    }
    return this.bookService.getCoverPublicUrl(currentBook.cover_path, currentBook.updated_at);
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.book.set(undefined);
          this.authorName.set('');
          this.realm.set(undefined);
          this.readError.set(false);
        }),
        switchMap((params) => {
          const id = params.get('id') ?? '';
          return this.bookService.getBookById(id).pipe(
            switchMap((book) => {
              if (!book) {
                return of({ book: undefined as Book | undefined, authorName: '', realm: undefined as Realm | undefined });
              }
              return forkJoin({
                profile: this.profileService.getProfileById(book.author_id),
                realm: this.realmService.getRealmById(book.realm_id),
              }).pipe(
                switchMap(({ profile, realm }) =>
                  of({
                    book,
                    authorName: profile?.display_name ?? '',
                    realm,
                  }),
                ),
              );
            }),
          );
        }),
        tap(({ book, authorName, realm }) => {
          this.book.set(book);
          this.authorName.set(authorName);
          this.realm.set(realm);
          this.loading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: () => {
          this.book.set(undefined);
          this.authorName.set('');
          this.realm.set(undefined);
          this.loading.set(false);
        },
      });
  }

  protected startReading(): void {
    const currentBook = this.book();
    if (!currentBook) {
      return;
    }

    this.readError.set(false);
    this.incrementService.getIncrementsByBook(currentBook.id).subscribe({
      next: (increments) => {
        if (increments.length > 0) {
          void this.router.navigate(['/books', currentBook.id, 'read']);
          return;
        }
        this.readError.set(true);
      },
      error: () => {
        this.readError.set(true);
      },
    });
  }
}
