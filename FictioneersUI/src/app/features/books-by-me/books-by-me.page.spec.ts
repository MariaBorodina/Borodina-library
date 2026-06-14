import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NEVER, of, throwError } from 'rxjs';
import { BooksByMePage, DELETE_CONFIRM_MESSAGE } from './books-by-me.page';
import { AuthService } from '../../core/services/auth.service';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../shared/models/library.model';

describe('BooksByMePage', () => {
  let fixture: ComponentFixture<BooksByMePage>;

  const mockUser = { id: 'author-1' };

  const mockBooks: Book[] = [
    {
      id: 'book-1',
      author_id: 'author-1',
      realm_id: '8',
      title: 'Ember of the Last Dragon',
      synopsis: 'A dragon tale.',
      cover_path: null,
      cover_size_bytes: 0,
      tags: [],
      status: 'draft',
      updated_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
    },
    {
      id: 'book-2',
      author_id: 'author-1',
      realm_id: '8',
      title: 'Starfall Chronicles',
      synopsis: 'A sci-fi tale.',
      cover_path: null,
      cover_size_bytes: 0,
      tags: [],
      status: 'published',
      updated_at: '2025-01-02T00:00:00Z',
      created_at: '2025-01-02T00:00:00Z',
    },
  ];

  let deleteBookIfEmpty: ReturnType<typeof vi.fn>;

  async function createPage(options: {
    books?: Book[];
    delayBooks?: boolean;
    loadError?: boolean;
    userId?: string | null;
  }): Promise<void> {
    deleteBookIfEmpty = vi.fn(() => of(undefined));

    await TestBed.configureTestingModule({
      imports: [BooksByMePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            user: () => (options.userId === null ? null : { id: options.userId ?? 'author-1' }),
          },
        },
        {
          provide: BookService,
          useValue: {
            getMyBooks: () => {
              if (options.loadError) {
                return throwError(() => new Error('load failed'));
              }
              if (options.delayBooks) {
                return NEVER;
              }
              return of(options.books ?? mockBooks);
            },
            deleteBookIfEmpty,
            mapBookError: (error: unknown) => {
              if (error instanceof Error) {
                return error.message;
              }
              return 'Failed to save changes. Please try again.';
            },
            getCoverPublicUrl: () => null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BooksByMePage);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createPage({});
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render page title', () => {
    const heading = fixture.nativeElement.querySelector('h1.page-title');
    expect(heading?.textContent).toContain('Books by me');
  });

  it('should render author book cards for populated list', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-author-book-card');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Ember of the Last Dragon');
    expect(fixture.nativeElement.textContent).toContain('Starfall Chronicles');
  });

  it('should show loading skeleton while books load', async () => {
    TestBed.resetTestingModule();
    await createPage({ delayBooks: true });

    const grid = fixture.nativeElement.querySelector('[aria-label="Loading your books"]');
    expect(grid?.getAttribute('aria-busy')).toBe('true');

    const skeletons = fixture.nativeElement.querySelectorAll('.book-card--skeleton');
    expect(skeletons.length).toBe(6);
  });

  it('should show Add new book button while books load', async () => {
    TestBed.resetTestingModule();
    await createPage({ delayBooks: true });

    const addLink = fixture.nativeElement.querySelector('.section-header a.btn-primary');
    expect(addLink?.textContent).toContain('Add new book');
    expect(addLink?.getAttribute('href')).toContain('/books/new');
  });

  it('should show FR-A-02 empty state when author has no books', async () => {
    TestBed.resetTestingModule();
    await createPage({ books: [] });

    const empty = fixture.nativeElement.querySelector('.author-empty');
    expect(empty).toBeTruthy();
    expect(empty?.textContent).toContain("You haven't added any books yet. Click 'Add new book' to get started.");

    const link = fixture.nativeElement.querySelector('.author-empty a');
    expect(link?.getAttribute('href')).toContain('/books/new');
  });

  it('should show error message when load fails', async () => {
    TestBed.resetTestingModule();
    await createPage({ loadError: true });

    const alert = fixture.nativeElement.querySelector('.alert-error');
    expect(alert?.textContent).toContain('Failed to load your books. Please refresh.');
  });

  it('should show delete confirmation when Delete is clicked', () => {
    const deleteButton = fixture.nativeElement.querySelector('.btn-danger');
    deleteButton?.click();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.confirm-dialog');
    expect(dialog).toBeTruthy();
    expect(dialog?.textContent).toContain(DELETE_CONFIRM_MESSAGE);
  });

  it('should cancel delete and keep book when Cancel is clicked', () => {
    fixture.nativeElement.querySelector('.btn-danger')?.click();
    fixture.detectChanges();

    const cancelButton = fixture.nativeElement.querySelector('.confirm-dialog .btn-secondary');
    cancelButton?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.confirm-dialog')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-author-book-card').length).toBe(2);
    expect(deleteBookIfEmpty).not.toHaveBeenCalled();
  });

  it('should remove book from list after successful delete', () => {
    fixture.nativeElement.querySelector('.btn-danger')?.click();
    fixture.detectChanges();

    const confirmButton = [...fixture.nativeElement.querySelectorAll('.confirm-dialog button')].find(
      (button: HTMLButtonElement) => button.textContent?.includes('Confirm delete'),
    );
    confirmButton?.click();
    fixture.detectChanges();

    expect(deleteBookIfEmpty).toHaveBeenCalledWith('book-1');
    expect(fixture.nativeElement.querySelectorAll('app-author-book-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).not.toContain('Ember of the Last Dragon');
  });

  it('should show FR-A-08 error when delete is blocked by increments', async () => {
    TestBed.resetTestingModule();
    deleteBookIfEmpty = vi.fn(() =>
      throwError(() => new Error('Cannot delete book. Please remove all increments first.')),
    );

    await TestBed.configureTestingModule({
      imports: [BooksByMePage],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: { user: () => mockUser },
        },
        {
          provide: BookService,
          useValue: {
            getMyBooks: () => of(mockBooks),
            deleteBookIfEmpty,
            mapBookError: (error: unknown) =>
              error instanceof Error ? error.message : 'Failed to save changes. Please try again.',
            getCoverPublicUrl: () => null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BooksByMePage);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('.btn-danger')?.click();
    fixture.detectChanges();

    const confirmButton = [...fixture.nativeElement.querySelectorAll('.confirm-dialog button')].find(
      (button: HTMLButtonElement) => button.textContent?.includes('Confirm delete'),
    );
    confirmButton?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Cannot delete book. Please remove all increments first.',
    );
    expect(fixture.nativeElement.querySelectorAll('app-author-book-card').length).toBe(2);
  });
});
