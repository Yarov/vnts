from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Organization
from .serializers import OrganizationSerializer


class OrganizationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_object(self):
        lookup_value = self.kwargs.get('pk')
        
        # Intentar buscar por slug primero
        try:
            return Organization.objects.get(slug=lookup_value)
        except Organization.DoesNotExist:
            # Si no existe por slug, intentar por ID
            try:
                return Organization.objects.get(id=lookup_value)
            except Organization.DoesNotExist:
                from rest_framework.exceptions import NotFound
                raise NotFound('Organización no encontrada')
    
    @action(detail=True, methods=['get'], url_path='by-slug')
    def get_by_slug(self, request, slug=None):
        organization = self.get_object()
        serializer = self.get_serializer(organization)
        return Response(serializer.data)
