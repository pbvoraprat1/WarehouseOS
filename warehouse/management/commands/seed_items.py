import random
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
# ดึงโมเดลมาให้ครบตามที่คุณใช้งาน
from warehouse.models import Product, Category, ActivityLog

class Command(BaseCommand):
    help = 'Seed the database with sample products based on UI fields'

    def handle(self, *args, **kwargs):
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('ไม่พบผู้ใช้ Admin ในระบบ! โปรดสร้าง superuser ก่อน'))
            return

        # เตรียมข้อมูล Category (เช็คว่ามีในระบบหรือยัง ถ้าไม่มีให้สร้างใหม่)
        category_names = ['Electronics', 'Hardware', 'Furniture', 'Stationery', 'Packaging']
        db_categories = []
        for cat_name in category_names:
            cat, created = Category.objects.get_or_create(name=cat_name)
            db_categories.append(cat)

        product_keywords = ['Laptop', 'Monitor', 'Drill', 'Chair', 'Desk', 'Cable', 'Box', 'Tape', 'Shelf']

        created_count = 0
        self.stdout.write(self.style.WARNING('กำลังเริ่มสร้างข้อมูลสินค้า 150 รายการ...'))

        for i in range(150):
            # สุ่มหมวดหมู่จากที่เตรียมไว้
            category = random.choice(db_categories)
            
            # สุ่มชื่อสินค้า (เช่น "Laptop Pro 2024")
            name = f"{random.choice(product_keywords)} Pro {random.randint(2020, 2026)}"
            
            # สุ่มรหัส SKU ให้เหมือนในหน้า UI (เช่น SKU-10007)
            sku = f"SKU-{random.randint(1, 99999)}"
            
            # สุ่มราคา Base Price
            base_price = round(random.uniform(10.0, 1500.0), 2)
            
            # สุ่มจุดสั่งซื้อเพิ่ม (Reorder Level)
            reorder_level = random.choice([5, 10, 15, 20, 50])

            try:
                # บันทึกลง Database
                new_product = Product.objects.create(
                    name=name,
                    sku=sku,
                    category=category,
                    base_price=base_price, 
                    reorder_level=reorder_level,
                )
                
                # บันทึก Activity Log ว่า Admin เป็นคนทำ
                ActivityLog.objects.create(
                    user=admin_user,
                    action=f"Created product {new_product.name} (SKU: {new_product.sku})",
                    ip_address="127.0.0.1"
                )
                created_count += 1
                
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'เกิดข้อผิดพลาดในรอบที่ {i+1}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'🎉 สำเร็จ! สร้างข้อมูลจำลองไปทั้งหมด {created_count} รายการโดย: {admin_user.username}'))