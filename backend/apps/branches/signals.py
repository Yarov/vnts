"""
Signals para crear sucursal por defecto cuando se crea una organización.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.organizations.models import Organization
from .models import Branch


@receiver(post_save, sender=Organization)
def create_default_branch(sender, instance, created, **kwargs):
    """
    Crea una sucursal por defecto cuando se crea una nueva organización.
    """
    if created:
        Branch.objects.create(
            organization=instance,
            name='Sucursal Principal',
            code='PRINCIPAL',
            address='',
            phone='',
            active=True
        )
        print(f'✓ Sucursal principal creada para organización: {instance.name}')
