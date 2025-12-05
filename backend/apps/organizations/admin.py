from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count
from .models import Organization


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'stats_summary', 'created_at', 'action_buttons']
    search_fields = ['name', 'slug']
    readonly_fields = ['id', 'slug', 'created_at', 'updated_at', 'detailed_stats']
    actions = ['reset_organization_data', 'delete_organization_completely']
    
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(
            _branch_count=Count('branch_set', distinct=True),
            _product_count=Count('product_set', distinct=True),
            _client_count=Count('client_set', distinct=True),
            _seller_count=Count('seller_set', distinct=True),
            _sale_count=Count('sale_set', distinct=True),
        )
        return queryset
    
    def stats_summary(self, obj):
        """Muestra un resumen de estadísticas"""
        return format_html(
            '<strong>Sucursales:</strong> {} | <strong>Productos:</strong> {} | <strong>Clientes:</strong> {} | <strong>Vendedores:</strong> {} | <strong>Ventas:</strong> {}',
            obj._branch_count,
            obj._product_count,
            obj._client_count,
            obj._seller_count,
            obj._sale_count
        )
    stats_summary.short_description = 'Estadísticas'
    
    def detailed_stats(self, obj):
        """Muestra estadísticas detalladas en la página de detalle"""
        from apps.products.models import Product
        from apps.clients.models import Client
        from apps.sellers.models import Seller
        from apps.sales.models import Sale
        from apps.payments.models import PaymentMethod
        from apps.branches.models import Branch
        
        products = Product.objects.filter(organization=obj).count()
        clients = Client.objects.filter(organization=obj).count()
        sellers = Seller.objects.filter(organization=obj).count()
        sales = Sale.objects.filter(organization=obj).count()
        payment_methods = PaymentMethod.objects.filter(organization=obj).count()
        branches = Branch.objects.filter(organization=obj).count()
        
        return format_html(
            '<div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">'
            '<h3>Resumen de Datos</h3>'
            '<ul style="list-style: none; padding: 0;">'
            '<li><strong>🏢 Sucursales:</strong> {}</li>'
            '<li><strong>📦 Productos:</strong> {}</li>'
            '<li><strong>👥 Clientes:</strong> {}</li>'
            '<li><strong>🏪 Vendedores:</strong> {}</li>'
            '<li><strong>💰 Ventas:</strong> {}</li>'
            '<li><strong>💳 Métodos de Pago:</strong> {}</li>'
            '</ul>'
            '</div>',
            branches, products, clients, sellers, sales, payment_methods
        )
    detailed_stats.short_description = 'Estadísticas Detalladas'
    
    def action_buttons(self, obj):
        """Botones de acción personalizados"""
        return format_html(
            '<a class="button" href="{}">Ver Detalles</a>',
            reverse('admin:organizations_organization_change', args=[obj.pk])
        )
    action_buttons.short_description = 'Acciones'
    
    def reset_organization_data(self, request, queryset):
        """Reinicia todos los datos de las organizaciones seleccionadas (mantiene la organización)"""
        from apps.products.models import Product
        from apps.clients.models import Client
        from apps.sellers.models import Seller
        from apps.sales.models import Sale, SaleItem
        from apps.payments.models import PaymentMethod
        from apps.branches.models import Branch
        
        total_deleted = 0
        for org in queryset:
            # Eliminar ventas y sus items
            sale_items = SaleItem.objects.filter(organization=org)
            sales = Sale.objects.filter(organization=org)
            sale_items_count = sale_items.count()
            sales_count = sales.count()
            sale_items.delete()
            sales.delete()
            
            # Eliminar otros datos
            products_count = Product.objects.filter(organization=org).delete()[0]
            clients_count = Client.objects.filter(organization=org).delete()[0]
            sellers_count = Seller.objects.filter(organization=org).delete()[0]
            payment_methods_count = PaymentMethod.objects.filter(organization=org).delete()[0]
            branches_count = Branch.objects.filter(organization=org).delete()[0]
            
            total_deleted += products_count + clients_count + sellers_count + sales_count + sale_items_count + payment_methods_count + branches_count
        
        self.message_user(
            request,
            f'Se reiniciaron {queryset.count()} organizaciones. Total de registros eliminados: {total_deleted}'
        )
    reset_organization_data.short_description = '🔄 Reiniciar datos de organizaciones seleccionadas'
    
    def delete_organization_completely(self, request, queryset):
        """Elimina completamente las organizaciones y todos sus datos"""
        from apps.products.models import Product
        from apps.clients.models import Client
        from apps.sellers.models import Seller
        from apps.sales.models import Sale, SaleItem
        from apps.payments.models import PaymentMethod
        from apps.branches.models import Branch
        from apps.users.models import User
        
        count = queryset.count()
        total_deleted = 0
        
        for org in queryset:
            # Primero eliminar ventas y sus items (tienen referencias)
            sale_items = SaleItem.objects.filter(organization=org)
            sales = Sale.objects.filter(organization=org)
            sale_items_count = sale_items.count()
            sales_count = sales.count()
            sale_items.delete()
            sales.delete()
            
            # Eliminar otros datos
            products_count = Product.objects.filter(organization=org).delete()[0]
            clients_count = Client.objects.filter(organization=org).delete()[0]
            sellers_count = Seller.objects.filter(organization=org).delete()[0]
            payment_methods_count = PaymentMethod.objects.filter(organization=org).delete()[0]
            branches_count = Branch.objects.filter(organization=org).delete()[0]
            users_count = User.objects.filter(organization=org).delete()[0]
            
            total_deleted += products_count + clients_count + sellers_count + sales_count + sale_items_count + payment_methods_count + branches_count + users_count
            
            # Finalmente eliminar la organización
            org.delete()
        
        self.message_user(
            request,
            f'Se eliminaron completamente {count} organizaciones y {total_deleted} registros asociados.'
        )
    delete_organization_completely.short_description = '🗑️ Eliminar organizaciones completamente'
