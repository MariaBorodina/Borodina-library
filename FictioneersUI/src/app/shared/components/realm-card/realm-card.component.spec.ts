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
});
