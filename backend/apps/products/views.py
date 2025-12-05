from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['active', 'category']
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        queryset = Product.objects.prefetch_related('branches').all()
        
        # Filtrar por organización si el usuario está autenticado
        if self.request.user.is_authenticated and hasattr(self.request.user, 'organization'):
            queryset = queryset.filter(organization=self.request.user.organization)
        
        # Filtrar por organization_id si viene en query params
        org_id = self.request.query_params.get('organization_id')
        if org_id:
            queryset = queryset.filter(organization_id=org_id)
        
        # Filtrar por branch_id si viene en query params (para vendedores)
        branch_id = self.request.query_params.get('branch_id')
        if branch_id:
            queryset = queryset.filter(branches__id=branch_id)
        
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
        
        # Guardar el producto
        product = serializer.save(organization=organization)
        
        # Asignar sucursales
        if branches_ids:
            # Si se especificaron branches, asignar esas
            branches = Branch.objects.filter(id__in=branches_ids, organization=organization)
            product.branches.set(branches)
        else:
            # Si no se especificaron, asignar a la sucursal PRINCIPAL (default)
            default_branch = Branch.objects.filter(
                organization=organization,
                code='PRINCIPAL'
            ).first()
            if default_branch:
                product.branches.add(default_branch)
    
    def perform_update(self, serializer):
        # Extraer branches del validated_data si existe
        branches_ids = serializer.validated_data.pop('branches', None)
        
        # Guardar el producto
        product = serializer.save()
        
        # Actualizar sucursales solo si se enviaron
        if branches_ids is not None:
            from apps.branches.models import Branch
            organization = product.organization
            branches = Branch.objects.filter(id__in=branches_ids, organization=organization)
            product.branches.set(branches)
