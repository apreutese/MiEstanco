import {
  Component, signal, computed, inject, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MaquinaService, MaquinaPayload } from './maquina.service';
import { BarService } from '../bares/bar.service';
import { ProductoService } from '../productos/producto.service';
import { Maquina, Bar, Producto, Moneda } from '../../core/models/models';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-maquinas-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './maquinas-list.component.html',
  styleUrl: './maquinas-list.component.scss'
})
export class MaquinasListComponent implements OnInit {
  private svc     = inject(MaquinaService);
  private barSvc  = inject(BarService);
  private prodSvc = inject(ProductoService);
  private apiSvc  = inject(ApiService);
  private snack   = inject(MatSnackBar);

  maquinas  = signal<Maquina[]>([]);
  bares     = signal<Bar[]>([]);
  productos = signal<Producto[]>([]);
  monedas   = signal<Moneda[]>([]);

  loading   = signal(true);
  busqueda  = signal('');
  modal     = signal(false);
  guardando = signal(false);
  editando  = signal<Maquina | null>(null);

  // Form
  form = signal<{ nombre: string; tipo: string; notas: string; barId: number | '' }>({
    nombre: '', tipo: '', notas: '', barId: ''
  });
  productosSeleccionados = signal<Set<number>>(new Set());
  monedasSeleccionadas   = signal<Set<number>>(new Set());

  readonly maquinasFiltradas = computed(() => {
    const q = this.busqueda().toLowerCase();
    return this.maquinas().filter(m =>
      !q || m.nombre.toLowerCase().includes(q) || m.bar.nombre.toLowerCase().includes(q)
    );
  });

  ngOnInit() {
    this.cargar();
    this.barSvc.listar().subscribe(b => this.bares.set(b.filter(x => x.activo)));
    this.prodSvc.listar().subscribe(p => this.productos.set(p.filter(x => x.activo)));
    this.apiSvc.get<Moneda[]>('monedas').subscribe(m => this.monedas.set(m));
  }

  cargar() {
    this.loading.set(true);
    this.svc.listar().subscribe({
      next: m => { this.maquinas.set(m); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirCrear() {
    this.editando.set(null);
    this.form.set({ nombre: '', tipo: '', notas: '', barId: '' });
    this.productosSeleccionados.set(new Set());
    this.monedasSeleccionadas.set(new Set());
    this.modal.set(true);
  }

  abrirEditar(m: Maquina) {
    this.editando.set(m);
    this.form.set({ nombre: m.nombre, tipo: m.tipo ?? '', notas: m.notas ?? '', barId: m.bar.id });
    this.productosSeleccionados.set(new Set(m.productos.map(p => p.id)));
    this.monedasSeleccionadas.set(new Set(m.monedas.map(mo => mo.id)));
    this.modal.set(true);
  }

  cerrar() { this.modal.set(false); }

  toggleProducto(id: number) {
    this.productosSeleccionados.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleMoneda(id: number) {
    this.monedasSeleccionadas.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  guardar() {
    const f = this.form();
    if (!f.nombre || !f.barId) return;
    this.guardando.set(true);

    const payload: MaquinaPayload = {
      nombre: f.nombre, tipo: f.tipo || undefined, notas: f.notas || undefined,
      barId: +f.barId,
      productoIds: Array.from(this.productosSeleccionados()),
      monedaIds: Array.from(this.monedasSeleccionadas())
    };

    const obs = this.editando()
      ? this.svc.editar(this.editando()!.id, payload)
      : this.svc.crear(payload);

    obs.subscribe({
      next: m => {
        if (this.editando()) this.maquinas.update(l => l.map(x => x.id === m.id ? m : x));
        else this.maquinas.update(l => [m, ...l]);
        this.guardando.set(false);
        this.modal.set(false);
        this.snack.open(this.editando() ? 'Máquina actualizada' : 'Máquina creada', '', { duration: 2000 });
      },
      error: err => { this.guardando.set(false); this.snack.open(err.error?.mensaje || 'Error', '', { duration: 3000 }); }
    });
  }

  toggleActiva(m: Maquina) {
    const obs = m.activa ? this.svc.desactivar(m.id) : this.svc.activar(m.id);
    obs.subscribe({ next: () => this.maquinas.update(l => l.map(x => x.id === m.id ? { ...x, activa: !x.activa } : x)) });
  }

  setField(field: string, value: any) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  isProductoSelected(id: number) { return this.productosSeleccionados().has(id); }
  isMonedaSelected(id: number)   { return this.monedasSeleccionadas().has(id); }
}
