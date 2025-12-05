# VNTS SaaS Backend - Django REST API

Backend completo para sistema de ventas multi-tenant construido con Django y Django REST Framework.

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose instalados
- Python 3.11+ (si ejecutas sin Docker)

### Instalación con Docker (Recomendado)

```bash
# 1. Navegar al directorio backend
cd backend

# 2. Copiar archivo de entorno
cp .env.example .env

# 3. Levantar servicios
docker-compose up -d

# 4. Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# 5. La API estará disponible en:
# - API: http://localhost:8000
# - Admin: http://localhost:8000/admin
# - Docs: http://localhost:8000/api/docs
```

### Instalación Local (Sin Docker)

```bash
# 1. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Ejecutar migraciones
python manage.py migrate

# 5. Crear superusuario
python manage.py createsuperuser

# 6. Iniciar servidor
python manage.py runserver
```

## 📁 Estructura del Proyecto

```
backend/
├── config/                 # Configuración de Django
│   ├── settings.py        # Settings principales
│   ├── urls.py            # URLs principales
│   └── wsgi.py            # WSGI config
├── apps/                   # Aplicaciones Django
│   ├── core/              # Modelos base y utilidades
│   ├── organizations/     # Gestión de organizaciones
│   ├── users/             # Autenticación y usuarios
│   ├── products/          # Productos
│   ├── clients/           # Clientes
│   ├── sellers/           # Vendedores
│   ├── sales/             # Ventas
│   └── payments/          # Métodos de pago
├── docker-compose.yml     # Configuración Docker
├── Dockerfile             # Imagen Docker
├── requirements.txt       # Dependencias Python
└── manage.py              # CLI de Django
```

## 🔐 Autenticación

El sistema usa JWT (JSON Web Tokens) para autenticación.

### Endpoints de Autenticación

```
POST /api/v1/auth/register/          # Registrar nueva organización
POST /api/v1/auth/login/             # Login admin
POST /api/v1/auth/seller-login/      # Login vendedor
POST /api/v1/auth/token/refresh/     # Refrescar token
POST /api/v1/auth/logout/            # Cerrar sesión
GET  /api/v1/auth/me/                # Obtener usuario actual
```

### Ejemplo de Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

Respuesta:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": "admin",
    "organization_id": "uuid"
  }
}
```

### Usar Token en Requests

```bash
curl -X GET http://localhost:8000/api/v1/products/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

## 📚 API Endpoints

### Organizaciones
```
GET    /api/v1/organizations/           # Listar organizaciones
GET    /api/v1/organizations/{slug}/    # Obtener por slug
PUT    /api/v1/organizations/{id}/      # Actualizar
```

### Productos
```
GET    /api/v1/products/                # Listar productos
POST   /api/v1/products/                # Crear producto
GET    /api/v1/products/{id}/           # Obtener producto
PUT    /api/v1/products/{id}/           # Actualizar producto
DELETE /api/v1/products/{id}/           # Eliminar producto
```

### Clientes
```
GET    /api/v1/clients/                 # Listar clientes
POST   /api/v1/clients/                 # Crear cliente
GET    /api/v1/clients/{id}/            # Obtener cliente
PUT    /api/v1/clients/{id}/            # Actualizar cliente
DELETE /api/v1/clients/{id}/            # Eliminar cliente
```

### Vendedores
```
GET    /api/v1/sellers/                 # Listar vendedores
POST   /api/v1/sellers/                 # Crear vendedor
GET    /api/v1/sellers/{id}/            # Obtener vendedor
PUT    /api/v1/sellers/{id}/            # Actualizar vendedor
DELETE /api/v1/sellers/{id}/            # Eliminar vendedor
```

### Ventas
```
GET    /api/v1/sales/                   # Listar ventas
POST   /api/v1/sales/                   # Crear venta
GET    /api/v1/sales/{id}/              # Obtener venta
GET    /api/v1/sales/summary/           # Resumen de ventas
GET    /api/v1/sales/by-seller/         # Ventas por vendedor
```

### Métodos de Pago
```
GET    /api/v1/payments/methods/        # Listar métodos
POST   /api/v1/payments/methods/        # Crear método
PUT    /api/v1/payments/methods/{id}/   # Actualizar método
DELETE /api/v1/payments/methods/{id}/   # Eliminar método
```

## 🔍 Filtros y Búsqueda

Todos los endpoints de listado soportan:

- **Paginación:** `?page=1&page_size=20`
- **Búsqueda:** `?search=término`
- **Ordenamiento:** `?ordering=-created_at`
- **Filtros:** Específicos por endpoint

Ejemplo:
```bash
GET /api/v1/products/?search=laptop&active=true&ordering=-price
```

## 🏢 Multi-Tenancy

El sistema implementa multi-tenancy a nivel de base de datos:

- Cada registro pertenece a una **organización**
- Los usuarios solo ven datos de su organización
- Filtrado automático por `organization_id`
- Validación en modelos y serializers

### Cómo Funciona

1. Usuario se autentica → Recibe JWT con `organization_id`
2. Cada request incluye el token
3. Backend filtra automáticamente por organización
4. Imposible acceder a datos de otras organizaciones

## 📖 Documentación API

La documentación interactiva está disponible en:

- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/

Puedes probar todos los endpoints directamente desde el navegador.

## 🧪 Testing

```bash
# Ejecutar tests
python manage.py test

# Con coverage
coverage run --source='.' manage.py test
coverage report
```

## 🔧 Comandos Útiles

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Recolectar archivos estáticos
python manage.py collectstatic

# Shell interactivo
python manage.py shell

# Ver rutas
python manage.py show_urls
```

## 🐳 Docker Comandos

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Ejecutar comandos en el contenedor
docker-compose exec backend python manage.py migrate

# Detener servicios
docker-compose down

# Reconstruir imagen
docker-compose build --no-cache
```

## 🔒 Seguridad

- ✅ JWT para autenticación
- ✅ CORS configurado
- ✅ Validación de datos en serializers
- ✅ Multi-tenancy a nivel de BD
- ✅ Passwords hasheados con bcrypt
- ✅ HTTPS recomendado en producción

## 🚀 Despliegue en Producción

### Variables de Entorno

```bash
DEBUG=False
SECRET_KEY=tu-secret-key-super-segura
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
DATABASE_URL=postgresql://user:pass@host:5432/db
CORS_ALLOWED_ORIGINS=https://tu-frontend.com
```

### Checklist

- [ ] `DEBUG=False`
- [ ] Secret key segura y única
- [ ] Base de datos en servidor dedicado
- [ ] Configurar HTTPS
- [ ] Configurar dominio en ALLOWED_HOSTS
- [ ] Configurar CORS correctamente
- [ ] Backups automáticos de BD
- [ ] Monitoreo y logs

## 📝 Licencia

MIT License

## 👥 Soporte

Para preguntas o problemas, contacta a: support@vnts.app
