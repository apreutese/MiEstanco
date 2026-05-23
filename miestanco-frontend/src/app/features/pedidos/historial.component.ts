import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-historial.component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-placeholder"><h2>Historial</h2><p>Cargando...</p></div>`
})
export class HistorialComponent {}
