export enum Rol { ADMIN = 'ADMIN', TRABAJADOR = 'TRABAJADOR' }
export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  EN_PREPARACION = 'EN_PREPARACION',
  PREPARADO = 'PREPARADO',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO'
}
export enum Categoria { TABACO = 'TABACO', MISCELANEO = 'MISCELANEO' }

export interface Usuario {
  id: number; nombre: string; username: string; rol: Rol; activo: boolean;
}
export interface Bar {
  id: number; codigo: string; nombre: string; direccion?: string;
  telefono?: string; notas?: string; activo: boolean;
}
export interface Moneda {
  id: number; denominacion: string; valorCentimos: number;
}
export interface Producto {
  id: number; nombre: string; marca?: string; categoria: Categoria;
  precio: number; fotoUrl?: string; activo: boolean;
}
export interface Maquina {
  id: number; nombre: string; tipo?: string; notas?: string; activa: boolean;
  bar: Bar; productos: Producto[]; monedas: Moneda[];
}
export interface LineaProducto {
  id: number; producto: Producto; cantidad: number; precioUnitario: number; preparada: boolean;
}
export interface LineaMoneda {
  id: number; moneda: Moneda; cantidad: number; preparada: boolean;
}
export interface Pedido {
  id: number; maquina: Maquina; creadoPor: Usuario; estado: EstadoPedido;
  fechaCreacion: string; fechaPreparado?: string; fechaEntregado?: string;
  preparadoPor?: Usuario; entregadoPor?: Usuario; notas?: string;
  sincronizado: boolean; offlineId?: string;
  lineasProducto: LineaProducto[]; lineasMoneda: LineaMoneda[];
}
export interface LoginRequest { username: string; password: string; }
export interface LoginResponse {
  token: string; refreshToken: string; userId: number;
  nombre: string; username: string; rol: Rol;
}
export interface ApiResponse<T> { success: boolean; mensaje: string; datos: T; }
