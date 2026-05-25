# MiEstanco

App de gestión de máquinas de tabaco para estancos. Permite a los propietarios revisar máquinas en bares, crear pedidos desde el móvil (con o sin wifi), y que el equipo en tienda los prepare y entregue.

## Funcionalidades principales

- 📦 **Gestión de pedidos** — Crear, preparar, entregar y cancelar pedidos
- 🔍 **Revisión de máquinas** — Desde el móvil, con soporte offline
- 📊 **Estadísticas** — Dashboard con filtros por fecha, bar y máquina
- 🏪 **Gestión de bares, máquinas y productos** — CRUD completo
- 📱 **PWA** — Funciona como app instalable en el móvil
- 🔄 **Offline-first** — Trabaja sin wifi, sincroniza al reconectar
- 🔔 **Notificaciones push** — Aviso cuando se crea o prepara un pedido

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Backend | Java 21 + Spring Boot 3 |
| Base de datos | MySQL 8 |
| Frontend | Angular 21 + Angular Material |
| Estilos | SCSS (temas Marlboro Red, Gold, Estanco) |
| Offline | Service Workers + IndexedDB |
| API docs | Swagger / OpenAPI |

## Estructura del proyecto

```
Kit_Digital/
├── miestanco-backend/      # API REST (Spring Boot)
├── miestanco-frontend/     # PWA (Angular)
├── db/                     # Scripts SQL
├── ARRANCAR_MIESTANCO.bat  # Script de inicio rápido
└── README.md
```

## Inicio rápido

### Requisitos previos
- Java 21
- Node.js 18+
- MySQL 8
- Maven

### Arrancar la aplicación

Ejecuta el script de inicio:
```bash
ARRANCAR_MIESTANCO.bat
```

O manualmente:

1. **Base de datos**: Importa `db/miestanco.sql` en MySQL
2. **Backend**: 
   ```bash
   cd miestanco-backend
   mvn spring-boot:run
   ```
3. **Frontend**:
   ```bash
   cd miestanco-frontend
   npm install
   npm start
   ```

La app estará disponible en `http://localhost:4200`

## Proyecto académico

Simulación de un proyecto de Transformación Digital con Kit Digital para el módulo de Digitalización Aplicada (1º DAM).
