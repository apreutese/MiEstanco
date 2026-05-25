# MiEstanco

Progressive Web App para la gestión integral de máquinas de tabaco en estancos. Permite a los propietarios revisar máquinas en bares, crear pedidos desde el móvil, y que el equipo en tienda los prepare y entregue de forma coordinada.

## ✨ Características principales

### Gestión de pedidos
- ✅ Crear pedidos desde móvil con productos y monedas
- 📋 Estados: Pendiente → En preparación → Listo → Entregado
-  Líneas de pedido con productos y monedas
- ✏️ Marcar items como preparados

### PWA y caché
- 📱 Service Workers para caché de assets
- ⚡ Carga rápida de recursos estáticos
- 💾 Instalable como app nativa

### Estadísticas y reportes
- 📊 Dashboard con gráficos interactivos
- 📅 Filtros por fecha, bar y máquina
- 💰 Análisis de ventas y productos más vendidos
- 📈 Métricas de rendimiento

### Gestión completa
- 🏪 **Bares**: CRUD con ubicación y contacto
- 🎰 **Máquinas**: Asignación a bares, estado y mantenimiento
- � **Productos**: Catálogo con fotos, precios y stock
- 💰 **Monedas**: Gestión de cambio para máquinas
- 👥 **Usuarios**: Roles (Admin, Trabajador) con autenticación JWT

### Experiencia de usuario
- 🎨 **3 temas visuales**: Marlboro Red, Marlboro Gold, Estanco
- � **PWA instalable**: Como app nativa en móvil
- 🌐 **Responsive**: Adaptado a móvil, tablet y escritorio
- 🔐 **Seguridad**: JWT + Spring Security

## 🛠️ Stack tecnológico

### Backend
- **Java 21** con Spring Boot 4.0.6
- **Spring Security** + JWT para autenticación
- **Spring Data JPA** + Hibernate
- **MySQL 8** como base de datos
- **Lombok** para reducir boilerplate
- **Swagger/OpenAPI** para documentación de API

### Frontend
- **Angular 21** con Standalone Components
- **Angular Material** para componentes UI
- **RxJS** para programación reactiva
- **Service Workers** para caché de assets
- **SCSS** con sistema de temas dinámicos
- **ngx-image-cropper** para recorte de imágenes

### DevOps
- **Maven** para gestión de dependencias backend
- **npm** para gestión de dependencias frontend
- **Express** como servidor de producción
- **ngrok** para túnel HTTPS público

## 📁 Estructura del proyecto

```
Kit_Digital/
├── miestanco-backend/              # API REST (Spring Boot)
│   ├── src/main/java/com/miestanco/
│   │   ├── controller/             # Endpoints REST
│   │   ├── service/                # Lógica de negocio
│   │   ├── repository/             # Acceso a datos (JPA)
│   │   ├── model/                  # Entidades JPA
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── security/               # JWT + Spring Security
│   │   ├── config/                 # Configuración
│   │   └── exception/              # Manejo de errores
│   ├── src/main/resources/
│   │   ├── application.properties  # Configuración de la app
│   │   └── data.sql                # Datos iniciales
│   └── pom.xml                     # Dependencias Maven
│
├── miestanco-frontend/             # PWA (Angular)
│   ├── src/app/
│   │   ├── features/               # Módulos funcionales
│   │   │   ├── auth/               # Login y autenticación
│   │   │   ├── pedidos/            # Gestión de pedidos
│   │   │   ├── bares/              # Gestión de bares
│   │   │   ├── maquinas/           # Gestión de máquinas
│   │   │   ├── productos/          # Catálogo de productos
│   │   │   ├── usuarios/           # Gestión de usuarios
│   │   │   ├── estadisticas/       # Dashboard y reportes
│   │   │   └── perfil/             # Perfil y temas
│   │   ├── core/                   # Servicios core
│   │   │   ├── services/           # API, Auth, Theme
│   │   │   ├── guards/             # Protección de rutas
│   │   │   ├── interceptors/       # JWT interceptor
│   │   │   └── models/             # Interfaces TypeScript
│   │   ├── shared/                 # Componentes compartidos
│   │   └── layout/                 # Shell y navegación
│   ├── public/                     # Assets estáticos
│   │   ├── icons/                  # Iconos PWA
│   │   └── manifest.webmanifest    # Configuración PWA
│   ├── server.js                   # Servidor Express producción
│   ├── ngsw-config.json            # Configuración Service Worker
│   └── package.json                # Dependencias npm
│
├── db/
│   └── init.sql                    # Script de inicialización MySQL
│
├── ARRANCAR_MIESTANCO.bat          # Script de arranque automático
└── README.md
```

## 🚀 Inicio rápido

### Requisitos previos
- **Java 21** (JDK)
- **Node.js 18+** y npm
- **MySQL 8.0+**
- **Maven 3.8+**
- **ngrok** (opcional, para acceso público)

### 1. Configurar base de datos

```bash
# Conectar a MySQL
mysql -u root -p

# Ejecutar script de inicialización
source db/init.sql
```

La base de datos `miestanco` se creará automáticamente. Las tablas y datos iniciales se generan al arrancar el backend por primera vez.

### 2. Configurar backend

Edita `miestanco-backend/src/main/resources/application.properties` si es necesario:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/miestanco
spring.datasource.username=root
spring.datasource.password=root
server.port=8080
```

### 3. Arrancar la aplicación

#### Opción A: Script automático (Windows)
```bash
ARRANCAR_MIESTANCO.bat
```

Este script arranca:
1. Backend (Spring Boot) en puerto 8080
2. Frontend (Express) en puerto 4201
3. ngrok para túnel HTTPS público

#### Opción B: Manual

**Backend:**
```bash
cd miestanco-backend
mvnw spring-boot:run
```

**Frontend (desarrollo):**
```bash
cd miestanco-frontend
npm install
npm start
```

**Frontend (producción):**
```bash
cd miestanco-frontend
npm run build:prod
npm run serve:prod
```

### 4. Acceder a la aplicación

- **Frontend**: http://localhost:4201
- **Backend API**: http://localhost:8080/api
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html

> **Nota**: Los usuarios de prueba se crean automáticamente al arrancar el backend por primera vez. Consulta el archivo `data.sql` para más información.

## 📱 Instalar como PWA

1. Abre la app en Chrome/Edge/Safari
2. Haz clic en el icono de instalación en la barra de direcciones
3. Confirma la instalación
4. La app aparecerá como aplicación nativa

## 🔌 API Endpoints principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Renovar token

### Pedidos
- `GET /api/pedidos` - Listar pedidos
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/{id}/estado` - Cambiar estado
- `GET /api/pedidos/activos` - Pedidos activos

### Bares, Máquinas, Productos
- `GET /api/bares` - Listar bares
- `GET /api/maquinas` - Listar máquinas
- `GET /api/productos` - Listar productos

### Estadísticas
- `GET /api/estadisticas/dashboard` - Métricas generales
- `GET /api/estadisticas/ventas` - Análisis de ventas

Ver documentación completa en Swagger: http://localhost:8080/api/swagger-ui.html

## 🧪 Testing

```bash
# Backend (JUnit)
cd miestanco-backend
mvn test

# Frontend (Vitest)
cd miestanco-frontend
npm test
```

## 📦 Build de producción

```bash
# Backend (JAR)
cd miestanco-backend
mvn clean package
java -jar target/miestanco-backend-0.0.1-SNAPSHOT.jar

# Frontend (optimizado)
cd miestanco-frontend
npm run build:prod
```

## 🎓 Contexto académico

Proyecto desarrollado para el módulo de **Digitalización Aplicada** (1º DAM), simulando un caso real de Transformación Digital con Kit Digital para un estanco familiar.

### Objetivos cumplidos
- ✅ Digitalización de procesos manuales
- ✅ Aplicación móvil con modo offline
- ✅ Sistema de gestión integral
- ✅ Arquitectura cliente-servidor moderna
- ✅ Buenas prácticas de desarrollo

## 📄 Licencia

Proyecto académico - 2026
