import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pedido-detalle.component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-placeholder"><h2>Detalle del Pedido</h2><p>Cargando...</p></div>`
})
export class PedidoDetalleComponent {}
