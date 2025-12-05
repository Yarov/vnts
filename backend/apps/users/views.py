from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, SellerLoginSerializer
from apps.sellers.models import Seller


class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SellerLoginView(views.APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = SellerLoginSerializer(data=request.data)
        if serializer.is_valid():
            numeric_code = serializer.validated_data['numeric_code']
            org_slug = serializer.validated_data.get('organization_slug')
            
            # Buscar vendedor
            query = Seller.objects.filter(numeric_code=numeric_code, active=True)
            if org_slug:
                query = query.filter(organization__slug=org_slug)
            
            seller = query.first()
            
            if not seller:
                return Response(
                    {'error': 'Código de vendedor inválido o inactivo'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Crear token para el vendedor (sin user real)
            return Response({
                'seller': {
                    'id': str(seller.id),
                    'name': seller.name,
                    'numeric_code': seller.numeric_code,
                    'organization_id': str(seller.organization_id),
                    'role': 'seller'
                }
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
