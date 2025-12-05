"""
URL configuration for VNTS SaaS project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI documentation
schema_view = get_schema_view(
    openapi.Info(
        title="VNTS SaaS API",
        default_version='v1',
        description="API REST para sistema de ventas multi-tenant",
        terms_of_service="https://www.vnts.app/terms/",
        contact=openapi.Contact(email="contact@vnts.app"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API v1
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/organizations/', include('apps.organizations.urls')),
    path('api/v1/products/', include('apps.products.urls')),
    path('api/v1/clients/', include('apps.clients.urls')),
    path('api/v1/sellers/', include('apps.sellers.urls')),
    path('api/v1/branches/', include('apps.branches.urls')),
    path('api/v1/sales/', include('apps.sales.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
