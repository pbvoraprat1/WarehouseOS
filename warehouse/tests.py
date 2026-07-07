from django.test import TestCase
from .models import Product,Category

class ProductModelTest(TestCase):

    def test_create_product(self):
        mock_category = Category.objects.create(
            name = "Test Category 1"
        )
        product = Product.objects.create(
            name = "Test Product 1",
            sku = "SKU-000",
            base_price = 1500.00,
            category = mock_category
        )
        self.assertEqual(Product.objects.count(), 1)
