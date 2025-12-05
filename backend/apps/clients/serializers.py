from rest_framework import serializers
from .models import Client


class ClientSerializer(serializers.ModelSerializer):
    organization = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = Client
        fields = ['id', 'name', 'reference', 'organization', 'created_at', 'updated_at']
        read_only_fields = ['id', 'organization', 'created_at', 'updated_at']
