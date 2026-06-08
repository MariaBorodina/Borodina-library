import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RealmCardComponent } from './realm-card.component';

describe('RealmCardComponent', () => {
  let fixture: ComponentFixture<RealmCardComponent>;

  const realm = {
    id: '1',
    slug: 'cyberpunk',
    name: 'Cyberpunk Wastelands',
    description: 'Neon-lit dystopias.',
    bookCount: 14,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealmCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RealmCardComponent);
    fixture.componentRef.setInput('realm', realm);
    fixture.detectChanges();
  });

  it('should render the realm name', () => {
    const name = fixture.nativeElement.querySelector('.realm-card__name');
    expect(name?.textContent).toContain('Cyberpunk Wastelands');
  });

  it('should link to the realm detail page', () => {
    const link = fixture.nativeElement.querySelector('a.realm-card');
    expect(link?.getAttribute('href')).toContain('/realms/cyberpunk');
  });

  it('should render description when provided', () => {
    const description = fixture.nativeElement.querySelector('.realm-card__description');
    expect(description?.textContent).toContain('Neon-lit dystopias.');
  });

  it('should render plural book count', () => {
    const count = fixture.nativeElement.querySelector('.realm-card__count');
    expect(count?.textContent?.trim()).toBe('14 books');
  });

  it('should render singular book count', () => {
    fixture.componentRef.setInput('realm', { ...realm, bookCount: 1 });
    fixture.detectChanges();

    const count = fixture.nativeElement.querySelector('.realm-card__count');
    expect(count?.textContent?.trim()).toBe('1 book');
  });
});
