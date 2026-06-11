import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { BookInfoPage } from './book-info.page';
import { BookService } from '../../core/services/book.service';
import { ProfileService } from '../../core/services/profile.service';
import { RealmService } from '../../core/services/realm.service';
import { IncrementService } from '../../core/services/increment.service';
import { Book, Increment, Profile } from '../../shared/models/library.model';

describe('BookInfoPage', () => {
  let fixture: ComponentFixture<BookInfoPage>;
  let paramMap$: BehaviorSubject<ParamMap>;
  let router: Router;

  const mockRealm = {
    id: '8',
    slug: 'dragon-realms',
    name: 'Dragon Realms',
    description: 'Ancient wyrms and fire-bound legends.',
    bookCount: 2,
  };

  const mockProfile: Profile = {
    id: 'seed-author-1',
    display_name: 'Amara Singh',
    is_author: true,
    storage_bytes_used: 0,
    created_at: '2025-06-01T00:00:00Z',
  };

  const mockBook: Book = {
    id: 'seed-book-1',
    author_id: 'seed-author-1',
    realm_id: '8',
    title: 'Ember of the Last Dragon',
    synopsis: 'A dragon rider discovers the final egg of an extinct bloodline.',
    cover_path: null,
    cover_size_bytes: 0,
    tags: ['dragons', 'fantasy'],
    status: 'published',
    updated_at: '2025-06-01T00:00:00Z',
    created_at: '2025-06-01T00:00:00Z',
  };

  const mockBook2: Book = {
    ...mockBook,
    id: 'seed-book-2',
    title: 'Hoard of the Sky Wyrm',
    synopsis: 'Treasure hunters race to a floating citadel.',
    tags: ['dragons', 'adventure'],
  };

  const mockIncrement: Increment = {
    id: 'seed-increment-1',
    book_id: 'seed-book-1',
    title: 'Chapter 1',
    file_path: 'seed-author-1/seed-book-1/seed-increment-1.txt',
    file_format: 'txt',
    file_size_bytes: 1024,
    sort_order: 0,
    created_at: '2025-06-01T00:00:00Z',
  };

  async function createPage(options: {
    id?: string;
    book?: Book | undefined;
    delayBook?: boolean;
    increments?: Increment[];
    incrementError?: boolean;
  }): Promise<void> {
    const id = options.id ?? 'seed-book-1';
    paramMap$ = new BehaviorSubject(convertToParamMap({ id }));
    const resolvedBook = options.book;

    await TestBed.configureTestingModule({
      imports: [BookInfoPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        {
          provide: BookService,
          useValue: {
            getBookById: (bookId: string) => {
              if (options.delayBook) {
                return NEVER;
              }
              if (resolvedBook !== undefined) {
                return of(resolvedBook);
              }
              if (bookId === 'seed-book-1') {
                return of(mockBook);
              }
              if (bookId === 'seed-book-2') {
                return of(mockBook2);
              }
              return of(undefined);
            },
            getCoverPublicUrl: () => null,
          },
        },
        {
          provide: ProfileService,
          useValue: {
            getProfileById: () => of(mockProfile),
          },
        },
        {
          provide: RealmService,
          useValue: {
            getRealmById: () => of(mockRealm),
          },
        },
        {
          provide: IncrementService,
          useValue: {
            getIncrementsByBook: () => {
              if (options.incrementError) {
                return NEVER;
              }
              return of(options.increments ?? [mockIncrement]);
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookInfoPage);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createPage({});
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show loading skeleton', async () => {
    TestBed.resetTestingModule();
    await createPage({ delayBook: true });

    const skeleton = fixture.nativeElement.querySelector('.book-info-skeleton');
    expect(skeleton?.getAttribute('aria-busy')).toBe('true');
    expect(skeleton?.getAttribute('aria-label')).toBe('Loading book');
  });

  it('should render title, author, synopsis, and tags', () => {
    expect(fixture.nativeElement.textContent).toContain('Ember of the Last Dragon');
    expect(fixture.nativeElement.textContent).toContain('Amara Singh');
    expect(fixture.nativeElement.textContent).toContain(
      'A dragon rider discovers the final egg of an extinct bloodline.',
    );
    expect(fixture.nativeElement.textContent).toContain('dragons');
    expect(fixture.nativeElement.textContent).toContain('fantasy');
  });

  it('should render cover placeholder when no cover_path', () => {
    const placeholder = fixture.nativeElement.querySelector('.book-cover--placeholder');
    expect(placeholder).toBeTruthy();
  });

  it('should render Start reading button', () => {
    const button = fixture.nativeElement.querySelector('.btn-primary');
    expect(button?.textContent?.trim()).toBe('Start reading');
  });

  it('should show not found for unknown id', async () => {
    TestBed.resetTestingModule();
    await createPage({ id: 'unknown-id', book: undefined });

    const heading = fixture.nativeElement.querySelector('h1.page-title');
    expect(heading?.textContent).toContain('Book not found');
  });

  it('should reload when id param changes', async () => {
    TestBed.resetTestingModule();
    paramMap$ = new BehaviorSubject(convertToParamMap({ id: 'seed-book-1' }));

    await TestBed.configureTestingModule({
      imports: [BookInfoPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        {
          provide: BookService,
          useValue: {
            getBookById: (bookId: string) =>
              bookId === 'seed-book-2' ? of(mockBook2) : of(mockBook),
            getCoverPublicUrl: () => null,
          },
        },
        {
          provide: ProfileService,
          useValue: { getProfileById: () => of(mockProfile) },
        },
        {
          provide: RealmService,
          useValue: { getRealmById: () => of(mockRealm) },
        },
        {
          provide: IncrementService,
          useValue: { getIncrementsByBook: () => of([mockIncrement]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookInfoPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ember of the Last Dragon');

    paramMap$.next(convertToParamMap({ id: 'seed-book-2' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Hoard of the Sky Wyrm');
    expect(fixture.nativeElement.textContent).not.toContain('Ember of the Last Dragon');
  });

  it('should show US-R-04 error when no increments', async () => {
    TestBed.resetTestingModule();
    await createPage({ increments: [] });
    router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const button = fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('.book-info__error');
    expect(error?.textContent).toContain('Something went wrong. Please try again later.');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to read when increments exist', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');

    const button = fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/books', 'seed-book-1', 'read']);
  });
});
