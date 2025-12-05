from django.db import models
from apps.core.models import UUIDModel, TenantModel


class Seller(UUIDModel, TenantModel):
    name = models.CharField(max_length=255, verbose_name='Nombre')
    numeric_code = models.CharField(max_length=20, verbose_name='Código numérico')
    commission_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0,
        verbose_name='Porcentaje de comisión'
    )
    active = models.BooleanField(default=True, verbose_name='Activo')
    
    class Meta:
        db_table = 'sellers'
        verbose_name = 'Vendedor'
        verbose_name_plural = 'Vendedores'
        ordering = ['name']
        indexes = [
            models.Index(fields=['organization', 'active']),
            models.Index(fields=['numeric_code']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['organization', 'numeric_code'],
                name='unique_seller_code_per_org'
            )
        ]
    
    def __str__(self):
        return f"{self.name} ({self.numeric_code})"
