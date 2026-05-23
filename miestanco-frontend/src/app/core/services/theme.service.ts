import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'marlboro-red' | 'marlboro-gold' | 'tabacos';

const STORAGE_KEY = 'miestanco-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly current = signal<Theme>(this.loadTheme());

  constructor() {
    // Aplica el tema al <html> reactivamente
    effect(() => {
      const t = this.current();
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(STORAGE_KEY, t);
    });
  }

  set(theme: Theme) { this.current.set(theme); }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const valid: Theme[] = ['marlboro-red', 'marlboro-gold', 'tabacos'];
    return valid.includes(saved as Theme) ? (saved as Theme) : 'marlboro-red';
  }
}
