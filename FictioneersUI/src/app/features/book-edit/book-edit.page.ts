import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuthService, SUPABASE_NOT_CONFIGURED_MESSAGE } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { RealmSelectComponent } from '../../shared/components/realm-select/realm-select.component';
import { Book } from '../../shared/models/library.model';

const MAX_COVER_BYTES = 5_242_880;
const ALLOWED_COVER_TYPES = new Set(['image/jpeg', 'image/png']);
const OVERWRITE_CONFIRMATION_MESSAGE =
  'This book was modified by another session. Do you want to overwrite those changes?';
export const TITLE_REQUIRED_MESSAGE = 'Title is required';
export const SYNOPSIS_REQUIRED_MESSAGE = 'Synopsis is required';
export const REALM_REQUIRED_MESSAGE = 'Please select a realm';
export const COVER_VALIDATION_MESSAGE = 'File must be JPG/PNG and under 5MB';

@Component({
  selector: 'app-book-edit',
  imports: [FormsModule, RouterLink, RealmSelectComponent],
  templateUrl: './book-edit.page.html',
})
export class BookEditPage implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly books = inject(BookService);
  private readonly router = inject(Router);

  protected title = '';
  protected synopsis = '';
  protected realmId = '';
  protected tagsInput = '';
  protected coverFile: File | null = null;
  protected coverFileName = '';

  protected readonly titleError = signal('');
  protected readonly synopsisError = signal('');
  protected readonly realmError = signal('');
  protected readonly coverError = signal('');
  protected readonly formError = signal('');
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly saving = signal(false);
  protected readonly coverPreviewUrl = signal<string | null>(null);
  protected readonly supabaseNotConfiguredMessage = SUPABASE_NOT_CONFIGURED_MESSAGE;

  private readonly book = signal<Book | null>(null);
  private localCoverPreviewUrl: string | null = null;

  constructor() {
    this.loadBook();
  }

  protected get isConfigured(): boolean {
    return this.auth.isConfigured;
  }

  ngOnDestroy(): void {
    this.revokeLocalCoverPreview();
  }

  protected onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.coverError.set('');
    this.coverFile = null;
    this.coverFileName = '';
    this.revokeLocalCoverPreview();
    this.coverPreviewUrl.set(this.getExistingCoverUrl());

    if (!file) {
      return;
    }

    if (!ALLOWED_COVER_TYPES.has(file.type) || file.size > MAX_COVER_BYTES) {
      this.coverError.set(COVER_VALIDATION_MESSAGE);
      input.value = '';
      return;
    }

    this.coverFile = file;
    this.coverFileName = file.name;
    this.localCoverPreviewUrl = URL.createObjectURL(file);
    this.coverPreviewUrl.set(this.localCoverPreviewUrl);
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.clearErrors();

    if (!this.validate()) {
      return;
    }

    this.executeSave(false);
  }

  private loadBook(): void {
    const bookId = this.route.snapshot.paramMap.get('id');
    if (!bookId) {
      this.loading.set(false);
      this.notFound.set(true);
      return;
    }

    this.books.getBookById(bookId).subscribe({
      next: (book) => {
        this.loading.set(false);
        if (!book) {
          this.notFound.set(true);
          return;
        }
        this.book.set(book);
        this.title = book.title;
        this.synopsis = book.synopsis;
        this.realmId = book.realm_id;
        this.tagsInput = book.tags.join(', ');
        this.coverPreviewUrl.set(this.getExistingCoverUrl());
      },
      error: () => {
        this.loading.set(false);
        this.notFound.set(true);
      },
    });
  }

  private executeSave(forceOverwrite: boolean): void {
    const currentBook = this.book();
    if (!currentBook) {
      return;
    }

    const authorId = this.auth.user()?.id;
    if (!authorId) {
      this.formError.set('You must be signed in to save changes.');
      return;
    }

    this.saving.set(true);
    const tags = this.parseTags();

    const save$ = this.coverFile
      ? this.books.uploadCover(authorId, currentBook.id, this.coverFile).pipe(
          switchMap((coverPath) =>
            this.books.updateBookWithVersion(currentBook.id, {
              title: this.title.trim(),
              synopsis: this.synopsis.trim(),
              realm_id: this.realmId,
              tags,
              status: currentBook.status,
              expected_updated_at: currentBook.updated_at,
              cover_path: coverPath,
              cover_size_bytes: this.coverFile!.size,
              force_overwrite: forceOverwrite,
            }),
          ),
        )
      : this.books.updateBookWithVersion(currentBook.id, {
          title: this.title.trim(),
          synopsis: this.synopsis.trim(),
          realm_id: this.realmId,
          tags,
          status: currentBook.status,
          expected_updated_at: currentBook.updated_at,
          force_overwrite: forceOverwrite,
        });

    save$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/books-by-me']);
      },
      error: (err) => {
        this.saving.set(false);
        if (this.isConflictError(err) && !forceOverwrite && window.confirm(OVERWRITE_CONFIRMATION_MESSAGE)) {
          this.executeSave(true);
          return;
        }
        this.formError.set(this.books.mapBookError(err));
      },
    });
  }

  private validate(): boolean {
    let valid = true;

    if (!this.title.trim()) {
      this.titleError.set(TITLE_REQUIRED_MESSAGE);
      valid = false;
    }

    if (!this.synopsis.trim()) {
      this.synopsisError.set(SYNOPSIS_REQUIRED_MESSAGE);
      valid = false;
    }

    if (!this.realmId) {
      this.realmError.set(REALM_REQUIRED_MESSAGE);
      valid = false;
    }

    if (this.coverFile) {
      if (!ALLOWED_COVER_TYPES.has(this.coverFile.type) || this.coverFile.size > MAX_COVER_BYTES) {
        this.coverError.set(COVER_VALIDATION_MESSAGE);
        valid = false;
      }
    } else if (this.coverError()) {
      valid = false;
    }

    return valid;
  }

  private parseTags(): string[] {
    return this.tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  private clearErrors(): void {
    this.titleError.set('');
    this.synopsisError.set('');
    this.realmError.set('');
    this.formError.set('');
  }

  private isConflictError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }
    const err = error as { message?: string; code?: string };
    return err.code === 'BOOK_CONFLICT' || Boolean(err.message?.includes('modified by another session'));
  }

  private getExistingCoverUrl(): string | null {
    return this.books.getCoverPublicUrl(this.book()?.cover_path ?? null);
  }

  private revokeLocalCoverPreview(): void {
    if (this.localCoverPreviewUrl) {
      URL.revokeObjectURL(this.localCoverPreviewUrl);
      this.localCoverPreviewUrl = null;
    }
  }
}
