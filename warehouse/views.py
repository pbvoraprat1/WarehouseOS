from itertools import product
from django.db.models import F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
from .services import perform_stock_transaction
from .serializers import StockBalanceSerializer, StockTransactionSerializer, StockmovementSerializer, ProductSerializer, WarehouseSerializer, CustomTokenObtainPairSerializer, ActivityLogSerializer, UserSerializer
from .models import Product, StockBalance, Warehouse, StockTransaction, ActivityLog, Category, UserProfile
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import generics
from django.contrib.auth.models import User

#การเคลื่อนไหวของสินค้าในคลัง เช่น รับสินค้าเข้าคลัง, เบิกสินค้า, ปรับยอดคงเหลือ
class StockMovementAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = StockmovementSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        data = serializer.validated_data
        try:
            transaction = perform_stock_transaction(
                product=data['product_id'],       
                warehouse=data['warehouse_id'],
                quantity=data['quantity'],
                transaction_type=data['transaction_type'],
                user=request.user,
                reference_document=data.get('reference_document', '')
            )
            return Response({
                "message": "ทำรายการสำเร็จเรียบร้อย",
                "transaction_id": transaction.transactions_id, 
                "balance_after": transaction.balance_after
            }, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"สาเหตุที่พัง: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

#รายการสินค้าทั้งหมดที่มีอยู่ในระบบ(เฉพาะสินค้าที่ is_active = True)    
class ProductListAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        return Product.objects.filter(is_active=True).order_by('sku')
        
    def paginate_queryset(self, queryset):
        if self.request.query_params.get('all') == 'true':
            return None
        return super().paginate_queryset(queryset)
    def perform_create(self, serializer):
        product = serializer.save()
        activity_log = ActivityLog.objects.create(
            user=self.request.user, 
            action=f"Created product: {product.name} (SKU: {product.sku})")
        print(f"สร้างสินค้า: {product.name}")

#รายละเอียดสินค้าและแก้ไขข้อมูลสินค้า(เช่น ชื่อ, หมวดหมู่, ราคาต้นทุน) และลบสินค้า(ทำให้ is_active = False)
class ProductDetailAPIView(APIView):
    #เช็คสิทธการเข้าถึง
    def get (self):
        if self.request.method in ['PUT' , 'DELETE', 'PATCH']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def put(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductSerializer(product, data=request.data)
            if serializer.is_valid():
                serializer.save()
                activity_log = ActivityLog.objects.create(
                    user=request.user, 
                    action=f"Updated product: {product.name} (SKU: {product.sku})")
                print(f"แก้ไขสินค้า: {product.name}")
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({"error": "ไม่พบสินค้า"}, status=status.HTTP_404_NOT_FOUND)
    def delete(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
            product.is_active = False
            product.save()
            #สำหรับบันทึกว่าใครเป็นคนลบ
            ActivityLog.objects.create(
                user=request.user, 
                action=f"Deleted product: {product.name} (SKU: {product.sku})")
            print(f"ลบสินค้า: {product.name}")
            return Response({"message": "ลบสินค้าสำเร็จ"}, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "ไม่พบสินค้า"}, status=status.HTTP_404_NOT_FOUND)
    def patch(self, request, product_id):
        try:
            product = Product.objects.get(id=product_id)
            serializer = ProductSerializer(product, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Product.DoesNotExist:
            return Response({"error": "ไม่พบสินค้า"}, status=status.HTTP_404_NOT_FOUND)

#ยอดคงเหลือสินค้าในคลังที่ระบุ      
class StockBalanceAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, product_id, warehouse_id):
        try:
            stock_balance = StockBalance.objects.get(product_id=product_id, warehouse_id=warehouse_id)
            serializer = StockBalanceSerializer(stock_balance)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except StockBalance.DoesNotExist:
            return Response({"error": "ไม่พบยอดคงเหลือสำหรับสินค้านี้ในคลังนี้"}, status=status.HTTP_404_NOT_FOUND)

#ยอดคงเหลือสินค้าในคลังทั้งหมดในคลังที่ระบุ       
class StockBalanceListAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, warehouse_id):
        try:
            warehouse = Warehouse.objects.get(id=warehouse_id)
        except Warehouse.DoesNotExist:
            return Response({"error": "ไม่มีคลังสินค้านี้"}, status=status.HTTP_404_NOT_FOUND)
        stock_balances = StockBalance.objects.filter(warehouse_id=warehouse_id)
        if not stock_balances.exists():
            return Response({"error": "ไม่พบยอดคงเหลือสำหรับคลังนี้"}, status=status.HTTP_404_NOT_FOUND)
        serializer = StockBalanceSerializer(stock_balances, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
       
#แจ้งเตือนเมื่อยอดคงเหลือ == reorder_level และแสดงรายการเคลื่อนไหวของสินค้าทั้งหมดในคลังที่ระบุ
class LowStockAlertAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, warehouse_id):
        try:
            warehouse = Warehouse.objects.get(id=warehouse_id)
        except Warehouse.DoesNotExist:
            return Response({"error": "ไม่พบคลังสินค้า"}, status=status.HTTP_404_NOT_FOUND)
        lowStockBalance = StockBalance.objects.filter(warehouse_id=warehouse_id, quantity__lte=F('product__reorder_level'))
        out_of_stock = lowStockBalance.filter(quantity=0)
        near_out_of_stock = lowStockBalance.filter(quantity__gt=0)
        recent_transactions = StockTransaction.objects.filter(warehouse_id=warehouse_id).order_by('-timestamp')[:10]  # แสดงรายการเคลื่อนไหวล่าสุด 10 รายการ
        transactions_data = StockTransactionSerializer(recent_transactions, many=True).data
        low_stock_data = StockBalanceSerializer(lowStockBalance, many=True).data
        return Response({
            "warehouse_name": warehouse.name,
            "summary": {
                "total_low_stock": lowStockBalance.count(),
                "out_of_stock": out_of_stock.count(),
                "near_out_of_stock": near_out_of_stock.count(),
            },
            "low_stock_products": low_stock_data,
            "recent_transactions": transactions_data,
        },  status=status.HTTP_200_OK)

class WarehouseListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        warehouses = Warehouse.objects.filter(is_active=True)
        serializer = WarehouseSerializer(warehouses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class ActivityLogListView(generics.ListAPIView):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

class UserManagementAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('id')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserDetailManagementAPIView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            profile, _ = UserProfile.objects.get_or_create(user=user)
            for key, value in request.data.items():
                if hasattr(profile, key):
                    setattr(profile, key, value)
            profile.save()
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)