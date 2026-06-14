import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject, NEVER, of, throwError } from 'rxjs';
import { SearchPage } from './search.page';
import { SearchService } from '../../core/services/search.service';
import { BookService } from '../../core/services/book.service';
import { Book } from '../../shared/models/library.model';

describe('SearchPage', () => {
  let fixture: ComponentFixture<SearchPage>;
  let searchBooksSpy: ReturnType<typeof vi.fn>;
  let queryParamMap$: BehaviorSubject<ParamMap>;

  const mockBooks: Book[] = [
    {
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
    },
    {
      id: 'seed-book-2',
      author_id: 'seed-author-2',
      realm_id: '8',
      title: 'Hoard of the Sky Wyrm',
      synopsis: 'Treasure hunters race to a floating citadel before the wyrm awakens.',
      cover_path: null,
      cover_size_bytes: 0,
      tags: ['dragons', 'adventure'],
      status: 'published',
      updated_at: '2025-06-01T00:00:00Z',
      created_at: '2025-06-01T00:00:00Z',
    },
  ];

  async function createPage(options?: {
    searchResult?: Book[];
    searchError?: boolean;
    delaySearch?: boolean;
    initialQuery?: string;
  }): Promise<void> {
    queryParamMap$ = new BehaviorSubject(
      convertToParamMap(options?.initialQuery ? { q: options.initialQuery } : {}),
    );

    searchBooksSpy = vi.fn(() => {
      if (options?.searchError) {
        return throwError(() => new Error('search failed'));
      }
      if (options?.delaySearch) {
        return NEVER;
      }
      return of(options?.searchResult ?? []);
    });

    await TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParamMap$.asObservable() } },
        {
          provide: SearchService,
          useValue: { searchBooks: searchBooksSpy },
        },
        {
          provide: BookService,
          useValue: { getCoverPublicUrl: () => null },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPage);
    fixture.detectChanges();
  }

  it('should create', async () => {
    await createPage();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render search input and button on load', async () => {
    await createPage();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('input[aria-label="Search keywords"]')).toBeTruthy();
    expect(compiled.querySelector('.btn-primary')?.textContent).toContain('Search');
  });

  it('should not show empty state before search', async () => {
    await createPage();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.search-empty')).toBeFalsy();
  });

  it('should show loading skeleton while searching', async () => {
    await createPage({ delaySearch: true });
    fixture.componentInstance.query = 'dragon';
    fixture.componentInstance.search();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.book-card--skeleton')).toBeTruthy();
    expect(compiled.getAttribute('aria-busy') ?? compiled.querySelector('[aria-busy="true"]')).toBeTruthy();
  });

  it('should render results with book titles', async () => {
    await createPage({ searchResult: mockBooks });
    fixture.componentInstance.query = 'dragon';
    fixture.componentInstance.search();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ember of the Last Dragon');
    expect(compiled.textContent).toContain('Hoard of the Sky Wyrm');
    expect(compiled.querySelector('app-book-card')).toBeTruthy();
  });

  it('should show empty state with recovery links after search', async () => {
    await createPage({ searchResult: [] });
    fixture.componentInstance.query = 'wizard school';
    fixture.componentInstance.search();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No books found. Try different keywords.');

    const realmLink = compiled.querySelector('a[href="/realms"]');
    const authorsLink = compiled.querySelector('a[href="/authors"]');
    expect(realmLink?.textContent).toContain('Browse by Realm');
    expect(authorsLink?.textContent).toContain('Authors');
  });

  it('should show error state on service failure', async () => {
    await createPage({ searchError: true });
    fixture.componentInstance.query = 'dragon';
    fixture.componentInstance.search();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Search is temporarily unavailable. Please try again.');
    expect(compiled.querySelector('.search-error')).toBeTruthy();
  });

  it('should not call service for whitespace query', async () => {
    await createPage();
    fixture.componentInstance.query = '   ';
    fixture.componentInstance.search();
    fixture.detectChanges();

    expect(searchBooksSpy).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.search-empty')).toBeFalsy();
  });

  it('should auto-search when q query param is present', async () => {
    await createPage({ searchResult: mockBooks, initialQuery: 'dragon' });
    fixture.detectChanges();

    expect(searchBooksSpy).toHaveBeenCalledWith('dragon');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ember of the Last Dragon');
  });
});
