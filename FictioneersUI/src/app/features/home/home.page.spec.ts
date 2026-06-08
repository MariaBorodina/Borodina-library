import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home.page';
import { HOME_REALM_PILLS } from '../../core/data/realm.seed';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  it('should render realm pills linked to browse routes', () => {
    const pills = fixture.nativeElement.querySelectorAll('a.category-pill');
    expect(pills.length).toBe(HOME_REALM_PILLS.length);
  });

  it('should link All Realms to /realms', () => {
    const allRealms = fixture.nativeElement.querySelector('a.category-pill');
    expect(allRealms.getAttribute('href')).toContain('/realms');
  });

  it('should link Hard Sci-Fi pill to its realm detail route', () => {
    const hardSciFi = [...fixture.nativeElement.querySelectorAll('a.category-pill')].find(
      (el: HTMLAnchorElement) => el.textContent?.trim() === 'Hard Sci-Fi',
    );
    expect(hardSciFi?.getAttribute('href')).toContain('/realms/hard-sci-fi');
  });
});
