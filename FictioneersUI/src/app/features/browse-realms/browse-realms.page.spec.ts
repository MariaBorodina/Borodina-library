import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BrowseRealmsPage } from './browse-realms.page';
import { RealmService } from '../../core/services/realm.service';
import { NEVER, of } from 'rxjs';

describe('BrowseRealmsPage', () => {
  let fixture: ComponentFixture<BrowseRealmsPage>;

  const mockRealms = [
    { id: '1', slug: 'hard-sci-fi', name: 'Hard Sci-Fi', bookCount: 5 },
    { id: '2', slug: 'epic-fantasy', name: 'Epic Fantasy', bookCount: 10 },
  ];

  async function createPage(getRealms = () => of(mockRealms)): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [BrowseRealmsPage],
      providers: [
        provideRouter([]),
        {
          provide: RealmService,
          useValue: { getRealms },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BrowseRealmsPage);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await createPage();
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

  it('should show skeleton cards while realms are loading', async () => {
    TestBed.resetTestingModule();
    await createPage(() => NEVER);

    const grid = fixture.nativeElement.querySelector('[aria-busy="true"]');
    expect(grid?.getAttribute('aria-label')).toBe('Loading realms');

    const skeletons = fixture.nativeElement.querySelectorAll('.realm-card--skeleton');
    expect(skeletons.length).toBe(6);
    expect(fixture.nativeElement.querySelectorAll('app-realm-card').length).toBe(0);
  });

  it('should call getRealms when the page is created', async () => {
    const getRealms = vi.fn(() => of(mockRealms));

    TestBed.resetTestingModule();
    await createPage(getRealms);

    expect(getRealms).toHaveBeenCalledTimes(1);
  });
});
