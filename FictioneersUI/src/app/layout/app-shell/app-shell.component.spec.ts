import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  let fixture: ComponentFixture<AppShellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AppShellComponent);
    fixture.detectChanges();
  });

  it('should link Browse by Realm in the navigation', () => {
    const navLink = [...fixture.nativeElement.querySelectorAll('nav a')].find(
      (el: HTMLAnchorElement) => el.textContent?.trim() === 'Browse by Realm',
    );
    expect(navLink?.getAttribute('href')).toContain('/realms');
  });

  it('should link Browse by Realm in the footer', () => {
    const footerLink = fixture.nativeElement.querySelector('footer a[href="/realms"]');
    expect(footerLink?.textContent?.trim()).toBe('Browse by Realm');
  });

  it('should render router outlet for feature pages', () => {
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
