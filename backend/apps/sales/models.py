from django.db import models
from apps.core.models import UUIDModel, TenantModel


class Sale(UUIDModel, TenantModel):
    branch = models.ForeignKey(
        'branches.Branch',
        on_delete=models.PROTECT,
        related_name='sales',
        verbose_name='Sucursal',
        null=True,  # Temporal para migración
        blank=True
    )
    seller = models.ForeignKey(
        'sellers.Seller',
        on_delete=models.PROTECT,
        related_name='sales',
        verbose_name='Vendedor'
    )
    client = models.ForeignKey(
        'clients.Client',
        on_delete=models.PROTECT,
        related_name='sales',
        verbose_name='Cliente'
    )
    payment_method = models.ForeignKey(
        'payments.PaymentMethod',
        on_delete=models.PROTECT,
        related_name='sales',
        verbose_name='Método de pago'
    )
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Total')
    notes = models.TextField(blank=True, verbose_name='Notas')
    
    class Meta:
        db_table = 'sales'
        verbose_name = 'Venta'
        verbose_name_plural = 'Ventas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization', '-created_at']),
            models.Index(fields=['seller', '-created_at']),
            models.Index(fields=['branch', '-created_at']),
        ]
    
    def __str__(self):
        return f"Venta {self.id} - {self.total}"


class SaleItem(UUIDModel, TenantModel):
    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='Venta'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='sale_items',
        verbose_name='Producto'
    )
    quantity = models.IntegerField(default=1, verbose_name='Cantidad')
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Precio')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Subtotal')
    
    class Meta:
        db_table = 'sale_items'
        verbose_name = 'Item de Venta'
        verbose_name_plural = 'Items de Venta'
        ordering = ['sale', 'created_at']
    
    def __str__(self):
        return f"{self.product.name} x{self.quantity}"
    
    def save(self, *args, **kwargs):
        self.subtotal = self.price * self.quantity
        super().save(*args, **kwargs)
