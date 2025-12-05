# 🚀 Inicio Rápido - Backend Django

## Paso 1: Levantar servicios

```bash
cd backend
docker-compose up -d
```

## Paso 2: Ver logs

```bash
docker-compose logs -f backend
```

## Paso 3: Crear superusuario

```bash
docker-compose exec backend python manage.py createsuperuser
```

## Paso 4: Acceder

- **API:** http://localhost:8000
- **Admin:** http://localhost:8000/admin
- **Docs:** http://localhost:8000/api/docs

## Comandos Útiles

```bash
# Ver logs
docker-compose logs -f

# Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# Crear migraciones
docker-compose exec backend python manage.py makemigrations

# Shell de Django
docker-compose exec backend python manage.py shell

# Detener servicios
docker-compose down

# Reconstruir
docker-compose build --no-cache
docker-compose up -d
```

## Probar API

```bash
# Registrar organización
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "test123",
    "full_name": "Admin Test",
    "organization_name": "Test Org"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "test123"
  }'

# Listar productos (con token)
curl -X GET http://localhost:8000/api/v1/products/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## ✅ Backend Completo

Todas las apps están creadas y funcionando:
- ✅ Organizations
- ✅ Users (Auth con JWT)
- ✅ Products
- ✅ Clients
- ✅ Sellers
- ✅ Sales
- ✅ Payments

## 🔄 Siguiente: Actualizar Frontend

Ver archivo: `/INTEGRACION_FRONTEND.md`
