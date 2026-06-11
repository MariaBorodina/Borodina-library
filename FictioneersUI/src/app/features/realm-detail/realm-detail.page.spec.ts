import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, NEVER, of } from 'rxjs';
import { RealmDetailPage } from './realm-detail.page';
import { RealmService } from '../../core/services/realm.service';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../shared/models/library.model';

describe('RealmDetailPage', () => {
  let fixture: ComponentFixture<RealmDetailPage>;
  let paramMap$: BehaviorSubject<ParamMap>;

  const mockRealm = {
    id: '8',
    slug: 'dragon-realms',
    name: 'Dragon Realms',
    description: 'Ancient wyrms and fire-bound legends.',
    bookCount: 2,
  };

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
      status: 'published',
      updated_at: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
    },
  ];

  const emptyRealm = {
    id: '9',
    slug: 'time-travel-archives',
    name: 'Time Travel Archives',
    description: 'Chronicles that bend time.',
    bookCount: 0,
  };

  async function createPage(options: {
    slug?: string;
    realm?: typeof mockRealm | typeof emptyRealm | null;
    books?: Book[];
    delayRealm?: boolean;
    delayBooks?: boolean;
  }): Promise<void> {
    const slug = options.slug ?? 'dragon-realms';
    paramMap$ = new BehaviorSubject(convertToParamMap({ slug }));
    const resolvedRealm =
      options.realm === null ? undefined : (options.realm ?? mockRealm);

    await TestBed.configureTestingModule({
      imports: [RealmDetailPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        {
          provide: RealmService,
          useValue: {
            getRealmBySlug: () =>
              options.delayRealm ? NEVER : of(resolvedRealm),
          },
        },
        {
          provide: BookService,
          useValue: {
            getBooksByRealm: () =>
              options.delayBooks ? NEVER : of(options.books ?? mockBooks),
            getCoverPublicUrl: () => null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RealmDetailPage);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createPage({});
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render realm name as heading', () => {
    const heading = fixture.nativeElement.querySelector('h1.page-title');
    expect(heading?.textContent).toContain('Dragon Realms');
  });

  it('should render book cards for realm with books', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-book-card');
    expect(cards.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Ember of the Last Dragon');
  });

  it('should show US-R-03 empty state when realm has no books', async () => {
    TestBed.resetTestingModule();
    await createPage({ slug: 'time-travel-archives', realm: emptyRealm, books: [] });

    const empty = fixture.nativeElement.querySelector('.realm-empty');
    expect(empty).toBeTruthy();
    expect(empty?.textContent).toContain('No books in this realm yet. Check back soon!');

    const link = fixture.nativeElement.querySelector('.realm-empty a');
    expect(link?.getAttribute('href')).toContain('/realms');
  });

  it('should show not found for unknown realm', async () => {
    TestBed.resetTestingModule();
    await createPage({ slug: 'unknown-realm', realm: null, books: [] });

    const heading = fixture.nativeElement.querySelector('h1.page-title');
    expect(heading?.textContent).toContain('Realm not found');
  });

  it('should show realm loading skeleton', async () => {
    TestBed.resetTestingModule();
    await createPage({ delayRealm: true });

    const skeleton = fixture.nativeElement.querySelector('.realm-detail-skeleton');
    expect(skeleton?.getAttribute('aria-busy')).toBe('true');
  });

  it('should show book loading skeleton while books load', async () => {
    TestBed.resetTestingModule();
    await createPage({ delayBooks: true });

    const grid = fixture.nativeElement.querySelector('[aria-label="Loading books"]');
    expect(grid?.getAttribute('aria-busy')).toBe('true');

    const skeletons = fixture.nativeElement.querySelectorAll('.book-card--skeleton');
    expect(skeletons.length).toBe(6);
  });

  it('should reload when route slug changes', async () => {
    TestBed.resetTestingModule();
    paramMap$ = new BehaviorSubject(convertToParamMap({ slug: 'dragon-realms' }));

    await TestBed.configureTestingModule({
      imports: [RealmDetailPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
        {
          provide: RealmService,
          useValue: {
            getRealmBySlug: (slug: string) =>
              slug === 'time-travel-archives' ? of(emptyRealm) : of(mockRealm),
          },
        },
        {
          provide: BookService,
          useValue: {
            getBooksByRealm: (realmId: string) => of(realmId === '9' ? [] : mockBooks),
            getCoverPublicUrl: () => null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RealmDetailPage);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Dragon Realms');

    paramMap$.next(convertToParamMap({ slug: 'time-travel-archives' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Time Travel Archives');
    expect(fixture.nativeElement.textContent).toContain('No books in this realm yet');
  });
});
