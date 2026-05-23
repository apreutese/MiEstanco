import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-usuarios-list.component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-placeholder"><h2>Usuarios</h2><p>Cargando...</p></div>`
})
export class UsuariosListComponent {}
