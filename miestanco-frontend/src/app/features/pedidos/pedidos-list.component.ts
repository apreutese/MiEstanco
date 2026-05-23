import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pedidos-list.component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-placeholder"><h2>Pedidos</h2><p>Cargando...</p></div>`
})
export class PedidosListComponent {}
