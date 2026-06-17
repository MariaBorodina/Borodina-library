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
    const navLink = [...fixture.nativeElement.querySelectorAll('.nav-links a')].find(
      (el: HTMLAnchorElement) => el.textContent?.trim() === 'Browse by Realm',
    );
    expect(navLink?.getAttribute('href')).toContain('/realms');
  });

  it('should mirror navigation links in the mobile drawer', () => {
    const desktopLabels = [...fixture.nativeElement.querySelectorAll('.nav-links a, .nav-links button')].map(
      (el: HTMLElement) => el.textContent?.trim(),
    );
    const mobileLabels = [
      ...fixture.nativeElement.querySelectorAll('.nav-drawer__links a, .nav-drawer__links button'),
    ].map((el: HTMLElement) => el.textContent?.trim());

    expect(mobileLabels).toEqual(desktopLabels);
  });

  it('should toggle the mobile navigation drawer', () => {
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.nav-toggle');
    const drawer: HTMLElement = fixture.nativeElement.querySelector('.nav-drawer');

    expect(drawer.classList.contains('nav-drawer--open')).toBe(false);

    toggle.click();
    fixture.detectChanges();

    expect(drawer.classList.contains('nav-drawer--open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('should link Browse by Realm in the footer', () => {
    const footerLink = fixture.nativeElement.querySelector('footer a[href="/realms"]');
    expect(footerLink?.textContent?.trim()).toBe('Browse by Realm');
  });

  it('should render router outlet for feature pages', () => {
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
