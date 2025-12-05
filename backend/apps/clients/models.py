from django.db import models
from apps.core.models import UUIDModel, TenantModel


class Client(UUIDModel, TenantModel):
    name = models.CharField(max_length=255, verbose_name='Nombre')
    reference = models.CharField(max_length=100, blank=True, verbose_name='Referencia')
    
    class Meta:
        db_table = 'clients'
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        ordering = ['name']
        indexes = [
            models.Index(fields=['organization', 'name']),
        ]
    
    def __str__(self):
        return self.name
