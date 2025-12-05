from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'full_name', 'role', 'organization_link', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'organization']
    search_fields = ['email', 'full_name', 'organization__name']
    ordering = ['-created_at']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información Personal', {'fields': ('full_name', 'role', 'organization')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Fechas', {'fields': ('created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'full_name', 'role', 'organization'),
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def organization_link(self, obj):
        """Muestra un link a la organización del usuario"""
        if obj.organization:
            url = reverse('admin:organizations_organization_change', args=[obj.organization.pk])
            return format_html(
                '<a href="{}">{}</a>',
                url,
                obj.organization.name
            )
        return '-'
    organization_link.short_description = 'Organización'
