import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BookCardComponent } from './book-card.component';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../models/library.model';

describe('BookCardComponent', () => {
  let fixture: ComponentFixture<BookCardComponent>;

  const mockBook: Book = {
    id: 'book-1',
    author_id: 'author-1',
    realm_id: '8',
    title: 'Ember of the Last Dragon',
    synopsis: 'A tale of fire and legacy.',
    cover_path: null,
    cover_size_bytes: 0,
    tags: ['fantasy'],
    status: 'published',
    updated_at: '2025-01-01T00:00:00Z',
    created_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookCardComponent],
      providers: [
        provideRouter([]),
        {
          provide: BookService,
          useValue: {
            getCoverPublicUrl: () => null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCardComponent);
    fixture.componentRef.setInput('book', mockBook);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the book title', () => {
    const title = fixture.nativeElement.querySelector('.book-title');
    expect(title?.textContent).toContain('Ember of the Last Dragon');
  });

  it('should link to the book info route', () => {
    const link = fixture.nativeElement.querySelector('a.book-card');
    expect(link?.getAttribute('href')).toContain('/books/book-1');
  });

  it('should show cover placeholder when no cover URL', () => {
    const placeholder = fixture.nativeElement.querySelector('.book-cover--placeholder');
    expect(placeholder).toBeTruthy();
    expect(fixture.nativeElement.querySelector('img.book-cover')).toBeFalsy();
  });

  it('should show cover image when cover URL is available', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [BookCardComponent],
      providers: [
        provideRouter([]),
        {
          provide: BookService,
          useValue: {
            getCoverPublicUrl: () => 'https://example.com/cover.jpg',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookCardComponent);
    fixture.componentRef.setInput('book', { ...mockBook, cover_path: 'author-1/book-1/cover.jpg' });
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img.book-cover');
    expect(img?.getAttribute('src')).toBe('https://example.com/cover.jpg');
    expect(img?.getAttribute('alt')).toBe('Ember of the Last Dragon');
  });
});
