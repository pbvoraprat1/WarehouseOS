import random
import string
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from warehouse.models import Warehouse, Product, Transaction, Category

class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **kwargs):
        admin_user = User.objects.filter(is_superuser=True).first()
        if not admin_user:
            self.stdout.write(self.style.ERROR('ไม่พบผู้ใช้ Admin ในระบบ! โปรดสร้าง superuser ก่อน'))
            return

        categories = ['Electronics', 'Hardware', 'Furniture', 'Stationery', 'Packaging']
        products = ['Laptop', 'Monitor', 'Drill', 'Chair', 'Desk', 'Cable', 'Box', 'Tape', 'Shelf']

        created_count = 0

        self.stdout.write(self.style.WARNING('กำลังเริ่มสร้างข้อมูล 150 รายการ...'))

        for i in range(150):
            # สุ่มข้อมูล
            name = f"{random.choice(adjectives)} {random.choice(products)} {random.choice(categories)}"
            # สุ่มรหัส SKU (เช่น PROD-A1B2C)
            sku = "PROD-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
            # สุ่มจำนวนและราคา
            qty = random.randint(10, 500)
            price = round(random.uniform(10.0, 5000.0), 2)

            # บันทึกลง Database (*** ตรงนี้แก้ Field ให้ตรงกับ models.py ของคุณ ***)
            new_item = Item.objects.create(
                name=name,
                sku=sku,
                quantity=qty,
                price=price,
                description=f"ข้อมูลจำลองสร้างโดย Script ลำดับที่ {i+1}",
                created_by=admin_user
            )
            ActionLog.objects.create(
                user=admin_user,
                action=f"Created item {new_item.name}",
                ip_address="127.0.0.1"
            )
            created_count += 1

        self.stdout.write(self.style.SUCCESS(f'🎉 สำเร็จ! สร้างข้อมูลจำลองไปทั้งหมด {created_count} รายการโดย: {admin_user.username}'))
        

    
