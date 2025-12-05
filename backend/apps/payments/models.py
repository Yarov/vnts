from django.db import models
from apps.core.models import UUIDModel, TenantModel


class PaymentMethod(UUIDModel, TenantModel):
    name = models.CharField(max_length=100, verbose_name='Nombre')
    active = models.BooleanField(default=True, verbose_name='Activo')
    commission_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        default=0.00,
        verbose_name='Comisión (%)',
        help_text='Porcentaje de comisión que cobra este método de pago (0-100)'
    )
    
    class Meta:
        db_table = 'payment_methods'
        verbose_name = 'Método de Pago'
        verbose_name_plural = 'Métodos de Pago'
        ordering = ['name']
        indexes = [
            models.Index(fields=['organization', 'active']),
        ]
    
    def __str__(self):
        return self.name
