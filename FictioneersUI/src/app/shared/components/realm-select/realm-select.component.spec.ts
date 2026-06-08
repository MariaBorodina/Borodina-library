import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
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

  it('should emit selected slug', () => {
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'epic-fantasy';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(emitted).toEqual(['epic-fantasy']);
  });
});
