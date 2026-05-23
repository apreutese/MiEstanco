import {
  Component, signal, computed, inject, OnInit, ChangeDetectionStrategy
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UsuarioService, CrearUsuarioPayload } from './usuario.service';
import { Usuario, Rol } from '../../core/models/models';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './usuarios-list.component.html',
  styleUrl: './usuarios-list.component.scss'
})
export class UsuariosListComponent implements OnInit {
  private svc = inject(UsuarioService);
  private snack = inject(MatSnackBar);

  usuarios = signal<Usuario[]>([]);
  loading = signal(true);
  busqueda = signal('');
  modalAbierto = signal(false);
  modalPassword = signal(false);
  guardando = signal(false);
  editando = signal<Usuario | null>(null);
  usuarioPasswordId = signal<number | null>(null);
  nuevaPassword = signal('');

  readonly Rol = Rol;
  readonly roles = [Rol.ADMIN, Rol.TRABAJADOR];

  form = signal<CrearUsuarioPayload>({ nombre: '', username: '', password: '', rol: Rol.TRABAJADOR });

  readonly usuariosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase();
    return this.usuarios().filter(u => !q || u.nombre.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
  });

  ngOnInit() { this.cargar(); }
  cargar() {
    this.loading.set(true);
    this.svc.listar().subscribe({ next: u => { this.usuarios.set(u); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  abrirCrear() {
    this.editando.set(null);
    this.form.set({ nombre: '', username: '', password: '', rol: Rol.TRABAJADOR });
    this.modalAbierto.set(true);
  }

  abrirEditar(u: Usuario) {
    this.editando.set(u);
    this.form.set({ nombre: u.nombre, username: u.username, password: '', rol: u.rol });
    this.modalAbierto.set(true);
  }

  cerrarModal() { this.modalAbierto.set(false); }

  guardar() {
    if (!this.form().nombre || !this.form().username) return;
    this.guardando.set(true);
    const obs = this.editando()
      ? this.svc.editar(this.editando()!.id, { nombre: this.form().nombre, rol: this.form().rol })
      : this.svc.crear(this.form());
    obs.subscribe({
      next: u => {
        if (this.editando()) this.usuarios.update(l => l.map(x => x.id === u.id ? u : x));
        else this.usuarios.update(l => [...l, u]);
        this.guardando.set(false); this.modalAbierto.set(false);
        this.snack.open(this.editando() ? 'Usuario actualizado' : 'Usuario creado', '', { duration: 2000 });
      },
      error: (err) => { this.guardando.set(false); this.snack.open(err.error?.mensaje || 'Error', '', { duration: 3000 }); }
    });
  }

  abrirPassword(u: Usuario) { this.usuarioPasswordId.set(u.id); this.nuevaPassword.set(''); this.modalPassword.set(true); }
  cerrarPassword() { this.modalPassword.set(false); }

  guardarPassword() {
    if (!this.nuevaPassword() || this.nuevaPassword().length < 4) return;
    this.svc.cambiarPassword(this.usuarioPasswordId()!, this.nuevaPassword()).subscribe({
      next: () => { this.modalPassword.set(false); this.snack.open('Contraseña actualizada', '', { duration: 2000 }); },
      error: (err) => this.snack.open(err.error?.mensaje || 'Error', '', { duration: 3000 })
    });
  }

  toggleActivo(u: Usuario) {
    const obs = u.activo ? this.svc.desactivar(u.id) : this.svc.activar(u.id);
    obs.subscribe({ next: () => this.usuarios.update(l => l.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x)) });
  }

  setField(field: keyof CrearUsuarioPayload, value: any) { this.form.update(f => ({ ...f, [field]: value })); }
  rolLabel(r: Rol) { return r === Rol.ADMIN ? 'Administrador' : 'Trabajadora'; }
}
