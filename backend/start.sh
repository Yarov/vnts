#!/bin/bash

echo "Esperando a que PostgreSQL esté listo..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL está listo!"

echo "Aplicando migraciones..."
python manage.py makemigrations
python manage.py migrate

echo "Creando métodos de pago por defecto..."
python manage.py shell << EOF
from apps.payments.models import PaymentMethod
from apps.organizations.models import Organization

# Crear métodos de pago para cada organización
for org in Organization.objects.all():
    PaymentMethod.objects.get_or_create(
        name='Efectivo',
        organization=org,
        defaults={'active': True}
    )
    PaymentMethod.objects.get_or_create(
        name='Tarjeta',
        organization=org,
        defaults={'active': True}
    )
    PaymentMethod.objects.get_or_create(
        name='Transferencia',
        organization=org,
        defaults={'active': True}
    )
EOF

echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "Iniciando servidor..."
python manage.py runserver 0.0.0.0:8000
