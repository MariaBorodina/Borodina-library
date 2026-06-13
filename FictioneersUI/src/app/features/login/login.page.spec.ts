import { computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  AuthService,
  INVALID_CREDENTIALS_MESSAGE,
  SUPABASE_NOT_CONFIGURED_MESSAGE,
} from '../../core/services/auth.service';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let router: Router;
  let mockAuth: {
    loading: ReturnType<typeof signal<boolean>>;
    isAuthenticated: ReturnType<typeof computed<boolean>>;
    isConfigured: boolean;
    signIn: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
    waitForProfile: ReturnType<typeof vi.fn>;
  };

  async function createPage(
    options: {
      isAuthenticated?: boolean;
      isConfigured?: boolean;
      returnUrl?: string;
      mode?: string;
    } = {},
  ): Promise<void> {
    const loadingSignal = signal(false);
    const authenticated = options.isAuthenticated ?? false;

    mockAuth = {
      loading: loadingSignal,
      isAuthenticated: computed(() => authenticated),
      isConfigured: options.isConfigured ?? true,
      signIn: vi.fn(() => of(void 0)),
      signUp: vi.fn(() => of('session' as const)),
      waitForProfile: vi.fn(() => Promise.resolve()),
    };

    const queryParams: Record<string, string> = {};
    if (options.returnUrl) {
      queryParams['returnUrl'] = options.returnUrl;
    }
    if (options.mode) {
      queryParams['mode'] = options.mode;
    }

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap(queryParams) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    router = TestBed.inject(Router);
    fixture.detectChanges();
    TestBed.flushEffects();
  }

  beforeEach(async () => {
    await createPage();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render email and password fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[type="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('should render Log in button', () => {
    const button = fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement;
    expect(button?.textContent?.trim()).toBe('Log in');
  });

  it('should show Sign up toggle when logged out', () => {
    const toggle = fixture.nativeElement.querySelector('.auth-form__toggle') as HTMLButtonElement;
    expect(toggle?.textContent?.trim()).toBe('Sign up');
  });

  it('should toggle to signup mode', () => {
    const toggle = fixture.nativeElement.querySelector('.auth-form__toggle') as HTMLButtonElement;
    toggle.click();
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector('h1.page-title');
    expect(heading?.textContent).toContain('Create account');
    expect(fixture.nativeElement.querySelector('input[name="isAuthor"]')).toBeTruthy();
  });

  function fillCredentials(email: string, password: string): void {
    const emailInput = fixture.nativeElement.querySelector(
      'input[type="email"]',
    ) as HTMLInputElement;
    const passwordInput = fixture.nativeElement.querySelector(
      'input[type="password"]',
    ) as HTMLInputElement;
    emailInput.value = email;
    emailInput.dispatchEvent(new Event('input'));
    passwordInput.value = password;
    passwordInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  it('should display error on failed signIn', async () => {
    mockAuth.signIn.mockReturnValue(
      throwError(() => new Error(INVALID_CREDENTIALS_MESSAGE)),
    );

    fillCredentials('reader@example.com', 'wrong-password');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    const error = fixture.nativeElement.querySelector('.auth-form__error') as HTMLElement;
    expect(error?.textContent).toContain(INVALID_CREDENTIALS_MESSAGE);
    expect(error?.getAttribute('role')).toBe('alert');
  });

  it('should call signIn and navigate on success', async () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fillCredentials('reader@example.com', 'correct-password');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockAuth.signIn).toHaveBeenCalledWith('reader@example.com', 'correct-password');
    expect(mockAuth.waitForProfile).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith('/');
  });

  it('should use returnUrl query param', async () => {
    TestBed.resetTestingModule();
    await createPage({ returnUrl: '/my-books' });

    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fillCredentials('reader@example.com', 'correct-password');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith('/my-books');
  });

  it('should redirect when already authenticated', async () => {
    TestBed.resetTestingModule();

    const loadingSignal = signal(false);
    const authenticatedMockAuth = {
      loading: loadingSignal,
      isAuthenticated: computed(() => true),
      isConfigured: true,
      signIn: vi.fn(() => of(void 0)),
      signUp: vi.fn(() => of('session' as const)),
      waitForProfile: vi.fn(() => Promise.resolve()),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authenticatedMockAuth },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap({ returnUrl: '/my-books' }) },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    TestBed.flushEffects();

    expect(navigateSpy).toHaveBeenCalledWith('/my-books');
  });

  it('should disable submit when Supabase not configured', async () => {
    TestBed.resetTestingModule();
    await createPage({ isConfigured: false });

    const button = fixture.nativeElement.querySelector('.btn-primary') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    const notice = fixture.nativeElement.querySelector('.auth-form__notice') as HTMLElement;
    expect(notice?.textContent).toContain(SUPABASE_NOT_CONFIGURED_MESSAGE);
  });
});
