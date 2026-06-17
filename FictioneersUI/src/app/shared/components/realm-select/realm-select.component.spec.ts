import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { RealmService } from '../../../core/services/realm.service';
import { RealmSelectComponent } from './realm-select.component';

describe('RealmSelectComponent', () => {
  let fixture: ComponentFixture<RealmSelectComponent>;

  const mockRealms = [
    { id: '1', slug: 'hard-sci-fi', name: 'Hard Sci-Fi' },
    { id: '2', slug: 'epic-fantasy', name: 'Epic Fantasy' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealmSelectComponent],
      providers: [
        {
          provide: RealmService,
          useValue: { getRealms: () => of(mockRealms) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RealmSelectComponent);
    fixture.detectChanges();
  });

  it('should populate options from RealmService', () => {
    const options = fixture.nativeElement.querySelectorAll('option');
    expect(options.length).toBe(mockRealms.length + 1);
    expect(fixture.nativeElement.textContent).toContain('Hard Sci-Fi');
  });

  it('should emit selected realm id', () => {
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = '2';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(emitted).toEqual(['2']);
  });

  it('should select the provided value after realms load asynchronously', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RealmSelectComponent],
      providers: [
        {
          provide: RealmService,
          useValue: { getRealms: () => of(mockRealms).pipe(delay(10)) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RealmSelectComponent);
    fixture.componentRef.setInput('value', '2');
    fixture.detectChanges();

    await new Promise((resolve) => setTimeout(resolve, 20));
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('2');
  });
});
