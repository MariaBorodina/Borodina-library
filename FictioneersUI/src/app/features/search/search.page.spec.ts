import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchPage } from './search.page';

describe('SearchPage', () => {
  let fixture: ComponentFixture<SearchPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchPage);
    fixture.detectChanges();
  });

  it('should show empty state with recovery links after search', () => {
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
});
