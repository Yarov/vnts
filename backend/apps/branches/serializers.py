from rest_framework import serializers
from .models import Branch


class BranchSerializer(serializers.ModelSerializer):
    seller_count = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Branch
        fields = [
            'id', 'organization', 'name', 'code', 'address', 'phone', 
            'active', 'sellers', 'products', 'seller_count', 'product_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_seller_count(self, obj):
        return obj.sellers.count()
    
    def get_product_count(self, obj):
        return obj.products.count()


class BranchListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listados"""
    seller_count = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Branch
        fields = [
            'id', 'name', 'code', 'address', 'phone', 'active',
            'seller_count', 'product_count', 'created_at'
        ]
    
    def get_seller_count(self, obj):
        return obj.sellers.count()
    
    def get_product_count(self, obj):
        return obj.products.count()
