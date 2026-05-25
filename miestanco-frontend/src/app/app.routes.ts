import { Routes } from '@angular/router';
import { authGuard, adminGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/pedidos', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then(m => m.ShellComponent),
    children: [
      {
        path: 'pedidos',
        loadComponent: () => import('./features/pedidos/pedidos-list.component').then(m => m.PedidosListComponent)
      },
      {
        path: 'pedidos/nuevo',
        loadComponent: () => import('./features/pedidos/crear-pedido.component').then(m => m.CrearPedidoComponent)
      },
      {
        path: 'pedidos/:id',
        loadComponent: () => import('./features/pedidos/pedido-detalle.component').then(m => m.PedidoDetalleComponent)
      },
      {
        path: 'historial',
        loadComponent: () => import('./features/pedidos/historial.component').then(m => m.HistorialComponent)
      },
      {
        path: 'estadisticas',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/estadisticas/estadisticas.component').then(m => m.EstadisticasComponent)
      },
      {
        path: 'bares',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/bares/bares-list.component').then(m => m.BaresListComponent)
      },
      {
        path: 'maquinas',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/maquinas/maquinas-list.component').then(m => m.MaquinasListComponent)
      },
      {
        path: 'productos',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/productos/productos-list.component').then(m => m.ProductosListComponent)
      },
      {
        path: 'usuarios',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/usuarios/usuarios-list.component').then(m => m.UsuariosListComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil.component').then(m => m.PerfilComponent)
      },
    ]
  },
  { path: '**', redirectTo: '/pedidos' }
];
