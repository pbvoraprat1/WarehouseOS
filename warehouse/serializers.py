from rest_framework import serializers
from .models import Warehouse, StockBalance, StockTransaction, Product

#API สำหรับจัดการคลังสินค้า
class WarehouseSerializer(serializers.ModelSerializer):
    total_products = serializers.SerializerMethodField()
    
    class Meta:
        model = Warehouse
        fields = '__all__'
        
    def get_total_products(self, obj):
        return obj.stock_balances.count()
        
#API สำหรับแสดงยอดคงเหลือสินค้าในคลัง
class StockBalanceSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = StockBalance
        fields = '__all__'

#API สำหรับแสดงรายการการเคลื่อนไหวสินค้าในคลัง(read-only)
class StockTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockTransaction
        fields = '__all__'

#API เอาไว้สำหรับตรวจ json
class StockmovementSerializer(serializers.Serializer):
    product_id = serializers.PrimaryKeyRelatedField(
    queryset=Product.objects.all(), 
    required=True
)
    warehouse_id = serializers.PrimaryKeyRelatedField(
    queryset=Warehouse.objects.all(), 
    required=True
)
    quantity = serializers.IntegerField(min_value=1, required=True)
    transaction_type = serializers.ChoiceField(choices=StockTransaction.TransactionType.choices)
    reference_document = serializers.CharField(max_length=255, required=False, allow_blank=True)

class ProductSerializer(serializers.ModelSerializer):
    #API สำหรับแสดงข้อมูลสินค้า
    category_name = serializers.CharField(source='category.name', read_only=True)
    #สำหรับแสดงยอดคงเหลือรวมจากทุกคลัง
    total_stock = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 
            'sku', 
            'name', 
            'category_name', 
            'base_price', 
            'reorder_level', 
            'is_active', 
            'total_stock'
        ]

    def get_total_stock(self, obj):
        from django.db.models import Sum
        stock = obj.stock_balances.aggregate(total=Sum('quantity'))['total']
        return stock if stock is not None else 0