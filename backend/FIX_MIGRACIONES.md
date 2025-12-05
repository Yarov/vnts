# Fix: Error de Migraciones

## Problema
```
django.db.utils.ProgrammingError: relation "users" does not exist
```

## Solución

### Opción 1: Reconstruir Contenedores (Recomendado)

```bash
cd backend

# Detener y eliminar contenedores
docker-compose down -v

# Reconstruir imagen
docker-compose build --no-cache

# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend
```

### Opción 2: Crear Migraciones Manualmente

```bash
# Entrar al contenedor
docker-compose exec backend bash

# Crear migraciones
python manage.py makemigrations organizations
python manage.py makemigrations users
python manage.py makemigrations products
python manage.py makemigrations clients
python manage.py makemigrations sellers
python manage.py makemigrations payments
python manage.py makemigrations sales

# Aplicar migraciones
python manage.py migrate

# Salir
exit
```

### Opción 3: Desde Cero

```bash
cd backend

# Eliminar todo
docker-compose down -v
docker volume rm vnts_postgres_data

# Reconstruir
docker-compose up --build -d

# Ver logs
docker-compose logs -f
```

## Verificar que Funciona

```bash
# Ver logs del backend
docker-compose logs backend

# Debe mostrar:
# - Applying organizations.0001_initial... OK
# - Applying users.0001_initial... OK
# - Applying products.0001_initial... OK
# - etc.
# - Starting development server at http://0.0.0.0:8000/
```

## Crear Superusuario

```bash
docker-compose exec backend python manage.py createsuperuser
```

## Probar API

```bash
curl http://localhost:8000/api/v1/organizations/
```

Debe retornar `[]` (array vacío) sin errores.
