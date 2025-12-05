"""
Modelos base para todas las apps.
Incluye funcionalidad multi-tenant.
"""
from django.db import models
import uuid


class TimeStampedModel(models.Model):
    """
    Modelo abstracto que agrega campos de timestamp.
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de creación')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Fecha de actualización')

    class Meta:
        abstract = True


class TenantModel(TimeStampedModel):
    """
    Modelo abstracto para multi-tenancy.
    Todos los modelos que hereden de este pertenecerán a una organización.
    """
    organization = models.ForeignKey(
        'organizations.Organization',
        on_delete=models.CASCADE,
        related_name='%(class)s_set',
        verbose_name='Organización'
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        # Validar que siempre tenga una organización
        if not self.organization_id:
            raise ValueError(f'{self.__class__.__name__} debe tener una organización asignada')
        super().save(*args, **kwargs)


class UUIDModel(models.Model):
    """
    Modelo abstracto que usa UUID como primary key.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True
