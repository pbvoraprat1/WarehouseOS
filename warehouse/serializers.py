from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Warehouse, StockBalance, StockTransaction, Product, Category, ActivityLog, UserProfile


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
    product_sku = serializers.CharField(source='product.sku', read_only=True)
    category_name = serializers.CharField(source='product.category.name', read_only=True)
    product_is_active = serializers.BooleanField(source='product.is_active', read_only=True)
    class Meta:
        model = StockBalance
        fields = '__all__'

#API สำหรับแสดงรายการการเคลื่อนไหวสินค้าในคลัง(read-only)
class StockTransactionSerializer(serializers.ModelSerializer):
    action_by_name = serializers.CharField(source='created_by.username', read_only=True)
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
    category_name = serializers.CharField(source='category.name')
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

    def create(self, validated_data):
        category_data = validated_data.pop('category', None)
        if category_data and 'name' in category_data:
            category, _ = Category.objects.get_or_create(name=category_data['name'])
            validated_data['category'] = category
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        category_data = validated_data.pop('category',None)
        if category_data and 'name' in category_data:
            category, _ = Category.objects.get_or_create(name=category_data['name'])
            validated_data['category'] = category
        return super().update(instance, validated_data)
    
#ส่ง is_superuser ไปใน token
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_superuser'] = self.user.is_superuser
        data['username'] = self.user.username
        
        try:
            profile = self.user.profile
        except Exception:
            profile = None
            
        data['can_manage_products'] = profile.can_manage_products if profile else False
        data['can_manage_auto_reorder'] = profile.can_manage_auto_reorder if profile else False
        data['can_manage_stock_movements'] = profile.can_manage_stock_movements if profile else False
        data['can_manage_warehouses'] = profile.can_manage_warehouses if profile else False
        data['can_view_activity_logs'] = profile.can_view_activity_logs if profile else False
        
        return data
    
class ActivityLogSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = ActivityLog
        fields = '__all__'
        read_only_fields = ('id','user','action','timestamp')

class UserSerializer(serializers.ModelSerializer):
    can_manage_products = serializers.BooleanField(source='profile.can_manage_products', read_only=True)
    can_manage_auto_reorder = serializers.BooleanField(source='profile.can_manage_auto_reorder', read_only=True)
    can_manage_warehouses = serializers.BooleanField(source='profile.can_manage_warehouses', read_only=True)
    can_manage_stock_movements = serializers.BooleanField(source='profile.can_manage_stock_movements', read_only=True)
    can_view_activity_logs = serializers.BooleanField(source='profile.can_view_activity_logs', read_only=True)
    class Meta:
        model = User
        fields = ['id',
                'username',
                'is_superuser',
                'is_active',
                'can_manage_products',
                'can_manage_auto_reorder',
                'can_manage_stock_movements',
                'can_manage_warehouses',
                'can_view_activity_logs']
