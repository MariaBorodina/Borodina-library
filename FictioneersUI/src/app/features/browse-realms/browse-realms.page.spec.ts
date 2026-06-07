import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BrowseRealmsPage } from './browse-realms.page';
import { RealmService } from '../../core/services/realm.service';
import { of } from 'rxjs';

describe('BrowseRealmsPage', () => {
  let fixture: ComponentFixture<BrowseRealmsPage>;

  const mockRealms = [
    { id: '1', slug: 'hard-sci-fi', name: 'Hard Sci-Fi', bookCount: 5 },
    { id: '2', slug: 'epic-fantasy', name: 'Epic Fantasy', bookCount: 10 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseRealmsPage],
      providers: [
        provideRouter([]),
        {
          provide: RealmService,
          useValue: { getRealms: () => of(mockRealms) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseRealmsPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render page heading', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading?.textContent).toContain('Browse by');
    expect(heading?.textContent).toContain('Realm');
  });

  it('should render a card for each realm', () => {
    const cards = fixture.nativeElement.querySelectorAll('app-realm-card');
    expect(cards.length).toBe(mockRealms.length);
  });

  it('should display realm names on cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Hard Sci-Fi');
    expect(compiled.textContent).toContain('Epic Fantasy');
  });

  it('should link each card to its realm detail route', () => {
    const links = fixture.nativeElement.querySelectorAll('a.realm-card');
    expect(links[0].getAttribute('href')).toContain('/realms/hard-sci-fi');
    expect(links[1].getAttribute('href')).toContain('/realms/epic-fantasy');
  });
});
