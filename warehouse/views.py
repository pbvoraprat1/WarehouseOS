from itertools import product
from django.db.models import F, Q
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

class WarehouseListAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = WarehouseSerializer
    #สำหรับ pageination
    def paginate_queryset(self, queryset):
        if self.request.query_params.get('all') == 'true':
            return None
        return super().paginate_queryset(queryset)

    def get_queryset(self):
        # ดึงคลังสินค้าที่ is_active
        queryset = Warehouse.objects.filter(is_active=True)
        # รับค่าคำที่ผู้ใช้พิมพ์ค้นหามาจาก URL (เช่น ?search=Bangkok)
        search_query = self.request.query_params.get('search', None)
        # ถ้ามีค่าคำค้นหา ให้กรอง queryset ตามชื่อหรือรหัสคลังสินค้า
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(code__icontains=search_query) |
                Q(location__icontains=search_query) 
            )
        # ถ้าไม่มีค่าคำค้นหา ให้คืน queryset ทั้งหมด
        return queryset
    #สำหรับบันทึกประวัติการสร้างคลังสินค้า
    def perform_create(self, serializer):
        warehouse = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user, 
            action=f"Created warehouse: {warehouse.name} (Code: {warehouse.code})"
        )
        print(f"สร้างคลังสินค้า: {warehouse.name}")
# รายละเอียดคลังสินค้าและแก้ไขข้อมูลคลังสินค้า(เช่น ชื่อ) และลบคลังสินค้า(ทำให้ is_active = False)
class WarehouseDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]
    #เช็คสิทธการเข้าถึง
    def has_warehouse_permission(self, user):
        profile = getattr(user, 'profile', None)
        return user.is_superuser or (profile and profile.can_manage_warehouses)
    #API สำหรับแก้ไขข้อมูลคลังสินค้า
    def put(self, request, warehouse_id):
        if not self.has_warehouse_permission(request.user):
            return Response({"error": "ไม่ได้รับอนุญาตให้แก้ไขคลังสินค้า"}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            warehouse = Warehouse.objects.get(id=warehouse_id, is_active=True)
            serializer = WarehouseSerializer(warehouse, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                ActivityLog.objects.create(
                    user=request.user,
                    action=f"Updated warehouse: {warehouse.name} (Code: {warehouse.code})"
                )
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Warehouse.DoesNotExist:
            return Response({"error": "ไม่พบคลังสินค้า"}, status=status.HTTP_404_NOT_FOUND)
    #API สำหรับลบคลังสินค้า
    def delete(self, request, warehouse_id):
        if not self.has_warehouse_permission(request.user):
            return Response({"error": "ไม่มีสิทธิ์ลบคลังสินค้า"}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            warehouse = Warehouse.objects.get(id=warehouse_id, is_active=True)
            warehouse.is_active = False
            warehouse.save()
            ActivityLog.objects.create(
                user=request.user,
                action=f"Deleted warehouse: {warehouse.name} (Code: {warehouse.code})"
            )
            return Response({"message": "ลบคลังสินค้าสำเร็จ"}, status=status.HTTP_200_OK)
        except Warehouse.DoesNotExist:
            return Response({"error": "ไม่พบคลังสินค้า"}, status=status.HTTP_404_NOT_FOUND)

#API สำหรับการเข้าสู่ระบบด้วย JWT Token
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
#API สำหรับแสดงประวัติการทำรายการต่างๆในระบบ เช่น การสร้างสินค้า, การแก้ไขสินค้า, การลบสินค้า, การรับสินค้าเข้าคลัง, การเบิกสินค้าออกจากคลัง
class ActivityLogListView(generics.ListAPIView):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]

#API สำหรับการจัดการผู้ใช้งานในระบบ เช่น การแสดงรายการผู้ใช้งานทั้งหมด, การแก้ไขข้อมูลผู้ใช้งาน, การลบผู้ใช้งาน
class UserManagementAPIView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('id')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
#API สำหรับการแสดงรายละเอียดผู้ใช้งานและแก้ไขข้อมูลผู้ใช้งาน
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
        
#API สำหรับการรีเฟรช JWT Token       
class CustomTokenRefreshView(TokenRefreshView):
    serializer_class = CustomTokenObtainPairSerializer

#HardDeleteData
class HardDeleteData(APIView):
    permission_classes = [IsAdminUser]
    def delete(self, request):
        # รับประเภทข้อมูลที่จะลบ
        delete_type = request.data.get('type')
        try:
            if delete_type == 'products':
                # ลบเฉพาะที่อยู่ในถังขยะ (is_active=False)
                deleted_count, _ = Product.objects.filter(is_active=False).delete()
                action_text = f"Hard deleted {deleted_count} inactive products"
            elif delete_type == 'warehouses':
                # ลบเฉพาะที่อยู่ในถังขยะ (is_active=False)
                deleted_count, _ = Warehouse.objects.filter(is_active=False).delete()
                action_text = f"Hard deleted {deleted_count} inactive warehouses"
            else:
                return Response({"error": "Invalid delete type"}, status=status.HTTP_400_BAD_REQUEST)
            # บันทึกประวัติลง Activity Log ถ้ามีการลบเกิดขึ้น
            if deleted_count > 0:
                ActivityLog.objects.create(
                    user=request.user,
                    action=action_text
                )
            return Response({
                "message": f"Successfully deleted {deleted_count} items permanently.", 
                "deleted_count": deleted_count
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
#API สำหรับ หน้ารายละเอียดสินค้าคงเหลือในคลัง
class WarehouseProductsAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = StockBalanceSerializer
    def get_queryset(self):
        warehouse_id = self.kwargs['warehouse_id']
        queryset = StockBalance.objects.filter(
            warehouse_id=warehouse_id,
            product__is_active=True
        ).select_related('product').order_by('-last_updated')
        
        search_query = self.request.query_params.get('search', None)
        if search_query:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(product__name__icontains=search_query) | 
                Q(product__sku__icontains=search_query)
            )
            
        return queryset
