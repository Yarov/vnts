# VNTS - Aplicación de Control de Ingresos para Negocios

Una aplicación web moderna desarrollada con Vite, React, TypeScript y Tailwind CSS para el control de ingresos de negocios, gestión de productos, vendedores y clientes.

## Características

- **Autenticación dual**: Admin con usuario/contraseña y vendedores con código numérico
- **Gestión completa**: Productos, vendedores, clientes y métodos de pago
- **Registro de ventas**: Interfaz intuitiva para vendedores
- **Reportes**: Análisis detallado para administradores
- **Diseño responsive**: Funciona en dispositivos móviles y de escritorio

## Tecnologías Utilizadas

- **Frontend**: Vite, React, TypeScript, Tailwind CSS
- **Estado**: Jotai para gestión de estado global
- **Backend**: Supabase (Auth, Database, Storage)
- **Gráficos**: Chart.js para visualizaciones
- **UI Components**: Componentes personalizados basados en Tailwind

## Requisitos Previos

- Node.js 16.x o superior
- npm o yarn
- Una cuenta en [Supabase](https://supabase.com)

## Configuración del Proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/vnts.git
cd vnts
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. En tu proyecto de Supabase, ve a SQL Editor
3. Ejecuta el script de creación de la base de datos que se encuentra en `database_schema.sql`
4. Habilita la autenticación por email en Authentication > Providers
5. Crea un usuario administrador en Authentication > Users
6. Ejecuta el script `admin_setup.sql` para configurar el usuario admin (reemplaza 'ID_DEL_USUARIO_DE_AUTH' con el UUID del usuario creado)
7. Opcionalmente, ejecuta `add_test_seller.sql` para crear un vendedor de prueba

### 4. Configurar variables de entorno

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Añade las siguientes variables con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
```

3. También puedes editar directamente estas variables en `src/lib/supabase.ts`

### 5. Ejecutar el proyecto en modo desarrollo

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en `http://localhost:3000`

### 6. Construir para producción

```bash
npm run build
# o
yarn build
```

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
   - Gestiona productos, vendedores y métodos de pago
   - Visualiza reportes y estadísticas
   - Monitorea el rendimiento de los vendedores

2. **Vendedor**:
   - Inicia sesión con código numérico
   - Registra ventas diarias
   - Consulta su historial de ventas
   - Visualiza su dashboard personal

## Funcionalidades Principales

### Administrador

- **Dashboard**: Resumen de ventas, productos más vendidos, rendimiento de vendedores
- **Productos**: CRUD completo de productos con estado activo/inactivo
- **Vendedores**: Gestión de vendedores y asignación de códigos de acceso
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
