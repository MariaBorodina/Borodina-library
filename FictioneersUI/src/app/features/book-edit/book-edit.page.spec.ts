import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  BookEditPage,
  COVER_VALIDATION_MESSAGE,
  REALM_REQUIRED_MESSAGE,
  SYNOPSIS_REQUIRED_MESSAGE,
  TITLE_REQUIRED_MESSAGE,
} from './book-edit.page';
import { AuthService, SUPABASE_NOT_CONFIGURED_MESSAGE } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { RealmService } from '../../core/services/realm.service';
import { SEED_REALMS } from '../../core/data/realm.seed';
import { Book } from '../../shared/models/library.model';

describe('BookEditPage', () => {
  let fixture: ComponentFixture<BookEditPage>;
  let router: Router;

  const mockBook: Book = {
    id: 'book-edit-1',
    author_id: 'author-1',
    realm_id: '8',
    title: 'Existing Tale',
    synopsis: 'Existing synopsis.',
    cover_path: null,
    cover_size_bytes: 0,
    tags: ['fantasy', 'magic'],
    status: 'draft',
    updated_at: '2025-06-02T00:00:00Z',
    created_at: '2025-06-01T00:00:00Z',
  };

  let getBookById: ReturnType<typeof vi.fn>;
  let updateBookWithVersion: ReturnType<typeof vi.fn>;
  let uploadCover: ReturnType<typeof vi.fn>;
  let mapBookError: ReturnType<typeof vi.fn>;
  let getCoverPublicUrl: ReturnType<typeof vi.fn>;
  let isConfigured: boolean;

  async function createPage(options: { configured?: boolean } = {}): Promise<void> {
    isConfigured = options.configured ?? true;
    getBookById = vi.fn(() => of(mockBook));
    updateBookWithVersion = vi.fn(() => of(mockBook));
    uploadCover = vi.fn(() => of('author-1/book-edit-1/cover.jpg'));
    mapBookError = vi.fn(() => 'Failed to save changes. Please try again.');
    getCoverPublicUrl = vi.fn(() => null);

    await TestBed.configureTestingModule({
      imports: [BookEditPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'book-edit-1' }),
            },
          },
        },
        {
          provide: AuthService,
          useValue: {
            get isConfigured() {
              return isConfigured;
            },
            user: () => ({ id: 'author-1' }),
          },
        },
        {
          provide: BookService,
          useValue: {
            getBookById,
            updateBookWithVersion,
            uploadCover,
            mapBookError,
            getCoverPublicUrl,
          },
        },
        {
          provide: RealmService,
          useValue: {
            getRealms: () => of(SEED_REALMS),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookEditPage);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function getSaveButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  }

  function fillValidForm(): void {
    const el = fixture.nativeElement as HTMLElement;
    const titleInput = el.querySelector('input[name="title"]') as HTMLInputElement;
    const synopsisInput = el.querySelector('textarea[name="synopsis"]') as HTMLTextAreaElement;
    const tagsInput = el.querySelector('input[name="tags"]') as HTMLInputElement;
    const realmSelect = el.querySelector('.realm-select__input') as HTMLSelectElement;

    titleInput.value = 'Updated Tale';
    titleInput.dispatchEvent(new Event('input'));
    synopsisInput.value = 'Updated synopsis.';
    synopsisInput.dispatchEvent(new Event('input'));
    tagsInput.value = 'updated, fantasy';
    tagsInput.dispatchEvent(new Event('input'));
    realmSelect.value = '8';
    realmSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('prefills the form with existing book data', async () => {
    await createPage();
    const el = fixture.nativeElement as HTMLElement;

    const titleInput = el.querySelector('input[name="title"]') as HTMLInputElement;
    const synopsisInput = el.querySelector('textarea[name="synopsis"]') as HTMLTextAreaElement;
    const tagsInput = el.querySelector('input[name="tags"]') as HTMLInputElement;

    expect(titleInput.value).toBe('Existing Tale');
    expect(synopsisInput.value).toBe('Existing synopsis.');
    expect(tagsInput.value).toBe('fantasy, magic');
  });

  it('shows validation errors and does not call update when required fields are empty', async () => {
    await createPage();
    const el = fixture.nativeElement as HTMLElement;
    const titleInput = el.querySelector('input[name="title"]') as HTMLInputElement;
    const synopsisInput = el.querySelector('textarea[name="synopsis"]') as HTMLTextAreaElement;
    const realmSelect = el.querySelector('.realm-select__input') as HTMLSelectElement;

    titleInput.value = '';
    titleInput.dispatchEvent(new Event('input'));
    synopsisInput.value = '';
    synopsisInput.dispatchEvent(new Event('input'));
    realmSelect.value = '';
    realmSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    getSaveButton().click();
    fixture.detectChanges();

    expect(el.textContent).toContain(TITLE_REQUIRED_MESSAGE);
    expect(el.textContent).toContain(SYNOPSIS_REQUIRED_MESSAGE);
    expect(el.textContent).toContain(REALM_REQUIRED_MESSAGE);
    expect(updateBookWithVersion).not.toHaveBeenCalled();
  });

  it('shows cover error and does not call update for invalid cover file', async () => {
    await createPage();
    fillValidForm();

    const fileInput = fixture.nativeElement.querySelector('input[name="cover"]') as HTMLInputElement;
    const gifFile = new File(['x'], 'cover.gif', { type: 'image/gif' });
    Object.defineProperty(fileInput, 'files', { value: [gifFile] });
    fileInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(COVER_VALIDATION_MESSAGE);

    getSaveButton().click();
    fixture.detectChanges();

    expect(updateBookWithVersion).not.toHaveBeenCalled();
  });

  it('updates the book and navigates to books-by-me on successful save', async () => {
    await createPage();
    fillValidForm();

    getSaveButton().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(updateBookWithVersion).toHaveBeenCalledWith('book-edit-1', {
      title: 'Updated Tale',
      synopsis: 'Updated synopsis.',
      realm_id: '8',
      tags: ['updated', 'fantasy'],
      status: 'draft',
      expected_updated_at: '2025-06-02T00:00:00Z',
      force_overwrite: false,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/books-by-me']);
  });

  it('shows mapped service error when update fails', async () => {
    await createPage();
    fillValidForm();

    updateBookWithVersion.mockReturnValue(throwError(() => ({ message: 'duplicate key', code: '23505' })));
    mapBookError.mockReturnValue(
      'You already have a book with this title. Please use a different title.',
    );

    getSaveButton().click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'You already have a book with this title. Please use a different title.',
    );
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('retries with force_overwrite after conflict confirmation', async () => {
    await createPage();
    fillValidForm();

    const conflictError = { code: 'BOOK_CONFLICT', message: 'modified by another session' };
    updateBookWithVersion
      .mockReturnValueOnce(throwError(() => conflictError))
      .mockReturnValueOnce(of(mockBook));
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    getSaveButton().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(updateBookWithVersion).toHaveBeenNthCalledWith(1, 'book-edit-1', {
      title: 'Updated Tale',
      synopsis: 'Updated synopsis.',
      realm_id: '8',
      tags: ['updated', 'fantasy'],
      status: 'draft',
      expected_updated_at: '2025-06-02T00:00:00Z',
      force_overwrite: false,
    });
    expect(updateBookWithVersion).toHaveBeenNthCalledWith(2, 'book-edit-1', {
      title: 'Updated Tale',
      synopsis: 'Updated synopsis.',
      realm_id: '8',
      tags: ['updated', 'fantasy'],
      status: 'draft',
      expected_updated_at: '2025-06-02T00:00:00Z',
      force_overwrite: true,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/books-by-me']);
  });

  it('disables Save and shows notice when Supabase is not configured', async () => {
    await createPage({ configured: false });

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(SUPABASE_NOT_CONFIGURED_MESSAGE);
    expect(getSaveButton().disabled).toBe(true);
  });
});
