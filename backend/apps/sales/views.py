from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Count
from .models import Sale, SaleItem
from .serializers import SaleSerializer, SaleCreateSerializer


class SaleViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['seller', 'client', 'payment_method']
    search_fields = ['notes', 'client__name', 'seller__name']
    ordering_fields = ['created_at', 'total']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleSerializer
    
    def get_queryset(self):
        queryset = Sale.objects.select_related(
            'seller', 'client', 'payment_method', 'organization'
        ).prefetch_related('items')
        
        if self.request.user.is_authenticated and hasattr(self.request.user, 'organization'):
            queryset = queryset.filter(organization=self.request.user.organization)
        
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        seller_id = self.request.query_params.get('seller_id')
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        
        branch_id = self.request.query_params.get('branch_id')
        if branch_id:
            queryset = queryset.filter(branch_id=branch_id)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sale = serializer.save()
        
        # Usar SaleSerializer para la respuesta
        response_serializer = SaleSerializer(sale)
        headers = self.get_success_headers(response_serializer.data)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Resumen de ventas"""
        queryset = self.get_queryset()
        
        summary = queryset.aggregate(
            total_sales=Count('id'),
            total_amount=Sum('total')
        )
        
        return Response(summary)
    
    @action(detail=False, methods=['get'])
    def by_seller(self, request):
        """Ventas agrupadas por vendedor"""
        queryset = self.get_queryset()
        
        sales_by_seller = queryset.values(
            'seller__id', 'seller__name'
        ).annotate(
            total_sales=Count('id'),
            total_amount=Sum('total')
        ).order_by('-total_amount')
        
        return Response(sales_by_seller)
    
    @action(detail=False, methods=['get'])
    def by_payment_method(self, request):
        """Ventas agrupadas por método de pago con comisiones"""
        from decimal import Decimal
        
        queryset = self.get_queryset()
        sales = queryset.select_related('payment_method')
        
        # Agrupar por método de pago
        payment_data = {}
        for sale in sales:
            if not sale.payment_method:
                continue
                
            method_id = str(sale.payment_method.id)
            if method_id not in payment_data:
                payment_data[method_id] = {
                    'payment_method__id': method_id,
                    'payment_method__name': sale.payment_method.name,
                    'count': 0,
                    'total': Decimal('0'),
                    'commission': Decimal('0'),
                    'commission_percentage': float(sale.payment_method.commission_percentage)
                }
            
            sale_total = Decimal(str(sale.total))
            method_commission_pct = Decimal(str(sale.payment_method.commission_percentage))
            method_commission = sale_total * (method_commission_pct / Decimal('100'))
            
            payment_data[method_id]['count'] += 1
            payment_data[method_id]['total'] += sale_total
            payment_data[method_id]['commission'] += method_commission
        
        # Convertir a lista y calcular monto neto
        result = []
        for data in payment_data.values():
            total = float(data['total'])
            commission = float(data['commission'])
            result.append({
                'payment_method__id': data['payment_method__id'],
                'payment_method__name': data['payment_method__name'],
                'count': data['count'],
                'total': total,
                'commission': commission,
                'commissionPercentage': data['commission_percentage'],
                'netAmount': total - commission
            })
        
        # Ordenar por total descendente
        result.sort(key=lambda x: x['total'], reverse=True)
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def seller_commissions(self, request):
        """Comisiones de vendedores con descuento de comisiones de métodos de pago"""
        from apps.sellers.models import Seller
        from apps.payments.models import PaymentMethod
        from apps.core.utils import parse_date_filter
        from decimal import Decimal
        
        queryset = self.get_queryset()
        
        # Filtrar por fecha si se proporciona
        date_filter = request.query_params.get('date')
        if date_filter:
            date_range = parse_date_filter(date_filter)
            if date_range:
                start_of_day, end_of_day = date_range
                queryset = queryset.filter(created_at__gte=start_of_day, created_at__lte=end_of_day)
        
        # Obtener todas las ventas con sus métodos de pago
        sales = queryset.select_related('seller', 'payment_method')
        
        # Agrupar por vendedor y calcular
        seller_data = {}
        for sale in sales:
            seller_id = str(sale.seller.id)
            if seller_id not in seller_data:
                seller_data[seller_id] = {
                    'seller': sale.seller,
                    'total_sales': Decimal('0'),
                    'total_payment_method_commission': Decimal('0'),
                    'sales_by_method': {}
                }
            
            sale_total = Decimal(str(sale.total))
            seller_data[seller_id]['total_sales'] += sale_total
            
            # Calcular comisión del método de pago
            if sale.payment_method:
                method_commission_pct = Decimal(str(sale.payment_method.commission_percentage))
                method_commission = sale_total * (method_commission_pct / Decimal('100'))
                seller_data[seller_id]['total_payment_method_commission'] += method_commission
        
        # Calcular comisiones finales
        commissions = []
        for seller_id, data in seller_data.items():
            seller = data['seller']
            total_sales = float(data['total_sales'])
            payment_method_commission = float(data['total_payment_method_commission'])
            net_amount = total_sales - payment_method_commission
            
            commission_percentage = float(seller.commission_percentage)
            commission_amount = net_amount * (commission_percentage / 100)
            
            commissions.append({
                'seller_id': seller_id,
                'seller_name': seller.name,
                'total_sales': total_sales,
                'payment_method_commission': payment_method_commission,
                'net_amount': net_amount,
                'commission_percentage': commission_percentage,
                'commission_amount': commission_amount
            })
        
        return Response(commissions)
    
    @action(detail=False, methods=['get'])
    def top_products(self, request):
        """Productos más vendidos"""
        from apps.products.models import Product
        from django.db.models import Sum, Count
        
        queryset = self.get_queryset()
        
        # Obtener items de ventas agrupados por producto
        top_products = SaleItem.objects.filter(
            sale__in=queryset
        ).values(
            'product__id', 'product__name'
        ).annotate(
            quantity=Sum('quantity'),
            total=Sum('subtotal')
        ).order_by('-total')[:10]
        
        return Response(top_products)
    
    @action(detail=False, methods=['get'])
    def client_stats(self, request):
        """Estadísticas de compras por cliente"""
        from django.db.models import Count, Max
        
        queryset = self.get_queryset()
        
        # Obtener estadísticas agrupadas por cliente
        client_stats = queryset.values(
            'client__id'
        ).annotate(
            purchase_count=Count('id'),
            last_purchase=Max('created_at')
        )
        
        # Formatear respuesta
        stats = []
        for stat in client_stats:
            stats.append({
                'id': str(stat['client__id']),
                'purchase_count': stat['purchase_count'],
                'last_purchase': stat['last_purchase'].isoformat() if stat['last_purchase'] else None
            })
        
        return Response(stats)
