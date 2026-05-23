import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-productos-list.component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-placeholder"><h2>Productos</h2><p>Cargando...</p></div>`
})
export class ProductosListComponent {}
