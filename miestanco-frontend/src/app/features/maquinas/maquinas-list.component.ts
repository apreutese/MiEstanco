import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-maquinas-list.component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-placeholder"><h2>Máquinas</h2><p>Cargando...</p></div>`
})
export class MaquinasListComponent {}
