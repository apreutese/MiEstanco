import {
  Component, signal, computed, inject, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductoService, ProductoPayload } from './producto.service';
import { Producto, Categoria } from '../../core/models/models';

@Component({
  selector: 'app-productos-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DecimalPipe, MatIconModule, MatSnackBarModule],
  templateUrl: './productos-list.component.html',
  styleUrl: './productos-list.component.scss'
})
export class ProductosListComponent implements OnInit {
  private svc = inject(ProductoService);
  private snack = inject(MatSnackBar);

  productos = signal<Producto[]>([]);
  loading = signal(true);
  busqueda = signal('');
  modalAbierto = signal(false);
  guardando = signal(false);
  editando = signal<Producto | null>(null);
  fotoPreview = signal<string | null>(null);
  subiendoFoto = signal(false);

  readonly categorias = Object.values(Categoria);
  readonly Categoria = Categoria;

  form = signal<ProductoPayload>({ nombre: '', marca: '', categoria: Categoria.TABACO, precio: 0 });

  readonly productosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase();
    return this.productos().filter(p =>
      !q || p.nombre.toLowerCase().includes(q) || (p.marca ?? '').toLowerCase().includes(q)
    );
  });

  ngOnInit() { this.cargar(); }
  cargar() {
    this.loading.set(true);
    this.svc.listar().subscribe({ next: p => { this.productos.set(p); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  abrirCrear() {
    this.editando.set(null);
    this.form.set({ nombre: '', marca: '', categoria: Categoria.TABACO, precio: 0 });
    this.modalAbierto.set(true);
  }

  abrirEditar(p: Producto) {
    this.editando.set(p);
    this.form.set({ nombre: p.nombre, marca: p.marca ?? '', categoria: p.categoria, precio: p.precio });
    this.fotoPreview.set(p.fotoUrl ?? null);
    this.modalAbierto.set(true);
  }

  cerrarModal() { this.modalAbierto.set(false); this.fotoPreview.set(null); }

  guardar() {
    if (!this.form().nombre || this.form().precio <= 0) return;
    this.guardando.set(true);
    const obs = this.editando()
      ? this.svc.editar(this.editando()!.id, this.form())
      : this.svc.crear(this.form());
    obs.subscribe({
      next: p => {
        if (this.editando()) this.productos.update(l => l.map(x => x.id === p.id ? p : x));
        else this.productos.update(l => [p, ...l]);
        this.guardando.set(false); this.modalAbierto.set(false);
        this.snack.open(this.editando() ? 'Producto actualizado' : 'Producto creado', '', { duration: 2000 });
      },
      error: (err) => { this.guardando.set(false); this.snack.open(err.error?.mensaje || 'Error', '', { duration: 3000 }); }
    });
  }

  toggleActivo(p: Producto) {
    const obs = p.activo ? this.svc.desactivar(p.id) : this.svc.activar(p.id);
    obs.subscribe({ next: () => this.productos.update(l => l.map(x => x.id === p.id ? { ...x, activo: !x.activo } : x)) });
  }

  setField(field: keyof ProductoPayload, value: any) {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  onFotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.editando()) return;
    // Preview local inmediato
    const reader = new FileReader();
    reader.onload = e => this.fotoPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
    // Subir al backend
    this.subiendoFoto.set(true);
    const fd = new FormData();
    fd.append('foto', file);
    this.svc.subirFoto(this.editando()!.id, fd).subscribe({
      next: p => {
        this.productos.update(l => l.map(x => x.id === p.id ? p : x));
        this.fotoPreview.set(p.fotoUrl ?? null);
        this.subiendoFoto.set(false);
        this.snack.open('Foto subida ✓', '', { duration: 2000 });
      },
      error: () => { this.subiendoFoto.set(false); this.snack.open('Error al subir la foto', '', { duration: 3000 }); }
    });
  }

  categoriaLabel(c: Categoria) { return c === Categoria.TABACO ? 'Tabaco' : 'Miscelánea'; }
}
