from django.urls import path
from .views import (
    LowStockAlertAPIView, WarehouseListAPIView, WarehouseDetailAPIView,
    ProductDetailAPIView, ProductListAPIView, StockBalanceListAPIView,
    StockMovementAPIView, StockBalanceAPIView, ActivityLogListView,
    UserManagementAPIView, UserDetailManagementAPIView, HardDeleteData,
    WarehouseProductsAPIView
)   

urlpatterns = [
    path('stock-movements/', StockMovementAPIView.as_view(), name='api-stock-movement'),
    path('products/', ProductListAPIView.as_view(), name='api-product-list'),
    path('products/<uuid:product_id>/', ProductDetailAPIView.as_view(), name='api-product-detail'),
    path('products/<uuid:product_id>/<int:warehouse_id>/', StockBalanceAPIView.as_view(), name='api-stock-balance'),
    path('<int:warehouse_id>/stock-balances/', StockBalanceListAPIView.as_view(), name='api-stock-balance-list'),
    path('dashboard/<int:warehouse_id>/', LowStockAlertAPIView.as_view(), name='api-low-stock-alert'),
    path('list/', WarehouseListAPIView.as_view(), name='api-warehouse-list'),
    path('list/<int:warehouse_id>/', WarehouseDetailAPIView.as_view(), name='api-warehouse-detail'),
    path('log/', ActivityLogListView.as_view(), name='api-activity-log-list'),
    path('users/', UserManagementAPIView.as_view(), name='user_management'),
    path('users/<int:user_id>/', UserDetailManagementAPIView.as_view(), name='user_detail_management'),
    path('hard-delete/', HardDeleteData.as_view(), name='hard-delete'),
    path('list/<int:warehouse_id>/products/', WarehouseProductsAPIView.as_view(), name='api-warehouse-products'),
]