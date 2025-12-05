from django.contrib import admin
from .models import Seller


@admin.register(Seller)
class SellerAdmin(admin.ModelAdmin):
    list_display = ['name', 'numeric_code', 'commission_percentage', 'active', 'organization', 'created_at']
    list_filter = ['active', 'organization']
    search_fields = ['name', 'numeric_code']
    readonly_fields = ['id', 'created_at', 'updated_at']
