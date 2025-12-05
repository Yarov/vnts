from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from apps.organizations.models import Organization
from apps.organizations.serializers import OrganizationCreateSerializer


class UserSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'role', 'organization', 'organization_name', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(max_length=255)
    organization_name = serializers.CharField(max_length=255)
    primary_color = serializers.CharField(max_length=7, default='#3b82f6')
    
    def create(self, validated_data):
        # Crear organización
        organization = Organization.objects.create(
            name=validated_data['organization_name'],
            primary_color=validated_data.get('primary_color', '#3b82f6')
        )
        
        # Crear usuario admin
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            role='admin',
            organization=organization
        )
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Credenciales inválidas')
        if not user.is_active:
            raise serializers.ValidationError('Usuario inactivo')
        data['user'] = user
        return data


class SellerLoginSerializer(serializers.Serializer):
    numeric_code = serializers.CharField(max_length=20)
    organization_slug = serializers.CharField(max_length=255, required=False)
