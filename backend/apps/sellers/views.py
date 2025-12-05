from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import ProtectedError
from .models import Seller
from .serializers import SellerSerializer


class SellerViewSet(viewsets.ModelViewSet):
    serializer_class = SellerSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['active']
    search_fields = ['name', 'numeric_code']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = Seller.objects.all()
        
        if self.request.user.is_authenticated and hasattr(self.request.user, 'organization'):
            queryset = queryset.filter(organization=self.request.user.organization)
        
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        return queryset
    
    def perform_create(self, serializer):
        from apps.branches.models import Branch
        
        # Asignar organización del usuario autenticado
        if self.request.user.is_authenticated and hasattr(self.request.user, 'organization'):
            organization = self.request.user.organization
        else:
            organization = None
        
        # Extraer branches del validated_data
        branches_ids = serializer.validated_data.pop('branches', None)
        
        # Guardar el vendedor
        seller = serializer.save(organization=organization)
        
        # Asignar sucursales
        if branches_ids:
            # Si se especificaron branches, asignar esas
            branches = Branch.objects.filter(id__in=branches_ids, organization=organization)
            seller.branches.set(branches)
        else:
            # Si no se especificaron, asignar a la sucursal PRINCIPAL (default)
            default_branch = Branch.objects.filter(
                organization=organization,
                code='PRINCIPAL'
            ).first()
            if default_branch:
                seller.branches.add(default_branch)
    
    def perform_update(self, serializer):
        # Extraer branches del validated_data si existe
        branches_ids = serializer.validated_data.pop('branches', None)
        
        # Guardar el vendedor
        seller = serializer.save()
        
        # Actualizar sucursales solo si se enviaron
        if branches_ids is not None:
            from apps.branches.models import Branch
            organization = seller.organization
            branches = Branch.objects.filter(id__in=branches_ids, organization=organization)
            seller.branches.set(branches)
    
    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'error': 'No se puede eliminar este vendedor porque tiene ventas asociadas. Puedes desactivarlo en su lugar.'},
                status=status.HTTP_400_BAD_REQUEST
            )
