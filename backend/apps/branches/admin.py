from django.contrib import admin
from .models import Branch


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'organization', 'active', 'seller_count', 'product_count', 'created_at']
    list_filter = ['active', 'organization']
    search_fields = ['name', 'code', 'address']
    filter_horizontal = ['sellers', 'products']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('organization', 'name', 'code', 'active')
        }),
        ('Contacto', {
            'fields': ('address', 'phone')
        }),
        ('Relaciones', {
            'fields': ('sellers', 'products')
        }),
        ('Metadatos', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def seller_count(self, obj):
        return obj.sellers.count()
    seller_count.short_description = 'Vendedores'
    
    def product_count(self, obj):
        return obj.products.count()
    product_count.short_description = 'Productos'
