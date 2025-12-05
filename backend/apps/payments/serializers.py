from rest_framework import serializers
from .models import PaymentMethod


class PaymentMethodSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(read_only=True)
    commission_percentage = serializers.DecimalField(max_digits=5, decimal_places=2, coerce_to_string=False)
    
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'active', 'commission_percentage', 'organization', 'created_at', 'updated_at']
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']
    
    def validate_commission_percentage(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('El porcentaje de comisión debe estar entre 0 y 100')
        return value
