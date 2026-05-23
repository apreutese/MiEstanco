import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-bares-list.component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="page-placeholder"><h2>Bares</h2><p>Cargando...</p></div>`
})
export class BaresListComponent {}
