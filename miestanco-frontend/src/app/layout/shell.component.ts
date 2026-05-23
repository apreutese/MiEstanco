import { Component, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/services/auth.service';
import { Rol } from '../core/models/models';

interface NavItem {
  label: string; icon: string; route: string; adminOnly?: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatSidenavModule, MatToolbarModule, MatListModule,
    MatIconModule, MatButtonModule, MatTooltipModule
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  private auth = inject(AuthService);

  readonly usuario = this.auth.usuario;
  readonly isAdmin = this.auth.isAdmin;

  sidenavOpen = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Pedidos',   icon: 'receipt_long',  route: '/pedidos' },
    { label: 'Historial', icon: 'history',        route: '/historial' },
    { label: 'Bares',     icon: 'store',          route: '/bares',     adminOnly: true },
    { label: 'Máquinas',  icon: 'point_of_sale',  route: '/maquinas',  adminOnly: true },
    { label: 'Productos', icon: 'inventory_2',    route: '/productos', adminOnly: true },
    { label: 'Usuarios',  icon: 'people',         route: '/usuarios',  adminOnly: true },
  ];

  readonly visibleNav = computed(() =>
    this.navItems.filter(item => !item.adminOnly || this.isAdmin())
  );

  logout() { this.auth.logout(); }
}
