import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthorBookCardComponent } from './author-book-card.component';
import { BookService } from '../../../core/services/book.service';
import { Book } from '../../models/library.model';

describe('AuthorBookCardComponent', () => {
  let fixture: ComponentFixture<AuthorBookCardComponent>;

  const mockBook: Book = {
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
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorBookCardComponent],
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

    fixture = TestBed.createComponent(AuthorBookCardComponent);
    fixture.componentRef.setInput('book', mockBook);
    fixture.detectChanges();
  });

  it('should render title and status', () => {
    expect(fixture.nativeElement.textContent).toContain('Ember of the Last Dragon');
    expect(fixture.nativeElement.textContent).toContain('draft');
  });

  it('should render cover placeholder when cover_path is null', () => {
    const placeholder = fixture.nativeElement.querySelector('.book-cover--placeholder');
    expect(placeholder).toBeTruthy();
  });

  it('should emit deleteBook when Delete is clicked', () => {
    const emitted: string[] = [];
    fixture.componentInstance.deleteBook.subscribe((id) => emitted.push(id));

    fixture.nativeElement.querySelector('.btn-danger')?.click();

    expect(emitted).toEqual(['book-1']);
  });
});
