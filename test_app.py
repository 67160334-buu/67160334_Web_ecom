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
    print("[*] Running FORME Jewelry Server Tests (User vs Admin Separation)...")
    client = app.app.test_client()

    # 1. Test Customer Storefront Route
    res = client.get('/')
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    assert b"FORME" in res.data, "Brand name FORME not found in home response"
    print("  [+] Home customer storefront loaded successfully with brand 'FORME'")

    # 2. Test Admin Portal Page Route
    res = client.get('/admin')
    assert res.status_code == 200, f"Expected 200 for /admin, got {res.status_code}"
    assert b"Executive Backoffice" in res.data, "Admin backoffice title not found"
    print("  [+] Dedicated /admin portal loaded successfully")

    # 3. Test Public Get Products
    res = client.get('/api/products')
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert len(data["products"]) >= 12
    print(f"  [+] GET /api/products returned {len(data['products'])} products for shoppers")

    # 4. Test Filter by Category
    res = client.get('/api/products?category=rings')
    data = res.get_json()
    assert all(p["category"] == "rings" for p in data["products"])
    print(f"  [+] Filter category=rings returned {len(data['products'])} rings")

    # 5. Test Single Product Detail
    res = client.get('/api/products/1')
    assert res.status_code == 200
    p1 = res.get_json()["product"]
    assert "Solitaire" in p1["name"]
    print(f"  [+] GET /api/products/1 returned '{p1['name']}'")

    # 6. Test Coupon Validation for Customer Checkout
    res = client.post('/api/coupons/validate', json={"code": "WELCOME10", "cart_total": 5000})
    assert res.status_code == 200
    c_data = res.get_json()
    assert c_data["success"] is True
    assert c_data["discount_amount"] == 500.0
    print(f"  [+] Coupon WELCOME10 validated successfully: discount = {c_data['discount_amount']}")

    # 7. Test Customer Order Creation
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
    print(f"  [+] Customer order created: {order_res['order_number']} | Tracking: {order_res['tracking_number']}")

    # 8. Test Customer Order Tracking by Order Number
    res = client.get(f"/api/orders/{order_res['order_number']}")
    assert res.status_code == 200
    track_data = res.get_json()
    assert track_data["order"]["customer_phone"] == "089-123-4567"
    print(f"  [+] Customer order tracking verified: status is '{track_data['order']['order_status']}'")

    # ========================================================
    # SECURITY & SEPARATION TESTS: USER VS ADMIN ACCESS
    # ========================================================

    # 9. Verify Unauthorized Users CANNOT Access Admin Stats (Expect 401)
    unauth_stats = client.get('/api/admin/stats')
    assert unauth_stats.status_code == 401, f"Expected 401 Unauthorized for stats, got {unauth_stats.status_code}"
    print("  [+] Security Verified: Unauthenticated user blocked from /api/admin/stats (HTTP 401)")

    # 10. Verify Unauthorized Users CANNOT Access Admin Orders (Expect 401)
    unauth_orders = client.get('/api/admin/orders')
    assert unauth_orders.status_code == 401, f"Expected 401 Unauthorized for orders, got {unauth_orders.status_code}"
    print("  [+] Security Verified: Unauthenticated user blocked from /api/admin/orders (HTTP 401)")

    # 11. Verify Unauthorized Users CANNOT Delete Products (Expect 401)
    unauth_del = client.delete('/api/products/1')
    assert unauth_del.status_code == 401, f"Expected 401 Unauthorized for delete, got {unauth_del.status_code}"
    print("  [+] Security Verified: Unauthenticated user blocked from deleting products (HTTP 401)")

    # 12. Test Admin Login with Invalid Credentials (Expect 401)
    bad_login = client.post('/api/admin/login', json={"username": "admin", "password": "wrongpassword"})
    assert bad_login.status_code == 401
    assert bad_login.get_json()["success"] is False
    print("  [+] Security Verified: Invalid login rejected (HTTP 401)")

    # 13. Test Admin Login with Correct Credentials (Expect 200 & Token)
    good_login = client.post('/api/admin/login', json={"username": "admin", "password": "forme2026"})
    assert good_login.status_code == 200
    login_data = good_login.get_json()
    assert login_data["success"] is True
    admin_token = login_data["token"]
    print(f"  [+] Admin authenticated successfully, received token: {admin_token[:10]}...")

    # 14. Test Authenticated Admin Access to Stats via Header
    auth_stats = client.get('/api/admin/stats', headers={"Authorization": f"Bearer {admin_token}"})
    assert auth_stats.status_code == 200
    stats = auth_stats.get_json()
    assert stats["total_orders"] >= 1
    assert stats["total_revenue"] > 0
    print(f"  [+] Authenticated Admin Stats: Revenue = ฿{stats['total_revenue']:,.2f}, Total Orders = {stats['total_orders']}")

    # 15. Test Authenticated Admin Access to Orders via Header
    auth_orders = client.get('/api/admin/orders', headers={"Authorization": f"Bearer {admin_token}"})
    assert auth_orders.status_code == 200
    orders_list = auth_orders.get_json()["orders"]
    assert len(orders_list) >= 1
    print(f"  [+] Authenticated Admin Orders: Loaded {len(orders_list)} customer orders successfully")

    # 16. Test Authenticated Admin Order Status & Tracking Update
    order_id = orders_list[0]["id"]
    update_res = client.put(
        f'/api/admin/orders/{order_id}/status',
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "shipped", "tracking_number": "THP99887766TH"}
    )
    assert update_res.status_code == 200
    assert update_res.get_json()["success"] is True
    print("  [+] Authenticated Admin successfully updated order status to 'shipped' and assigned tracking number")

    print("\n[SUCCESS] ALL 16/16 TESTS PASSED! USER AND ADMIN PERMISSIONS ARE FULLY SEPARATED!")

if __name__ == '__main__':
    run_tests()
