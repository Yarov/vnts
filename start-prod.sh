#!/bin/bash

echo "🚀 Desplegando VNTS en modo producción..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Verificar archivo .env
if [ ! -f .env.production ]; then
    echo "❌ Error: Archivo .env.production no encontrado"
    echo "Por favor crea el archivo .env.production con las variables de entorno"
    echo "Puedes usar .env.production.example como plantilla"
    exit 1
fi

# Construir imágenes
echo "🔨 Construyendo imágenes..."
docker compose -f docker-compose.prod.yml build

# Iniciar servicios
echo "🐳 Iniciando contenedores..."
docker compose -f docker-compose.prod.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Ejecutar migraciones
echo "📦 Ejecutando migraciones..."
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Mostrar estado
echo ""
echo "✅ Servicios desplegados:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "🌐 La aplicación está corriendo en:"
echo "   Frontend: http://localhost"
echo "   Backend:  http://localhost:8000"
echo ""
echo "⚠️  Recuerda configurar:"
echo "   - Nginx reverse proxy"
echo "   - SSL con Let's Encrypt"
echo "   - Firewall (UFW)"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "   Detener:      docker compose -f docker-compose.prod.yml down"
echo "   Backup DB:    docker compose -f docker-compose.prod.yml exec db pg_dump -U vnts_user vnts_db > backup.sql"
echo ""
