import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  BookNewPage,
  COVER_VALIDATION_MESSAGE,
  REALM_REQUIRED_MESSAGE,
  SYNOPSIS_REQUIRED_MESSAGE,
  TITLE_REQUIRED_MESSAGE,
} from './book-new.page';
import { AuthService, SUPABASE_NOT_CONFIGURED_MESSAGE } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { RealmService } from '../../core/services/realm.service';
import { SEED_REALMS } from '../../core/data/realm.seed';
import { Book } from '../../shared/models/library.model';

describe('BookNewPage', () => {
  let fixture: ComponentFixture<BookNewPage>;
  let router: Router;

  const mockBook: Book = {
    id: 'book-new-1',
    author_id: 'author-1',
    realm_id: '8',
    title: 'New Tale',
    synopsis: 'A synopsis.',
    cover_path: null,
    cover_size_bytes: 0,
    tags: ['fantasy'],
    status: 'draft',
    updated_at: '2025-06-01T00:00:00Z',
    created_at: '2025-06-01T00:00:00Z',
  };

  let createBook: ReturnType<typeof vi.fn>;
  let uploadCover: ReturnType<typeof vi.fn>;
  let updateBookWithVersion: ReturnType<typeof vi.fn>;
  let mapBookError: ReturnType<typeof vi.fn>;
  let isConfigured: boolean;

  async function createPage(options: { configured?: boolean } = {}): Promise<void> {
    createBook = vi.fn(() => of(mockBook));
    uploadCover = vi.fn(() => of('author-1/book-new-1/cover.jpg'));
    updateBookWithVersion = vi.fn(() => of(mockBook));
    mapBookError = vi.fn((error: unknown) => {
      if (error instanceof Error) {
        return error.message;
      }
      return 'Failed to save changes. Please try again.';
    });
    isConfigured = options.configured ?? true;

    await TestBed.configureTestingModule({
      imports: [BookNewPage],
      providers: [
        provideRouter([]),
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
            createBook,
            uploadCover,
            updateBookWithVersion,
            mapBookError,
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

    fixture = TestBed.createComponent(BookNewPage);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture.detectChanges();
  }

  function getSaveButton(): HTMLButtonElement {
    const buttons = fixture.nativeElement.querySelectorAll('button[type="submit"]');
    return buttons[0] as HTMLButtonElement;
  }

  function fillValidForm(): void {
    const el = fixture.nativeElement as HTMLElement;
    const titleInput = el.querySelector('input[name="title"]') as HTMLInputElement;
    const synopsisInput = el.querySelector('textarea[name="synopsis"]') as HTMLTextAreaElement;
    const tagsInput = el.querySelector('input[name="tags"]') as HTMLInputElement;
    const realmSelect = el.querySelector('.realm-select__input') as HTMLSelectElement;

    titleInput.value = 'New Tale';
    titleInput.dispatchEvent(new Event('input'));
    synopsisInput.value = 'A synopsis.';
    synopsisInput.dispatchEvent(new Event('input'));
    tagsInput.value = 'fantasy';
    tagsInput.dispatchEvent(new Event('input'));
    realmSelect.value = '8';
    realmSelect.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  it('should render all form fields and Save/Cancel buttons', async () => {
    await createPage();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('input[name="title"]')).toBeTruthy();
    expect(el.querySelector('textarea[name="synopsis"]')).toBeTruthy();
    expect(el.querySelector('app-realm-select')).toBeTruthy();
    expect(el.querySelector('input[name="cover"]')).toBeTruthy();
    expect(el.querySelector('input[name="tags"]')).toBeTruthy();
    expect(getSaveButton().textContent).toContain('Save');

    const cancelLink = el.querySelector('a.btn-secondary');
    expect(cancelLink?.textContent).toContain('Cancel');
    expect(cancelLink?.getAttribute('href')).toContain('/books-by-me');
  });

  it('should show inline errors and not call createBook when title and synopsis are empty', async () => {
    await createPage();
    getSaveButton().click();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(TITLE_REQUIRED_MESSAGE);
    expect(el.textContent).toContain(SYNOPSIS_REQUIRED_MESSAGE);
    expect(el.textContent).toContain(REALM_REQUIRED_MESSAGE);
    expect(createBook).not.toHaveBeenCalled();
  });

  it('should show cover error and not call createBook for invalid cover file', async () => {
    await createPage();
    fillValidForm();

    const fileInput = fixture.nativeElement.querySelector(
      'input[name="cover"]',
    ) as HTMLInputElement;
    const gifFile = new File(['x'], 'cover.gif', { type: 'image/gif' });
    Object.defineProperty(fileInput, 'files', { value: [gifFile] });
    fileInput.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(COVER_VALIDATION_MESSAGE);

    getSaveButton().click();
    fixture.detectChanges();

    expect(createBook).not.toHaveBeenCalled();
  });

  it('should call createBook and navigate to books-by-me on successful save', async () => {
    await createPage();
    fillValidForm();

    getSaveButton().click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(createBook).toHaveBeenCalledWith('author-1', {
      title: 'New Tale',
      synopsis: 'A synopsis.',
      realm_id: '8',
      tags: ['fantasy'],
      status: 'draft',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/books-by-me']);
  });

  it('should show duplicate title error from mapBookError', async () => {
    await createPage();
    fillValidForm();

    const duplicateMessage =
      'You already have a book with this title. Please use a different title.';
    createBook.mockReturnValue(
      throwError(() => ({ message: 'duplicate key', code: '23505' })),
    );
    mapBookError.mockReturnValue(duplicateMessage);

    getSaveButton().click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(duplicateMessage);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should disable Save and show notice when Supabase is not configured', async () => {
    await createPage({ configured: false });

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain(SUPABASE_NOT_CONFIGURED_MESSAGE);
    expect(getSaveButton().disabled).toBe(true);
  });
});
