from django.contrib import admin
from .models import Client


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'reference', 'organization', 'created_at']
    list_filter = ['organization']
    search_fields = ['name', 'reference']
    readonly_fields = ['id', 'created_at', 'updated_at']
