from rest_framework import serializers
from .models import Seller


class SellerSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(read_only=True)
    branches = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    assigned_branches = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Seller
        fields = ['id', 'name', 'numeric_code', 'commission_percentage', 'active', 'organization', 'branches', 'assigned_branches', 'created_at', 'updated_at']
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']
    
    def get_assigned_branches(self, obj):
        """Retorna las sucursales asignadas al vendedor"""
        # Usar la relación ManyToMany 'branches' definida en el modelo Branch
        branches = obj.branches.all()
        return [
            {
                'id': str(branch.id),
                'name': branch.name,
                'code': branch.code
            }
            for branch in branches
        ]
    
    def validate_commission_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('El porcentaje debe estar entre 0 y 100')
        return value
