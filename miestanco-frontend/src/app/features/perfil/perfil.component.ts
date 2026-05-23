import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService, Theme } from '../../core/services/theme.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="perfil-page fade-in">

      <!-- Header usuario -->
      <div class="perfil-header">
        <div class="perfil-avatar">{{ inicial() }}</div>
        <div class="perfil-info">
          <h1 class="perfil-nombre">{{ usuario()?.nombre }}</h1>
          <span class="badge-admin">{{ rolLabel() }}</span>
        </div>
      </div>

      <!-- Theme picker -->
      <section class="perfil-section">
        <h2 class="perfil-section__title">Tema de color</h2>
        <p class="perfil-section__desc">Elige el estilo visual de la aplicación.</p>
        <div class="theme-grid">
          @for (t of themes; track t.id) {
            <button class="theme-card"
                    [class.theme-card--active]="currentTheme() === t.id"
                    (click)="setTheme(t.id)"
                    [id]="'theme-' + t.id">
              <div class="theme-card__preview" [style.background]="t.bg">
                <div class="theme-card__dot" [style.background]="t.primary"></div>
              </div>
              <div class="theme-card__info">
                <span class="theme-card__name">{{ t.name }}</span>
                <span class="theme-card__desc">{{ t.desc }}</span>
              </div>
              @if (currentTheme() === t.id) {
                <span class="theme-card__check">✓</span>
              }
            </button>
          }
        </div>
      </section>

      <!-- Info cuenta -->
      <section class="perfil-section">
        <h2 class="perfil-section__title">Cuenta</h2>
        <div class="perfil-detail">
          <span class="perfil-detail__label">Usuario</span>
          <span class="perfil-detail__value">{{ usuario()?.username }}</span>
        </div>
        <div class="perfil-detail">
          <span class="perfil-detail__label">Rol</span>
          <span class="perfil-detail__value">{{ rolLabel() }}</span>
        </div>
      </section>

      <!-- Logout -->
      <button class="btn-logout" (click)="logout()" id="btn-perfil-logout">
        Cerrar sesión
      </button>

    </div>
  `,
  styles: [`
    .perfil-page { max-width: 520px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem; }

    .perfil-header {
      display: flex; align-items: center; gap: 1rem;
      padding: 1.5rem; background: var(--surface);
      border: 1px solid var(--border); border-radius: var(--r-xl);
    }
    .perfil-avatar {
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--primary); color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700; flex-shrink: 0;
    }
    .perfil-nombre { font-size: 1.2rem; font-weight: 700; margin-bottom: .25rem; }

    .perfil-section {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--r-xl); padding: 1.25rem;
      display: flex; flex-direction: column; gap: .75rem;
    }
    .perfil-section__title { font-size: .95rem; font-weight: 700; }
    .perfil-section__desc  { font-size: .8rem; color: var(--text-3); margin-top: -.25rem; }

    // Theme grid
    .theme-grid { display: flex; flex-direction: column; gap: .5rem; }
    .theme-card {
      display: flex; align-items: center; gap: .85rem;
      padding: .75rem; border-radius: var(--r-md);
      border: 1.5px solid var(--border); background: var(--surface-2);
      cursor: pointer; transition: border-color var(--t), background var(--t);
      &:hover { border-color: var(--border-2); }
      &--active { border-color: var(--primary); background: var(--primary-dim); }
    }
    .theme-card__preview {
      width: 36px; height: 36px; border-radius: var(--r-md); flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
    }
    .theme-card__dot {
      width: 14px; height: 14px; border-radius: 50%;
    }
    .theme-card__info { flex: 1; text-align: left; }
    .theme-card__name { display: block; font-size: .875rem; font-weight: 600; color: var(--text); }
    .theme-card__desc { display: block; font-size: .75rem; color: var(--text-3); }
    .theme-card__check { color: var(--primary); font-weight: 700; font-size: 1rem; }

    // Detail rows
    .perfil-detail {
      display: flex; justify-content: space-between; align-items: center;
      padding: .5rem 0; border-bottom: 1px solid var(--border);
      &:last-child { border-bottom: none; }
    }
    .perfil-detail__label { font-size: .8rem; color: var(--text-3); font-weight: 500; }
    .perfil-detail__value { font-size: .875rem; font-weight: 600; color: var(--text); }

    // Logout
    .btn-logout {
      width: 100%; padding: .85rem; border-radius: var(--r-lg);
      background: rgba(239,68,68,.1); border: 1.5px solid rgba(239,68,68,.3);
      color: #ef4444; font-family: var(--font); font-size: .9rem; font-weight: 600;
      cursor: pointer; transition: all var(--t);
      &:hover { background: rgba(239,68,68,.2); border-color: #ef4444; }
    }
  `]
})
export class PerfilComponent {
  private auth  = inject(AuthService);
  private themeS = inject(ThemeService);

  readonly usuario     = this.auth.usuario;
  readonly currentTheme = this.themeS.current;

  readonly inicial = () => this.usuario()?.nombre?.charAt(0).toUpperCase() ?? '?';
  readonly rolLabel = () => this.usuario()?.rol === 'ADMIN' ? 'Administrador' : 'Trabajador';

  readonly themes: { id: Theme; name: string; desc: string; bg: string; primary: string }[] = [
    { id: 'marlboro-red',  name: 'Marlboro Red',    desc: 'Rojo intenso · Dorado',  bg: '#0f0809', primary: '#c41e2a' },
    { id: 'marlboro-gold', name: 'Marlboro Gold',   desc: 'Dorado · Crema cálido',  bg: '#0d0b06', primary: '#c8961a' },
    { id: 'tabacos',       name: 'Tabacos España',  desc: 'Burdeos · Dorado logo',  bg: '#2a0810', primary: '#f0a020' },
  ];

  setTheme(t: Theme) { this.themeS.set(t); }
  logout()           { this.auth.logout(); }
}
