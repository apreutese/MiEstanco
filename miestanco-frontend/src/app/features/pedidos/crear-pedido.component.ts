import {
  Component, signal, computed, inject, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PedidoService } from './pedido.service';
import { Bar, Maquina, Producto, Moneda, Pedido } from '../../core/models/models';

interface LineaProductoForm { producto: Producto; cantidad: number; }
interface LineaMonedaForm   { moneda: Moneda;    cantidad: number; }

@Component({
  selector: 'app-crear-pedido',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './crear-pedido.component.html',
  styleUrl: './crear-pedido.component.scss'
})
export class CrearPedidoComponent implements OnInit {
  private svc = inject(PedidoService);
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  // Datos del formulario
  bares = signal<Bar[]>([]);
  maquinas = signal<Maquina[]>([]);
  maquinaSeleccionada = signal<Maquina | null>(null);

  lineasProducto = signal<LineaProductoForm[]>([]);
  lineasMoneda   = signal<LineaMonedaForm[]>([]);
  notas = signal('');
  guardando = signal(false);

  readonly barSeleccionadoId = signal<number | ''>('');
  readonly maquinaSeleccionadaId = signal<number | ''>('');

  readonly totalProductos = computed(() =>
    this.lineasProducto().reduce((s, l) => s + l.producto.precio * l.cantidad, 0)
  );

  readonly puedeGuardar = computed(() =>
    this.maquinaSeleccionada() !== null &&
    (this.lineasProducto().length > 0 || this.lineasMoneda().length > 0)
  );

  ngOnInit() {
    this.svc.bares().subscribe(b => this.bares.set(b));
  }

  onBarChange(barId: number | '') {
    this.barSeleccionadoId.set(barId);
    this.maquinas.set([]);
    this.maquinaSeleccionada.set(null);
    this.limpiarLineas();
    if (barId) {
      this.svc.maquinasPorBar(+barId).subscribe(m => this.maquinas.set(m));
    }
  }

  onMaquinaChange(maquinaId: number | '') {
    this.maquinaSeleccionadaId.set(maquinaId);
    this.limpiarLineas();
    if (maquinaId) {
      const m = this.maquinas().find(m => m.id === +maquinaId) ?? null;
      this.maquinaSeleccionada.set(m);
      // Pre-cargar líneas con cantidad 0 para todos los productos/monedas configurados
      if (m) {
        this.lineasProducto.set(m.productos.map(p => ({ producto: p, cantidad: 0 })));
        this.lineasMoneda.set(m.monedas.map(mo => ({ moneda: mo, cantidad: 0 })));
      }
    }
  }

  setCantidadProducto(idx: number, cantidad: number) {
    this.lineasProducto.update(l => l.map((item, i) => i === idx ? { ...item, cantidad: Math.max(0, cantidad) } : item));
  }

  setCantidadMoneda(idx: number, cantidad: number) {
    this.lineasMoneda.update(l => l.map((item, i) => i === idx ? { ...item, cantidad: Math.max(0, cantidad) } : item));
  }

  // Cargar último pedido de la máquina (Repetir pedido)
  repetirUltimo() {
    const mId = this.maquinaSeleccionada()?.id;
    if (!mId) return;
    this.svc.ultimoPedidoMaquina(mId).subscribe({
      next: (ultimo: Pedido) => {
        // Rellenar cantidades del último pedido
        this.lineasProducto.update(lineas => lineas.map(l => {
          const match = ultimo.lineasProducto.find(ul => ul.producto.id === l.producto.id);
          return match ? { ...l, cantidad: match.cantidad } : l;
        }));
        this.lineasMoneda.update(lineas => lineas.map(l => {
          const match = ultimo.lineasMoneda.find(ul => ul.moneda.id === l.moneda.id);
          return match ? { ...l, cantidad: match.cantidad } : l;
        }));
        this.snack.open('Pedido anterior cargado — edítalo si necesitas', '', { duration: 3000 });
      },
      error: () => this.snack.open('No hay pedidos anteriores para esta máquina', '', { duration: 2500 })
    });
  }

  guardar() {
    if (!this.puedeGuardar() || this.guardando()) return;
    this.guardando.set(true);

    const productos: Record<number, number> = {};
    this.lineasProducto().filter(l => l.cantidad > 0)
        .forEach(l => productos[l.producto.id] = l.cantidad);

    const monedas: Record<number, number> = {};
    this.lineasMoneda().filter(l => l.cantidad > 0)
        .forEach(l => monedas[l.moneda.id] = l.cantidad);

    this.svc.crear({
      maquinaId: this.maquinaSeleccionada()!.id,
      productos, monedas,
      notas: this.notas() || undefined
    }).subscribe({
      next: (p) => {
        this.guardando.set(false);
        this.snack.open('Pedido creado', '', { duration: 2000 });
        this.router.navigate(['/pedidos', p.id]);
      },
      error: (err) => {
        this.guardando.set(false);
        this.snack.open(err.error?.mensaje || 'Error al crear pedido', '', { duration: 3000 });
      }
    });
  }

  private limpiarLineas() {
    this.lineasProducto.set([]);
    this.lineasMoneda.set([]);
    this.notas.set('');
  }
}
