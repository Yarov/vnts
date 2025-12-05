from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'category', 'active', 'organization', 'created_at']
    list_filter = ['active', 'category', 'organization']
    search_fields = ['name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
