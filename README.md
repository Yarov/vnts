# 🛒 VNTS - Sistema de Ventas Profesional

Sistema completo de punto de venta con gestión de productos, vendedores, sucursales y reportes en tiempo real.

## 🏗️ Arquitectura

```
vnts/
├── frontend/          # React + Vite + TypeScript + Tailwind
├── backend/           # Django + PostgreSQL + REST API
├── docker-compose.*   # Orquestación de servicios
└── DEPLOYMENT.md      # Guía completa de despliegue
```

## ✨ Características

### 👨‍💼 Para Administradores
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de productos con asignación por sucursal
- ✅ Control de vendedores y comisiones
- ✅ Gestión de múltiples sucursales
- ✅ Reportes detallados de ventas
- ✅ Configuración de métodos de pago

### 🏪 Para Vendedores
- ✅ Login con código numérico
- ✅ Selección de sucursal al iniciar sesión
- ✅ Registro rápido de ventas
- ✅ Vista de productos filtrados por sucursal
- ✅ Historial de ventas personal
- ✅ Dashboard con comisiones del día

## 🚀 Tecnologías

### Frontend
- **Framework**: React 18 + Vite
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado**: Jotai
- **Routing**: React Router v6
- **Gráficos**: Chart.js
- **Iconos**: Heroicons

### Backend
- **Framework**: Django 4.2
- **Base de Datos**: PostgreSQL 15
- **API**: Django REST Framework
- **Autenticación**: JWT + Session
- **CORS**: django-cors-headers

### DevOps
- **Contenedores**: Docker + Docker Compose
- **Web Server**: Nginx (producción)
- **WSGI**: Gunicorn (producción)

## 📋 Requisitos

- Docker Desktop
- Docker Compose
- Git

## Configuración del Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/vnts.git
cd vnts
```

### 2. Iniciar en Desarrollo

```bash
# Opción 1: Script automático
chmod +x start-dev.sh
./start-dev.sh

# Opción 2: Manual
docker compose -f docker-compose.dev.yml up -d
```

**Acceder a la aplicación:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Admin Django: http://localhost:8000/admin

### 3. Crear Superusuario

```bash
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser
```

### 4. Detener Servicios

```bash
docker compose -f docker-compose.dev.yml down
```

## 🚀 Despliegue en Producción

### 1. Configurar Variables de Entorno

```bash
cp .env.production.example .env.production
nano .env.production
```

### 2. Desplegar

```bash
# Opción 1: Script automático
chmod +x start-prod.sh
./start-prod.sh

# Opción 2: Manual
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

**Ver guía completa en:** [DEPLOYMENT.md](DEPLOYMENT.md)

## Estructura del Proyecto

```
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── charts/      # Componentes de gráficos
│   │   ├── dashboard/   # Componentes específicos del dashboard
│   │   ├── forms/       # Componentes de formulario
│   │   ├── layouts/     # Layouts (admin, seller)
│   │   └── ui/          # Componentes UI básicos
│   ├── lib/             # Utilidades y configuración
│   ├── pages/           # Páginas principales
│   │   ├── admin/       # Páginas del administrador
│   │   ├── auth/        # Páginas de autenticación
│   │   └── seller/      # Páginas del vendedor
│   ├── store/           # Estado global (Jotai)
│   ├── types/           # Definiciones de tipos TypeScript
│   ├── App.tsx          # Componente principal
│   ├── index.css        # Estilos globales con Tailwind
│   └── main.tsx         # Punto de entrada
├── .env.local           # Variables de entorno (no incluido en git)
├── index.html           # HTML raíz
├── package.json         # Dependencias
├── tailwind.config.js   # Configuración de Tailwind
├── tsconfig.json        # Configuración de TypeScript
└── vite.config.ts       # Configuración de Vite
```

## Flujo de Trabajo

1. **Administrador**:
   - Gestiona productos, vendedores (con porcentajes de comisión) y métodos de pago
   - Visualiza reportes, estadísticas y comisiones ganadas
   - Monitorea el rendimiento de los vendedores

2. **Vendedor**:
   - Inicia sesión con código numérico
   - Registra ventas diarias
   - Consulta su historial de ventas
   - Visualiza su dashboard personal

## Funcionalidades Principales

### Administrador

- **Dashboard**: Resumen de ventas, productos más vendidos, rendimiento de vendedores, comisiones diarias
- **Productos**: CRUD completo de productos con estado activo/inactivo
- **Vendedores**: Gestión de vendedores, asignación de códigos de acceso y porcentajes de comisión
- **Clientes**: Visualización de clientes y su historial de compras
- **Métodos de Pago**: Configuración de formas de pago aceptadas
- **Reportes**: Análisis detallados de ventas por período, vendedor o producto

### Vendedor

- **Dashboard**: Resumen de ventas diarias y semanales
- **Nueva Venta**: Interfaz de registro de ventas con búsqueda de productos
- **Historial**: Consulta de ventas realizadas con filtros

## Contribución

1. Haz un Fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Agradecimientos

- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Supabase](https://supabase.com/)
- [Jotai](https://jotai.org/)
- [Chart.js](https://www.chartjs.org/)
- [Heroicons](https://heroicons.com/)
