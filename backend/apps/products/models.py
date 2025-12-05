from django.db import models
from apps.core.models import UUIDModel, TenantModel


class Product(UUIDModel, TenantModel):
    name = models.CharField(max_length=255, verbose_name='Nombre')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio')
    category = models.CharField(max_length=100, blank=True, verbose_name='Categoría')
    description = models.TextField(blank=True, verbose_name='Descripción')
    active = models.BooleanField(default=True, verbose_name='Activo')
    branches = models.ManyToManyField('branches.Branch', related_name='products', blank=True, verbose_name='Sucursales')
    
    class Meta:
        db_table = 'products'
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'
        ordering = ['name']
        indexes = [
            models.Index(fields=['organization', 'active']),
            models.Index(fields=['category']),
        ]
    
    def __str__(self):
        return self.name
