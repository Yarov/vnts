from rest_framework import serializers
from .models import Sale, SaleItem
from apps.sellers.serializers import SellerSerializer
from apps.clients.serializers import ClientSerializer
from apps.payments.serializers import PaymentMethodSerializer


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'subtotal', 'organization']
        read_only_fields = ['id', 'subtotal']


class SaleSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()
    seller_name = serializers.CharField(source='seller.name', read_only=True)
    client_name = serializers.CharField(source='client.name', read_only=True)
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    branch_name = serializers.CharField(source='branch.name', read_only=True, allow_null=True)
    
    class Meta:
        model = Sale
        fields = [
            'id', 'branch', 'branch_name', 'seller', 'seller_name', 'client', 'client_name',
            'payment_method', 'payment_method_name', 'total', 'notes',
            'items', 'organization', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_items(self, obj):
        items = obj.items.all()
        return SaleItemSerializer(items, many=True).data


class SaleCreateSerializer(serializers.Serializer):
    branch_id = serializers.UUIDField(required=False, allow_null=True)
    seller_id = serializers.UUIDField()
    client_id = serializers.UUIDField()
    payment_method_id = serializers.UUIDField()
    total = serializers.DecimalField(max_digits=10, decimal_places=2)
    notes = serializers.CharField(required=False, allow_blank=True)
    organization_id = serializers.UUIDField()
    items = serializers.ListField(child=serializers.DictField())
    
    def create(self, validated_data):
        from apps.branches.models import Branch
        
        items_data = validated_data.pop('items')
        branch_id = validated_data.get('branch_id')
        
        # Si no se proporciona branch_id, usar la sucursal por defecto
        if not branch_id:
            default_branch = Branch.objects.filter(
                organization_id=validated_data['organization_id'],
                code='PRINCIPAL'
            ).first()
            if default_branch:
                branch_id = default_branch.id
        
        # Crear venta
        sale = Sale.objects.create(
            branch_id=branch_id,
            seller_id=validated_data['seller_id'],
            client_id=validated_data['client_id'],
            payment_method_id=validated_data['payment_method_id'],
            total=validated_data['total'],
            notes=validated_data.get('notes', ''),
            organization_id=validated_data['organization_id']
        )
        
        # Crear items
        for item_data in items_data:
            SaleItem.objects.create(
                sale=sale,
                product_id=item_data['product_id'],
                quantity=item_data.get('quantity', 1),
                price=item_data['price'],
                subtotal=item_data['subtotal'],
                organization_id=validated_data['organization_id']
            )
        
        return sale
