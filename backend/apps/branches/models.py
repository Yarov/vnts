from django.db import models
from apps.core.models import UUIDModel, TenantModel


class Branch(UUIDModel, TenantModel):
    """
    Sucursal de una organización.
    Cada organización puede tener múltiples sucursales.
    """
    name = models.CharField(max_length=255, verbose_name='Nombre')
    code = models.CharField(max_length=50, verbose_name='Código')
    address = models.TextField(blank=True, verbose_name='Dirección')
    phone = models.CharField(max_length=20, blank=True, verbose_name='Teléfono')
    active = models.BooleanField(default=True, verbose_name='Activa')
    
    # Relaciones Many-to-Many
    sellers = models.ManyToManyField(
        'sellers.Seller',
        related_name='branches',
        blank=True,
        verbose_name='Vendedores'
    )
    
    class Meta:
        db_table = 'branches'
        verbose_name = 'Sucursal'
        verbose_name_plural = 'Sucursales'
        ordering = ['name']
        indexes = [
            models.Index(fields=['organization', 'active']),
            models.Index(fields=['code']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['organization', 'code'],
                name='unique_branch_code_per_org'
            )
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"
