from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    branches = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    branch_ids = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'category', 'description', 'active', 'organization', 'branches', 'branch_ids', 'created_at', 'updated_at']
        read_only_fields = ['id', 'organization', 'branch_ids', 'created_at', 'updated_at']
    
    def get_branch_ids(self, obj):
        """Retorna los IDs de las sucursales asignadas"""
        return [str(branch.id) for branch in obj.branches.all()]
    
    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('El precio debe ser mayor a 0')
        return value
