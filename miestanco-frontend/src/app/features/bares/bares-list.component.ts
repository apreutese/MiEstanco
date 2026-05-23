import {
  Component, signal, computed, inject, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BarService, BarPayload } from './bar.service';
import { Bar } from '../../core/models/models';

@Component({
  selector: 'app-bares-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './bares-list.component.html',
  styleUrl: './bares-list.component.scss'
})
export class BaresListComponent implements OnInit {
  private svc = inject(BarService);
  private snack = inject(MatSnackBar);

  bares = signal<Bar[]>([]);
  loading = signal(true);
  busqueda = signal('');
  modalAbierto = signal(false);
  guardando = signal(false);
  editando = signal<Bar | null>(null);

  form = signal<BarPayload>({ codigo: '', nombre: '', direccion: '', telefono: '', notas: '' });

  readonly baresFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase();
    return this.bares().filter(b => !q || b.nombre.toLowerCase().includes(q) || b.codigo.toLowerCase().includes(q));
  });

  ngOnInit() { this.cargar(); }

  cargar() {
    this.loading.set(true);
    this.svc.listar().subscribe({ next: b => { this.bares.set(b); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  abrirCrear() {
    this.editando.set(null);
    this.form.set({ codigo: '', nombre: '', direccion: '', telefono: '', notas: '' });
    this.modalAbierto.set(true);
  }

  abrirEditar(bar: Bar) {
    this.editando.set(bar);
    this.form.set({ codigo: bar.codigo, nombre: bar.nombre, direccion: bar.direccion ?? '', telefono: bar.telefono ?? '', notas: bar.notas ?? '' });
    this.modalAbierto.set(true);
  }

  cerrarModal() { this.modalAbierto.set(false); }

  guardar() {
    if (!this.form().codigo || !this.form().nombre) return;
    this.guardando.set(true);
    const obs = this.editando()
      ? this.svc.editar(this.editando()!.id, this.form())
      : this.svc.crear(this.form());

    obs.subscribe({
      next: (b) => {
        if (this.editando()) {
          this.bares.update(list => list.map(x => x.id === b.id ? b : x));
        } else {
          this.bares.update(list => [b, ...list]);
        }
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.snack.open(this.editando() ? 'Bar actualizado' : 'Bar creado', '', { duration: 2000 });
      },
      error: (err) => { this.guardando.set(false); this.snack.open(err.error?.mensaje || 'Error', '', { duration: 3000 }); }
    });
  }

  toggleActivo(bar: Bar) {
    const obs = bar.activo ? this.svc.desactivar(bar.id) : this.svc.activar(bar.id);
    obs.subscribe({ next: () => this.bares.update(list => list.map(b => b.id === bar.id ? { ...b, activo: !b.activo } : b)) });
  }

  setField(field: keyof BarPayload, value: string) {
    this.form.update(f => ({ ...f, [field]: value }));
  }
}
