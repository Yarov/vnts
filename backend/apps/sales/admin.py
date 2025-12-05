from django.contrib import admin
from .models import Sale, SaleItem


class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ['subtotal']


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ['id', 'seller', 'client', 'total', 'payment_method', 'organization', 'created_at']
    list_filter = ['payment_method', 'organization', 'created_at']
    search_fields = ['notes', 'client__name', 'seller__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [SaleItemInline]


@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):
    list_display = ['sale', 'product', 'quantity', 'price', 'subtotal', 'created_at']
    list_filter = ['organization', 'created_at']
    search_fields = ['product__name', 'sale__id']
    readonly_fields = ['id', 'subtotal', 'created_at', 'updated_at']
