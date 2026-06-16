import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { of, switchMap } from 'rxjs';
import {
  AuthService,
  SUPABASE_NOT_CONFIGURED_MESSAGE,
} from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../shared/models/library.model';
import { RealmSelectComponent } from '../../shared/components/realm-select/realm-select.component';

export const TITLE_REQUIRED_MESSAGE = 'Title is required';
export const SYNOPSIS_REQUIRED_MESSAGE = 'Synopsis is required';
export const REALM_REQUIRED_MESSAGE = 'Please select a realm';
export const COVER_VALIDATION_MESSAGE = 'File must be JPG/PNG and under 5MB';

const MAX_COVER_BYTES = 5_242_880;
const ALLOWED_COVER_TYPES = new Set(['image/jpeg', 'image/png']);

@Component({
  selector: 'app-book-new',
  imports: [FormsModule, RouterLink, RealmSelectComponent],
  templateUrl: './book-new.page.html',
})
export class BookNewPage implements OnDestroy {
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
  protected readonly saving = signal(false);
  protected readonly coverPreviewUrl = signal<string | null>(null);
  protected readonly createdBook = signal<Book | null>(null);

  protected get isConfigured(): boolean {
    return this.auth.isConfigured;
  }
  protected readonly supabaseNotConfiguredMessage = SUPABASE_NOT_CONFIGURED_MESSAGE;

  ngOnDestroy(): void {
    this.revokeCoverPreview();
  }

  protected onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    this.coverError.set('');
    this.revokeCoverPreview();
    this.coverFile = null;
    this.coverFileName = '';

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
    this.coverPreviewUrl.set(URL.createObjectURL(file));
  }

  protected save(event: Event): void {
    event.preventDefault();
    this.clearErrors();

    if (!this.validate()) {
      return;
    }

    const authorId = this.auth.user()?.id;
    if (!authorId) {
      return;
    }

    this.saving.set(true);

    const tags = this.parseTags();
    const existing = this.createdBook();

    const save$ = existing
      ? this.attachCoverIfNeeded(authorId, existing, tags)
      : this.books
          .createBook(authorId, {
            title: this.title.trim(),
            synopsis: this.synopsis.trim(),
            realm_id: this.realmId,
            tags,
            status: 'draft',
          })
          .pipe(
            switchMap((book) => {
              this.createdBook.set(book);
              return this.attachCoverIfNeeded(authorId, book, tags);
            }),
          );

    save$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigate(['/books-by-me']);
      },
      error: (err) => {
        this.saving.set(false);
        this.formError.set(this.books.mapBookError(err));
      },
    });
  }

  private attachCoverIfNeeded(authorId: string, book: Book, tags: string[]) {
    if (!this.coverFile) {
      return of(book);
    }

    const file = this.coverFile;
    return this.books.uploadCover(authorId, book.id, file).pipe(
      switchMap((coverPath) =>
        this.books.updateBookWithVersion(book.id, {
          title: this.title.trim(),
          synopsis: this.synopsis.trim(),
          realm_id: this.realmId,
          tags,
          status: 'draft',
          expected_updated_at: book.updated_at,
          cover_path: coverPath,
          cover_size_bytes: file.size,
        }),
      ),
    );
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
      if (
        !ALLOWED_COVER_TYPES.has(this.coverFile.type) ||
        this.coverFile.size > MAX_COVER_BYTES
      ) {
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

  private revokeCoverPreview(): void {
    const url = this.coverPreviewUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.coverPreviewUrl.set(null);
  }
}
