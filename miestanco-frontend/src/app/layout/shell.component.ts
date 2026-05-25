import {
  Component, signal, computed, inject,
  ChangeDetectionStrategy, HostListener
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';

interface NavItem {
  label: string; icon: string; route: string;
  adminOnly?: boolean; bottomBar?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  readonly theme = inject(ThemeService);

  readonly usuario = this.auth.usuario;
  readonly isAdmin = this.auth.isAdmin;

  sidebarCollapsed = signal(false);
  adminMenuOpen    = signal(false);

  readonly allNav: NavItem[] = [
    { label: 'Pedidos',   icon: 'receipt_long', route: '/pedidos',   bottomBar: true },
    { label: 'Historial', icon: 'history',       route: '/historial', bottomBar: true },
    { label: 'Estadísticas', icon: 'bar_chart', route: '/estadisticas', adminOnly: true },
    { label: 'Bares',     icon: 'store',         route: '/bares',     adminOnly: true },
    { label: 'Máquinas',  icon: 'point_of_sale', route: '/maquinas',  adminOnly: true },
    { label: 'Productos', icon: 'inventory_2',   route: '/productos', adminOnly: true },
    { label: 'Usuarios',  icon: 'people',        route: '/usuarios',  adminOnly: true },
  ];

  // Items del sidebar de escritorio
  readonly sidebarNav = computed(() =>
    this.allNav.filter(i => !i.adminOnly || this.isAdmin())
  );

  // Items del bottom bar en móvil (no-admin + botón central + admin tab)
  readonly bottomNav = computed(() => {
    const base = this.allNav.filter(i => i.bottomBar);
    return base;
  });

  // Items del sub-menú admin en bottom bar
  readonly adminSubNav = computed(() =>
    this.allNav.filter(i => i.adminOnly)
  );

  readonly avatarLetter = computed(() =>
    this.usuario()?.nombre?.charAt(0).toUpperCase() ?? '?'
  );

  readonly rolLabel = computed(() =>
    this.usuario()?.rol === 'ADMIN' ? 'Administrador' : 'Trabajador'
  );

  toggleSidebar()  { this.sidebarCollapsed.update(v => !v); }
  toggleAdminMenu(){ this.adminMenuOpen.update(v => !v); }
  closeAdminMenu() { this.adminMenuOpen.set(false); }

  goNuevoPedido()  { this.router.navigate(['/pedidos/nuevo']); }
  logout()         { this.auth.logout(); }

  @HostListener('document:click')
  onDocClick() { this.adminMenuOpen.set(false); }
}
