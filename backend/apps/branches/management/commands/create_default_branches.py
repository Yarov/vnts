"""
Comando para crear sucursales por defecto y migrar datos existentes.
"""
from django.core.management.base import BaseCommand
from apps.organizations.models import Organization
from apps.branches.models import Branch
from apps.sales.models import Sale
from apps.products.models import Product
from apps.sellers.models import Seller


class Command(BaseCommand):
    help = 'Crea sucursales por defecto para cada organización y migra datos existentes'

    def handle(self, *args, **options):
        organizations = Organization.objects.all()
        
        for org in organizations:
            self.stdout.write(f'\nProcesando organización: {org.name}')
            
            # Crear sucursal principal si no existe
            branch, created = Branch.objects.get_or_create(
                organization=org,
                code='PRINCIPAL',
                defaults={
                    'name': 'Sucursal Principal',
                    'address': '',
                    'phone': '',
                    'active': True
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'  ✓ Sucursal principal creada'))
            else:
                self.stdout.write(f'  - Sucursal principal ya existe')
            
            # Asignar todos los productos a la sucursal principal
            products = Product.objects.filter(organization=org)
            branch.products.set(products)
            self.stdout.write(f'  ✓ {products.count()} productos asignados')
            
            # Asignar todos los vendedores a la sucursal principal
            sellers = Seller.objects.filter(organization=org)
            branch.sellers.set(sellers)
            self.stdout.write(f'  ✓ {sellers.count()} vendedores asignados')
            
            # Asignar todas las ventas sin sucursal a la sucursal principal
            sales_updated = Sale.objects.filter(
                organization=org,
                branch__isnull=True
            ).update(branch=branch)
            self.stdout.write(f'  ✓ {sales_updated} ventas asignadas')
        
        self.stdout.write(self.style.SUCCESS(f'\n✅ Proceso completado para {organizations.count()} organizaciones'))
