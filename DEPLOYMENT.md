# 🚀 Guía de Despliegue VNTS

Sistema de Ventas con Frontend (React + Vite) y Backend (Django + PostgreSQL)

## 📁 Estructura del Proyecto

```
vnts/
├── frontend/               # Aplicación React + Vite
│   ├── src/
│   ├── public/
│   ├── Dockerfile         # Producción (Nginx)
│   ├── Dockerfile.dev     # Desarrollo
│   ├── nginx.conf
│   └── package.json
├── backend/               # API Django + PostgreSQL
│   ├── apps/
│   ├── config/
│   ├── Dockerfile         # Producción (Gunicorn)
│   ├── Dockerfile.dev     # Desarrollo
│   ├── requirements.txt
│   └── manage.py
├── docker-compose.dev.yml    # Desarrollo
├── docker-compose.prod.yml   # Producción
└── .env.production.example   # Variables de entorno
```

## 🛠️ Desarrollo Local

### Prerrequisitos
- Docker Desktop instalado
- Docker Compose

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd vnts
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.production.example .env.development

# Editar valores para desarrollo
nano .env.development
```

### 3. Iniciar servicios de desarrollo
```bash
# Iniciar todos los servicios
docker compose -f docker-compose.dev.yml up -d

# Ver logs
docker compose -f docker-compose.dev.yml logs -f

# Detener servicios
docker compose -f docker-compose.dev.yml down
```

### 4. Acceder a la aplicación
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin
- **PostgreSQL**: localhost:5432

### 5. Comandos útiles de desarrollo

```bash
# Reiniciar solo el backend
docker compose -f docker-compose.dev.yml restart backend

# Reiniciar solo el frontend
docker compose -f docker-compose.dev.yml restart frontend

# Ver logs del backend
docker compose -f docker-compose.dev.yml logs -f backend

# Ejecutar migraciones
docker compose -f docker-compose.dev.yml exec backend python manage.py migrate

# Crear superusuario
docker compose -f docker-compose.dev.yml exec backend python manage.py createsuperuser

# Acceder al shell de Django
docker compose -f docker-compose.dev.yml exec backend python manage.py shell

# Acceder a PostgreSQL
docker compose -f docker-compose.dev.yml exec db psql -U vnts_user -d vnts_db
```

## 🚀 Despliegue en Producción

### 1. Preparar el servidor
```bash
# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
cp .env.production.example .env.production

# Editar con valores de producción
nano .env.production
```

**⚠️ IMPORTANTE**: Cambiar estos valores:
- `SECRET_KEY`: Generar una clave segura
- `POSTGRES_PASSWORD`: Contraseña fuerte
- `ALLOWED_HOSTS`: Tu dominio
- `CORS_ALLOWED_ORIGINS`: Tu dominio con HTTPS
- `VITE_API_URL`: URL de tu API

### 3. Construir y desplegar
```bash
# Construir imágenes
docker compose -f docker-compose.prod.yml build

# Iniciar servicios
docker compose -f docker-compose.prod.yml up -d

# Ver logs
docker compose -f docker-compose.prod.yml logs -f
```

### 4. Configurar Nginx (Reverse Proxy)

Si usas un servidor externo con Nginx:

```nginx
# /etc/nginx/sites-available/vnts

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/vnts/staticfiles/;
    }

    location /media/ {
        alias /var/www/vnts/media/;
    }
}
```

### 5. Configurar SSL con Let's Encrypt
```bash
# Instalar Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificados
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Renovación automática
sudo certbot renew --dry-run
```

### 6. Crear superusuario
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## 🔧 Mantenimiento

### Backup de la base de datos
```bash
# Crear backup
docker compose -f docker-compose.prod.yml exec db pg_dump -U vnts_user vnts_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose -f docker-compose.prod.yml exec -T db psql -U vnts_user vnts_db < backup_20240101_120000.sql
```

### Actualizar la aplicación
```bash
# Detener servicios
docker compose -f docker-compose.prod.yml down

# Actualizar código
git pull origin main

# Reconstruir imágenes
docker compose -f docker-compose.prod.yml build

# Iniciar servicios
docker compose -f docker-compose.prod.yml up -d

# Ejecutar migraciones
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Ver logs
```bash
# Todos los servicios
docker compose -f docker-compose.prod.yml logs -f

# Solo backend
docker compose -f docker-compose.prod.yml logs -f backend

# Solo frontend
docker compose -f docker-compose.prod.yml logs -f frontend

# Solo database
docker compose -f docker-compose.prod.yml logs -f db
```

### Monitoreo
```bash
# Ver estado de contenedores
docker compose -f docker-compose.prod.yml ps

# Ver uso de recursos
docker stats

# Ver espacio en disco
docker system df
```

## 🐛 Troubleshooting

### El backend no se conecta a la base de datos
```bash
# Verificar que la DB esté saludable
docker compose -f docker-compose.prod.yml ps

# Ver logs de la DB
docker compose -f docker-compose.prod.yml logs db

# Reiniciar la DB
docker compose -f docker-compose.prod.yml restart db
```

### El frontend no puede conectarse al backend
1. Verificar `VITE_API_URL` en `.env.production`
2. Verificar `CORS_ALLOWED_ORIGINS` en el backend
3. Verificar que el backend esté corriendo: `curl http://localhost:8000/api/`

### Errores de permisos
```bash
# Dar permisos a volúmenes
sudo chown -R $USER:$USER ./backend/staticfiles
sudo chown -R $USER:$USER ./backend/media
```

### Limpiar contenedores y volúmenes
```bash
# Detener y eliminar todo
docker compose -f docker-compose.prod.yml down -v

# Limpiar imágenes no usadas
docker system prune -a
```

## 📊 Monitoreo y Logs

### Configurar logging en producción

Agregar a `docker-compose.prod.yml`:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 🔒 Seguridad

### Checklist de seguridad
- [ ] Cambiar `SECRET_KEY` de Django
- [ ] Cambiar contraseña de PostgreSQL
- [ ] Configurar `ALLOWED_HOSTS` correctamente
- [ ] Configurar `CORS_ALLOWED_ORIGINS` correctamente
- [ ] Habilitar HTTPS con SSL
- [ ] Configurar firewall (UFW)
- [ ] Deshabilitar `DEBUG=True`
- [ ] Configurar backups automáticos
- [ ] Limitar acceso a puertos (solo 80, 443)

### Configurar firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 📝 Notas Adicionales

- Los volúmenes de Docker persisten los datos entre reinicios
- Los archivos estáticos se sirven desde Nginx en producción
- El backend usa Gunicorn con 4 workers en producción
- El frontend se construye y sirve desde Nginx

## 🆘 Soporte

Para problemas o preguntas:
1. Revisar los logs: `docker compose logs -f`
2. Verificar el estado: `docker compose ps`
3. Consultar la documentación de Django y React

---

**¡Tu aplicación VNTS está lista para producción! 🎉**
