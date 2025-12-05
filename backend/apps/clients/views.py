from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Client
from .serializers import ClientSerializer


class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'reference']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = Client.objects.all()
        
        if self.request.user.is_authenticated and hasattr(self.request.user, 'organization'):
            queryset = queryset.filter(organization=self.request.user.organization)
        
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        return queryset
    
    def perform_create(self, serializer):
        # Obtener organización del usuario autenticado
        organization = None
        
        if self.request.user.is_authenticated:
            if hasattr(self.request.user, 'organization'):
                organization = self.request.user.organization
            elif hasattr(self.request.user, 'seller'):
                # Si es un vendedor, obtener su organización
                organization = self.request.user.seller.organization
        
        # Si no hay organización del usuario, intentar obtenerla del body
        if not organization:
            org_id = self.request.data.get('organization')
            if org_id:
                from apps.organizations.models import Organization
                try:
                    organization = Organization.objects.get(id=org_id)
                except Organization.DoesNotExist:
                    pass
        
        if organization:
            serializer.save(organization=organization)
        else:
            serializer.save()
