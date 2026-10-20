import sys
import os

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import app
import json

def run_tests():
    print("[*] Running FORME Jewelry Server Tests...")
    client = app.app.test_client()

    # 1. Test Home Route
    res = client.get('/')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert b"FORME" in res.data, "Brand name FORME not found in home response"
    print("  [+] Home page loaded successfully with brand 'FORME'")

    # 2. Test Get Products
    res = client.get('/api/products')
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["products"]) >= 12
    print(f"  [+] GET /api/products returned {len(data['products'])} products")

    # 3. Test Filter by Category
    res = client.get('/api/products?category=rings')
    data = res.get_json()
    assert all(p["category"] == "rings" for p in data["products"])
    print(f"  [+] Filter category=rings returned {len(data['products'])} rings")

    # 4. Test Single Product Detail
    res = client.get('/api/products/1')
    assert res.status_code == 200
    p1 = res.get_json()["product"]
    assert "Solitaire" in p1["name"]
    print(f"  [+] GET /api/products/1 returned '{p1['name']}'")

    # 5. Test Coupon Validation
    res = client.post('/api/coupons/validate', json={"code": "WELCOME10", "cart_total": 5000})
    assert res.status_code == 200
    c_data = res.get_json()
    assert c_data["success"] is True
    assert c_data["discount_amount"] == 500.0
    print(f"  [+] Coupon WELCOME10 validated successfully: discount = {c_data['discount_amount']}")

    # 6. Test Create Order
    order_payload = {
        "customer_name": "Test Customer",
        "customer_phone": "089-123-4567",
        "customer_email": "test@forme-jewelry.com",
        "shipping_address": "123/45 Silom Rd",
        "province": "Bangkok",
        "postal_code": "10500",
        "payment_method": "promptpay",
        "subtotal": 35900,
        "discount": 3590,
        "coupon_code": "WELCOME10",
        "gift_wrap": True,
        "gift_message": "Happy Anniversary",
        "items": [
            {
                "id": 1,
                "name": p1["name"],
                "price": p1["price"],
                "size": "52",
                "material": "18K White Gold",
                "engraving": "LOVE FOREVER",
                "qty": 1,
                "image_url": p1["image_url"]
            }
        ]
    }
    res = client.post('/api/orders', json=order_payload)
    assert res.status_code == 200
    order_res = res.get_json()
    assert order_res["success"] is True
    assert "order_number" in order_res
    assert order_res["order_number"].startswith("FRM-")
    print(f"  [+] Order created: {order_res['order_number']} | Tracking: {order_res['tracking_number']}")

    # 7. Test Track Order by Order Number
    res = client.get(f"/api/orders/{order_res['order_number']}")
    assert res.status_code == 200
    track_data = res.get_json()
    assert track_data["order"]["customer_phone"] == "089-123-4567"
    print(f"  [+] Order tracking verified: status is '{track_data['order']['order_status']}'")

    # 8. Test Admin Stats
    res = client.get('/api/admin/stats')
    assert res.status_code == 200
    stats = res.get_json()
    assert stats["total_orders"] >= 1
    assert stats["total_revenue"] > 0
    print(f"  [+] Admin stats verified: Total revenue = {stats['total_revenue']}, Total orders = {stats['total_orders']}")

    print("\n[SUCCESS] ALL 8/8 TESTS PASSED SUCCESSFULLY FOR FORME JEWELRY!")

if __name__ == '__main__':
    run_tests()
