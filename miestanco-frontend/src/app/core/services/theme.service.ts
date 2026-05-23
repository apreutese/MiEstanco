import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'marlboro-red' | 'marlboro-gold' | 'tabacos';

const STORAGE_KEY = 'miestanco-theme';

// Color primario de cada tema para el meta theme-color del navegador/iOS
const THEME_COLORS: Record<Theme, string> = {
  'marlboro-red':  '#CC0000',
  'marlboro-gold': '#C9973A',
  'tabacos':       '#8B1528',
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly current = signal<Theme>(this.loadTheme());

  constructor() {
    effect(() => {
      const t = this.current();
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(STORAGE_KEY, t);

      // Actualizar meta theme-color (borde superior en iOS y Android)
      let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'theme-color';
        document.head.appendChild(meta);
      }
      meta.content = THEME_COLORS[t];
    });
  }

  set(theme: Theme) { this.current.set(theme); }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const valid: Theme[] = ['marlboro-red', 'marlboro-gold', 'tabacos'];
    return valid.includes(saved as Theme) ? (saved as Theme) : 'marlboro-red';
  }
}
