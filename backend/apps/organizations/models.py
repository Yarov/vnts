from django.db import models
from django.utils.text import slugify
from apps.core.models import UUIDModel, TimeStampedModel


class Organization(UUIDModel, TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name='Nombre')
    slug = models.SlugField(max_length=255, unique=True, verbose_name='Slug')
    primary_color = models.CharField(max_length=7, default='#3b82f6', verbose_name='Color primario')
    
    class Meta:
        db_table = 'organizations'
        verbose_name = 'Organización'
        verbose_name_plural = 'Organizaciones'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
