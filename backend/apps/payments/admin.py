from django.contrib import admin
from .models import PaymentMethod


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ['name', 'commission_percentage', 'active', 'organization', 'created_at']
    list_filter = ['active', 'organization']
    search_fields = ['name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    fieldsets = (
        ('Información General', {
            'fields': ('name', 'active')
        }),
        ('Comisiones', {
            'fields': ('commission_percentage',),
            'description': 'Porcentaje de comisión que cobra este método de pago'
        }),
        ('Organización', {
            'fields': ('organization',)
        }),
        ('Metadatos', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
