from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentMethodViewSet

router = DefaultRouter()
router.register(r'methods', PaymentMethodViewSet, basename='payment-method')

urlpatterns = [
    path('', include(router.urls)),
]
