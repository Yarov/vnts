#!/bin/bash

echo "🚀 Iniciando VNTS en modo desarrollo..."

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    echo "Por favor inicia Docker Desktop y vuelve a intentar"
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env.development ]; then
    echo "📝 Creando archivo .env.development..."
    cp .env.production.example .env.development
    echo "✅ Archivo .env.development creado"
    echo "⚠️  Revisa y ajusta las variables de entorno si es necesario"
fi

# Iniciar servicios
echo "🐳 Iniciando contenedores..."
docker compose -f docker-compose.dev.yml up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# Mostrar estado
echo ""
echo "✅ Servicios iniciados:"
docker compose -f docker-compose.dev.yml ps

echo ""
echo "🌐 Accede a la aplicación:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   Admin:    http://localhost:8000/admin"
echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs:     docker compose -f docker-compose.dev.yml logs -f"
echo "   Detener:      docker compose -f docker-compose.dev.yml down"
echo "   Reiniciar:    docker compose -f docker-compose.dev.yml restart"
echo ""
