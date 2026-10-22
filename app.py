import os
import sys
import json
import sqlite3
import random
from functools import wraps
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, session

if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

app = Flask(__name__, static_folder='static', template_folder='templates')
app.secret_key = os.environ.get('SECRET_KEY', 'forme_luxury_master_secret_2026')

# --- ADMIN CREDENTIALS & AUTHENTICATION CONFIG ---
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'forme2026')
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN', 'forme_token_2026_luxury_secure')

def is_authenticated_admin():
    """Checks if the incoming request is authenticated as an admin."""
    if session.get('is_admin'):
        return True
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header.split('Bearer ')[1].strip()
        if token == ADMIN_TOKEN:
            return True
    if request.headers.get('X-Admin-Token') == ADMIN_TOKEN:
        return True
    return False

def admin_required(f):
    """Decorator to protect admin-only endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not is_authenticated_admin():
            return jsonify({
                "success": False,
                "error": "ต้องเข้าสู่ระบบในฐานะผู้ดูแลร้าน (Admin) ก่อนดำเนินการ"
            }), 401
        return f(*args, **kwargs)
    return decorated_function

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Products Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        material TEXT NOT NULL,
        gemstone TEXT,
        carat TEXT,
        price REAL NOT NULL,
        original_price REAL,
        stock INTEGER DEFAULT 10,
        badge TEXT,
        rating REAL DEFAULT 5.0,
        review_count INTEGER DEFAULT 0,
        image_url TEXT NOT NULL,
        gallery TEXT,
        description TEXT,
        details TEXT,
        sizes TEXT,
        can_engrave INTEGER DEFAULT 1,
        is_featured INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Orders Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        province TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        payment_status TEXT DEFAULT 'pending',
        order_status TEXT DEFAULT 'processing',
        tracking_number TEXT,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        shipping_fee REAL DEFAULT 0,
        total REAL NOT NULL,
        coupon_code TEXT,
        gift_wrap INTEGER DEFAULT 0,
        gift_message TEXT,
        items_json TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # Coupons Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS coupons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL,
        discount_value REAL NOT NULL,
        min_spend REAL DEFAULT 0,
        description TEXT,
        is_active INTEGER DEFAULT 1
    )
    ''')

    # Reviews Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products (id)
    )
    ''')

    conn.commit()

    # Seed initial coupons if empty
    cursor.execute("SELECT COUNT(*) FROM coupons")
    if cursor.fetchone()[0] == 0:
        default_coupons = [
            ('WELCOME10', 'percentage', 10, 1000, 'ส่วนลด 10% สำหรับลูกค้าใหม่ เมื่อช้อปครบ 1,000.-'),
            ('SPARKLE500', 'fixed', 500, 3000, 'ส่วนลด 500.- เมื่อช้อปครบ 3,000.-'),
            ('LUXE20', 'percentage', 20, 10000, 'ส่วนลดพิเศษ 20% สำหรับยอดช้อป 10,000.- ขึ้นไป')
        ]
        cursor.executemany('''
            INSERT INTO coupons (code, discount_type, discount_value, min_spend, description)
            VALUES (?, ?, ?, ?, ?)
        ''', default_coupons)
        conn.commit()

    # Seed products if empty
    cursor.execute("SELECT COUNT(*) FROM products")
    if cursor.fetchone()[0] == 0:
        seed_products(cursor)
        conn.commit()

    conn.close()

def seed_products(cursor):
    sample_products = [
        {
                "name": "แหวนเพชรแท้ Solitaire Eternal Brilliance 18K",
                "category": "rings",
                "material": "ทองคำขาว 18K",
                "gemstone": "เพชรแท้ (GIA)",
                "carat": "0.70 กะรัต (Color D / VVS1)",
                "price": 35900,
                "original_price": 42000,
                "stock": 5,
                "badge": "ขายดีอันดับ 1",
                "rating": 4.9,
                "review_count": 48,
                "image_url": "static/images/products/solitaire_ring.jpg",
                "gallery": "[\"static/images/products/solitaire_ring.jpg\"]",
                "description": "แหวนหมั้นและแหวนแต่งงานเพชรเม็ดเดี่ยว ดีไซน์คลาสสิกเหนือกาลเวลา ฝังเพชรแท้น้ำ 100 6 หนามเตยประณีตสูงสุด ความสะอาดระดับ VVS1 พร้อมใบเซอร์ GIA สากล ตัวเรือนทองคำขาว 18K",
                "details": "[\"เพชรแท้ธรรมชาติทรงกลม Brilliant Cut 0.70 กะรัต\", \"เกรดสี: D (น้ำ 100) / ความสะอาด: VVS1 / การเจียระไน: Excellent 3EX\", \"ตัวเรือน: ทองคำขาวแท้ 18K (White Gold 750)\", \"พร้อมใบรับรองสากล GIA และใบรับประกันร้านตลอดชีพ\", \"แถมฟรี: กล่องกำมะหยี่หรูหรา & ผ้าเช็ดจิวเวลรี่พิเศษ\"]",
                "sizes": "[\"48\", \"49\", \"50\", \"52\", \"54\", \"56\", \"58\"]",
                "can_engrave": 1,
                "is_featured": 1
        },
        {
                "name": "สร้อยคอทองคำแท้ จี้เพชรรูปหัวใจ Amour Diamond Pendant",
                "category": "necklaces",
                "material": "ทองคำแท้ 18K",
                "gemstone": "เพชรแท้ (GIA)",
                "carat": "0.35 กะรัต",
                "price": 18500,
                "original_price": 22900,
                "stock": 8,
                "badge": "ยอดนิยม",
                "rating": 5.0,
                "review_count": 34,
                "image_url": "static/images/products/heart_necklace.jpg",
                "gallery": "[\"static/images/products/heart_necklace.jpg\"]",
                "description": "สร้อยคอทองคำแท้ 18K ดีไซน์โซ่เรียบหรู พร้อมจี้หัวใจประดับเพชรแท้รูปหัวใจ Heart Brilliant Cut เปล่งประกายระยิบระยับ สัญลักษณ์แห่งความรักอันบริสุทธิ์ ใส่ได้ทุกโอกาส",
                "details": "[\"ความยาวสร้อย: 42 ซม. ปรับระดับได้ถึง 45 ซม.\", \"เพชรแท้ทรงหัวใจ Heart Cut 0.35 กะรัต น้ำ 99 (E Color)\", \"ตัวเรือน: ทองแท้ 18K Yellow Gold (750)\", \"บริการทำความสะอาดและตรวจสอบหนามเตยฟรีตลอดชีพ\"]",
                "sizes": "[\"42-45 cm (Standard)\"]",
                "can_engrave": 1,
                "is_featured": 1
        },
        {
                "name": "ต่างหูไข่มุกเซาท์ซีแท้ Golden South Sea Pearl Drop Earrings",
                "category": "earrings",
                "material": "ทองคำแท้ 18K",
                "gemstone": "ไข่มุกแท้ (South Sea Pearl)",
                "carat": "ไข่มุกขนาด 11-12 mm",
                "price": 24900,
                "original_price": 29500,
                "stock": 4,
                "badge": "หรูหราพรีเมียม",
                "rating": 4.8,
                "review_count": 21,
                "image_url": "static/images/products/pearl_earrings.jpg",
                "gallery": "[\"static/images/products/pearl_earrings.jpg\"]",
                "description": "ต่างหูไข่มุกทอง South Sea ธรรมชาติ สีทองประกายแชมเปญ ลัสเตอร์เงางามดุจกระจก ประดับเพชรแท้ระยิบระยับบนก้านทองคำ 18K เพิ่มความโดดเด่นสะกดทุกสายตา",
                "details": "[\"ไข่มุก South Sea ธรรมชาติแท้ 100% ขนาด 11.5 มม.\", \"ประดับเพชรแท้ทรงกลมรวม 0.20 กะรัต\", \"ตัวเรือนทองแท้ 18K สี Yellow Gold ผิวเงา\", \"แป้นต่างหูระบบ Double-Lock เพื่อความปลอดภัยสูงสุด\"]",
                "sizes": "[\"One Size\"]",
                "can_engrave": 0,
                "is_featured": 1
        },
        {
                "name": "สร้อยข้อมือเพชรรอบวง Classic Tennis Bracelet 18K",
                "category": "bracelets",
                "material": "ทองคำขาว 18K",
                "gemstone": "เพชรแท้ (GIA)",
                "carat": "เพชรรวม 3.50 กะรัต (52 เม็ด)",
                "price": 68000,
                "original_price": 79000,
                "stock": 3,
                "badge": "Signature",
                "rating": 5.0,
                "review_count": 19,
                "image_url": "static/images/products/tennis_bracelet.jpg",
                "gallery": "[\"static/images/products/tennis_bracelet.jpg\"]",
                "description": "สร้อยข้อมือเทนนิสเพชรแท้แถวเดี่ยว สัญลักษณ์ของความหรูหราขั้นสุด เพชรน้ำงามขนาดเท่ากันทุกเม็ด คัดสรรเกรดพรีเมียม ร้อยเรียงอย่างสมบูรณ์แบบบนตัวเรือนทองคำขาว 18K",
                "details": "[\"เพชรแท้ธรรมชาติ 52 เม็ด รวม 3.50 กะรัต น้ำ 98-99 (F-E Color)\", \"ตัวเรือนทองคำขาวแท้ 18K (750 White Gold)\", \"ความยาว 16.5 ซม. (สั่งปรับขนาดได้)\", \"ตัวล็อก 2 ชั้น Safety Clasp ป้องกันการหลุดหาย\"]",
                "sizes": "[\"15.5 cm\", \"16.5 cm\", \"17.5 cm\"]",
                "can_engrave": 1,
                "is_featured": 1
        },
        {
                "name": "แหวนพลอยไพลินซีลอนแท้ล้อมเพชร Royal Ceylon Sapphire Ring",
                "category": "rings",
                "material": "ทองคำขาว 18K",
                "gemstone": "ไพลินแท้ (Ceylon Sapphire)",
                "carat": "ไพลิน 1.80 กะรัต + เพชร 0.45 กะรัต",
                "price": 45000,
                "original_price": 54000,
                "stock": 2,
                "badge": "อัญมณีล้ำค่า",
                "rating": 4.9,
                "review_count": 16,
                "image_url": "static/images/products/sapphire_ring.jpg",
                "gallery": "[\"static/images/products/sapphire_ring.jpg\"]",
                "description": "แหวนไพลินสีน้ำเงินรอยัลบลู (Royal Blue) จากแหล่งซีลอน ล้อมรอบด้วยเพชรแท้เจียระไนแบบเหลี่ยมเกสรและบ่าข้างเพชร ดีไซน์เจ้าหญิงสไตล์วินเทจราชวงศ์อังกฤษ",
                "details": "[\"ไพลินแท้ธรรมชาติ สี Royal Blue หนัก 1.80 กะรัต\", \"เพชรแท้ล้อมวงและบ่าข้าง รวม 0.45 กะรัต น้ำ 99\", \"ตัวเรือนทองคำขาว 18K น้ำหนักประมาณ 4.8 กรัม\", \"มีใบรับรองอัญมณีแท้จากสถาบันตรวจสอบอัญมณี\"]",
                "sizes": "[\"50\", \"52\", \"54\", \"56\"]",
                "can_engrave": 1,
                "is_featured": 1
        },
        {
                "name": "จี้มรกตโคลัมเบียแท้ล้อมเพชร Colombian Emerald Pendant 18K",
                "category": "necklaces",
                "material": "ทองคำแท้ 18K",
                "gemstone": "มรกตแท้ (Emerald)",
                "carat": "มรกต 1.25 กะรัต + เพชร 0.30 กะรัต",
                "price": 38900,
                "original_price": 45000,
                "stock": 3,
                "badge": "คอลเลกชันใหม่",
                "rating": 5.0,
                "review_count": 12,
                "image_url": "static/images/products/emerald_pendant.jpg",
                "gallery": "[\"static/images/products/emerald_pendant.jpg\"]",
                "description": "จี้มรกตโคลัมเบียสีเขียวเข้มสดใส (Vivid Green) ทรงหยดน้ำ Pear Cut ล้อมรอบด้วยเพชรแท้เปล่งประกาย ตัวเรือนทองคำแท้ 18K เสริมบารมีและความสง่างาม",
                "details": "[\"มรกตธรรมชาติแท้แหล่งโคลัมเบีย 1.25 กะรัต ทรง Pear Cut\", \"เพชรแท้ล้อม 1 ชั้นและห่วงคล้อง น้ำ 99 รวม 0.30 กะรัต\", \"ตัวเรือนทองคำแท้ 18K Yellow Gold พร้อมห่วงคล้องสร้อย\", \"ใบเซอร์รับรองจากสถาบันอัญมณีสากล\"]",
                "sizes": "[\"One Size (พร้อมสายสร้อย 18K 45 cm)\"]",
                "can_engrave": 1,
                "is_featured": 0
        },
        {
                "name": "กำไลข้อมือทองคำแท้ 18K ดีไซน์ใบไม้เกลียว Flora Aurora Bangle",
                "category": "bracelets",
                "material": "ทองคำแท้ 18K",
                "gemstone": "ทองคำแท้ 18K",
                "carat": "ทองแท้ 18K น้ำหนัก 8.5 กรัม",
                "price": 39500,
                "original_price": 46000,
                "stock": 6,
                "badge": "ยอดนิยม",
                "rating": 4.9,
                "review_count": 27,
                "image_url": "static/images/products/bangle_bracelet.jpg",
                "gallery": "[\"static/images/products/bangle_bracelet.jpg\"]",
                "description": "กำไลทองคำแท้ 18K ดีไซน์รูปทรงใบไม้เกลียวพริ้วไหว Flora Aurora สไตล์มินิมอลลักชูรี เส้นสายทองคำขึ้นรูปประณีต สวมใส่ง่าย โอบกระชับข้อมืออย่างสง่างาม",
                "details": "[\"ทองคำแท้ 18K Yellow Gold น้ำหนัก 8.5 กรัม\", \"ดีไซน์รูปทรงใบไม้บายพาสเกลียวโมเดิร์น\", \"เส้นผ่านศูนย์กลางภายใน 5.8 ซม. เหมาะกับข้อมือ 14 - 17 ซม.\", \"สลักชื่อเลเซอร์ข้อความพิเศษด้านในกำไลได้ฟรี\"]",
                "sizes": "[\"S (14-15 cm)\", \"M (15.5-16.5 cm)\", \"L (17-18 cm)\"]",
                "can_engrave": 1,
                "is_featured": 0
        },
        {
                "name": "ต่างหูห่วงเพชรแท้รอบวง Diamond Huggie Hoop Earrings",
                "category": "earrings",
                "material": "ทองคำแท้ 18K",
                "gemstone": "เพชรแท้",
                "carat": "0.55 กะรัต",
                "price": 21900,
                "original_price": 26000,
                "stock": 9,
                "badge": "Must Have",
                "rating": 4.8,
                "review_count": 42,
                "image_url": "static/images/products/hoop_earrings.jpg",
                "gallery": "[\"static/images/products/hoop_earrings.jpg\"]",
                "description": "ต่างหูห่วงเพชรแท้ดีไซน์ Huggie แนบกระชับใบหู ฝังเพชรแท้ทรงกลมและบาแก็ตต์ เปล่งประกายรอบทิศทาง ใส่ติดหูได้ทุกวันโดยไม่เกะกะ",
                "details": "[\"เพชรแท้กลมและบาแก็ตต์ รวม 0.55 กะรัต น้ำ 99 E Color\", \"ตัวเรือนทองแท้ 18K Yellow Gold ระบบตัวล็อกคลิกแน่นหนา\", \"ขนาดเส้นผ่านศูนย์กลาง 14 มิลลิเมตร\", \"ไม่ก่อให้เกิดการระคายเคือง (Nickel Free 100%)\"]",
                "sizes": "[\"One Size (14 mm)\"]",
                "can_engrave": 0,
                "is_featured": 0
        },
        {
                "name": "เซ็ตเครื่องประดับเจ้าสาว Rose Gold Bridal Elegance Set",
                "category": "bridal",
                "material": "ทองคำแท้ 18K",
                "gemstone": "ทองคำแท้ 18K",
                "carat": "ทองแท้ 18K น้ำหนักรวม 28.5 กรัม",
                "price": 89000,
                "original_price": 105000,
                "stock": 2,
                "badge": "ชุดพิเศษงานวิวาห์",
                "rating": 5.0,
                "review_count": 9,
                "image_url": "static/images/products/bridal_set.jpg",
                "gallery": "[\"static/images/products/bridal_set.jpg\"]",
                "description": "เซ็ตเจ้าสาวสุดหรูหรา ประกอบด้วยสร้อยคอทองคำแท้ลวดลายตาข่ายวิจิตรบรรจง และต่างหูระย้าเข้าชุด สมเกียรติในวันวิวาห์และโอกาสสำคัญที่สุด",
                "details": "[\"ประกอบด้วย: สร้อยคอทองคำลวดลายวิจิตร + ต่างหูระย้า 1 คู่\", \"ตัวเรือนทองคำแท้ 18K น้ำหนักรวม 28.5 กรัม\", \"งานขึ้นรูปมือช่างทองหลวงชั้นสูง ละเอียดทุกข้อต่อ\", \"แถมฟรี: กล่องกำมะหยี่เซ็ตใหญ่สั่งทำพิเศษ พร้อมชุดทำความสะอาด\"]",
                "sizes": "[\"One Size (Bridal Set)\"]",
                "can_engrave": 1,
                "is_featured": 1
        },
        {
                "name": "แหวนทับทิมสยามล้อมเพชร Siam Ruby & Diamond Halo Ring",
                "category": "rings",
                "material": "ทองคำแท้ 18K",
                "gemstone": "ทับทิมแท้ (Pigeon's Blood)",
                "carat": "ทับทิม 2.05 กะรัต + เพชร 0.50 กะรัต",
                "price": 52000,
                "original_price": 63000,
                "stock": 3,
                "badge": "อัญมณีมงคล",
                "rating": 4.9,
                "review_count": 14,
                "image_url": "static/images/products/ruby_ring.jpg",
                "gallery": "[\"static/images/products/ruby_ring.jpg\"]",
                "description": "แหวนทับทิมแท้สีเลือดนกพิราบ (Pigeon's Blood) สีแดงสดสะกดสายตา อัญมณีแห่งความรักและอำนาจบารมี ล้อมรอบด้วยเพชรแท้น้ำ 99 สองชั้น",
                "details": "[\"ทับทิมแท้ธรรมชาติรูปไข่ Oval Cut ขนาด 2.05 กะรัต\", \"เพชรแท้ล้อมรอบและก้านแหวน รวม 0.50 กะรัต\", \"ตัวเรือนทองคำแท้ 18K Yellow Gold ประณีต\", \"ใบเซอร์รับรองจากสถาบัน GIT (สถาบันวิจัยและพัฒนาอัญมณีแห่งชาติ)\"]",
                "sizes": "[\"50\", \"52\", \"54\", \"56\", \"58\"]",
                "can_engrave": 1,
                "is_featured": 0
        },
        {
                "name": "แหวนเพชรรอบวง Eternity Diamond Band 18K",
                "category": "rings",
                "material": "ทองคำขาว 18K",
                "gemstone": "เพชรแท้",
                "carat": "0.85 กะรัต",
                "price": 27500,
                "original_price": 32000,
                "stock": 7,
                "badge": "ยอดนิยม",
                "rating": 4.9,
                "review_count": 31,
                "image_url": "static/images/products/eternity_band.jpg",
                "gallery": "[\"static/images/products/eternity_band.jpg\"]",
                "description": "แหวนเพชรรอบวงแบบ Full Eternity สัญลักษณ์แห่งความรักที่ไม่มีวันสิ้นสุด ฝังเพชรแท้เรียงชิดติดกันรอบวง ใส่เดี่ยวหรือซ้อนคู่กับแหวนเม็ดเดี่ยวได้อย่างลงตัว",
                "details": "[\"เพชรแท้ธรรมชาติฝังรอบวง รวม 0.85 กะรัต น้ำ 99 E Color\", \"ตัวเรือนทองคำขาวแท้ 18K White Gold\", \"ออกแบบให้สวมใส่สบาย ไม่ขูดขีดนิ้วข้างเคียง\", \"รับประกันเพชรแท้ตลอดอายุการใช้งาน\"]",
                "sizes": "[\"48\", \"50\", \"52\", \"54\", \"56\"]",
                "can_engrave": 1,
                "is_featured": 1
        },
        {
                "name": "สร้อยคอเงินแท้ 925 ชุบทองคำขาว จี้คริสตัลหยดน้ำ Grace Pendant",
                "category": "necklaces",
                "material": "เงินแท้ 925",
                "gemstone": "คริสตัลสวิสเกรด 5A",
                "carat": "เทียบเท่า 1.0 กะรัต",
                "price": 2890,
                "original_price": 3800,
                "stock": 20,
                "badge": "ราคาเข้าถึงง่าย",
                "rating": 4.7,
                "review_count": 55,
                "image_url": "static/images/products/crystal_pendant.jpg",
                "gallery": "[\"static/images/products/crystal_pendant.jpg\", \"static/images/products/crystal_pendant_model.jpg\"]",
                "description": "สร้อยคอเงินแท้ 925 สเตอร์ลิง ชุบทองคำขาวหนาพิเศษ ป้องกันการหมองคล้ำ จี้ทรงหยดน้ำคริสตัลเกรด 5A เหลี่ยมคมชัดสะท้อนแสงวิบวับ เหมาะเป็นของขวัญพิเศษ",
                "details": "[\"เงินแท้ 925 ชุบ White Gold ไม่ลอกไม่ดำง่าย\", \"คริสตัลสวิสเกรด 5A ทรง Teardrop\", \"ความยาวสายสร้อย 40 + 5 ซม. ข้อต่อเสริม\", \"บรรจุกล่องของขวัญพร้อมริบบิ้นสุดน่ารัก\"]",
                "sizes": "[\"40-45 cm\"]",
                "can_engrave": 0,
                "is_featured": 0
        }
]

    for p in sample_products:
        cursor.execute('''
            INSERT INTO products (
                name, category, material, gemstone, carat, price, original_price,
                stock, badge, rating, review_count, image_url, gallery, description,
                details, sizes, can_engrave, is_featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p["name"], p["category"], p["material"], p["gemstone"], p["carat"],
            p["price"], p["original_price"], p["stock"], p["badge"], p["rating"],
            p["review_count"], p["image_url"], p["gallery"], p["description"],
            p["details"], p["sizes"], p["can_engrave"], p["is_featured"]
        ))

# Initialize database on startup
init_db()

# --- WEB ROUTES ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/admin')
@app.route('/admin.html')
def admin_page():
    return render_template('admin.html')

# --- API ROUTES ---

@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category', '')
    material = request.args.get('material', '')
    gemstone = request.args.get('gemstone', '')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    search = request.args.get('search', '').strip()
    sort = request.args.get('sort', 'default')
    featured = request.args.get('featured', '')

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if category and category != 'all':
        query += " AND category = ?"
        params.append(category)

    if material and material != 'all':
        query += " AND material LIKE ?"
        params.append(f"%{material}%")

    if gemstone and gemstone != 'all':
        query += " AND gemstone LIKE ?"
        params.append(f"%{gemstone}%")

    if min_price is not None:
        query += " AND price >= ?"
        params.append(min_price)

    if max_price is not None:
        query += " AND price <= ?"
        params.append(max_price)

    if search:
        query += " AND (name LIKE ? OR description LIKE ? OR gemstone LIKE ? OR material LIKE ?)"
        wildcard = f"%{search}%"
        params.extend([wildcard, wildcard, wildcard, wildcard])

    if featured == '1':
        query += " AND is_featured = 1"

    if sort == 'price_asc':
        query += " ORDER BY price ASC"
    elif sort == 'price_desc':
        query += " ORDER BY price DESC"
    elif sort == 'rating':
        query += " ORDER BY rating DESC"
    elif sort == 'newest':
        query += " ORDER BY id DESC"
    else:
        query += " ORDER BY is_featured DESC, id ASC"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    products = []
    for r in rows:
        item = dict(r)
        if item.get('gallery'):
            try:
                item['gallery'] = json.loads(item['gallery'])
            except:
                item['gallery'] = [item['image_url']]
        if item.get('details'):
            try:
                item['details'] = json.loads(item['details'])
            except:
                item['details'] = []
        if item.get('sizes'):
            try:
                item['sizes'] = json.loads(item['sizes'])
            except:
                item['sizes'] = []
        products.append(item)

    conn.close()
    return jsonify({"success": True, "count": len(products), "products": products})

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "message": "Product not found"}), 404

    item = dict(row)
    try:
        item['gallery'] = json.loads(item['gallery']) if item.get('gallery') else [item['image_url']]
    except:
        item['gallery'] = [item['image_url']]
    try:
        item['details'] = json.loads(item['details']) if item.get('details') else []
    except:
        item['details'] = []
    try:
        item['sizes'] = json.loads(item['sizes']) if item.get('sizes') else []
    except:
        item['sizes'] = []

    # Get reviews for this product
    cursor.execute("SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC", (product_id,))
    reviews = [dict(rev) for rev in cursor.fetchall()]
    item['reviews'] = reviews

    conn.close()
    return jsonify({"success": True, "product": item})

@app.route('/api/products', methods=['POST'])
@admin_required
def add_product():
    data = request.json
    conn = get_db()
    cursor = conn.cursor()

    gallery_json = json.dumps(data.get('gallery', [data.get('image_url')]))
    details_json = json.dumps(data.get('details', []))
    sizes_json = json.dumps(data.get('sizes', []))

    cursor.execute('''
        INSERT INTO products (
            name, category, material, gemstone, carat, price, original_price,
            stock, badge, rating, review_count, image_url, gallery, description,
            details, sizes, can_engrave, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['name'], data['category'], data['material'], data.get('gemstone', ''),
        data.get('carat', ''), float(data['price']), float(data.get('original_price') or data['price']),
        int(data.get('stock', 10)), data.get('badge', ''), 5.0, 0,
        data['image_url'], gallery_json, data.get('description', ''),
        details_json, sizes_json, int(data.get('can_engrave', 1)), int(data.get('is_featured', 0))
    ))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({"success": True, "product_id": new_id, "message": "Product created successfully"})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "Product deleted successfully"})

@app.route('/api/coupons/validate', methods=['POST'])
def validate_coupon():
    data = request.json or {}
    code = data.get('code', '').strip().upper()
    cart_total = float(data.get('cart_total', 0))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coupons WHERE code = ? AND is_active = 1", (code,))
    coupon = cursor.fetchone()
    conn.close()

    if not coupon:
        return jsonify({"success": False, "message": "รหัสคูปองไม่ถูกต้อง หรือหมดอายุแล้ว"}), 400

    coupon_dict = dict(coupon)
    if cart_total < coupon_dict['min_spend']:
        return jsonify({
            "success": False,
            "message": f"คูปองนี้ใช้ได้เมื่อช้อปครบ ฿{coupon_dict['min_spend']:,.0f} ขึ้นไป"
        }), 400

    # Calculate discount
    if coupon_dict['discount_type'] == 'percentage':
        discount_amount = round(cart_total * (coupon_dict['discount_value'] / 100), 2)
    else:
        discount_amount = min(coupon_dict['discount_value'], cart_total)

    return jsonify({
        "success": True,
        "code": coupon_dict['code'],
        "discount_type": coupon_dict['discount_type'],
        "discount_value": coupon_dict['discount_value'],
        "discount_amount": discount_amount,
        "description": coupon_dict['description'],
        "message": f"ใช้คูปองสำเร็จ! ประหยัด ฿{discount_amount:,.0f}"
    })

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.json
    if not data or not data.get('items'):
        return jsonify({"success": False, "message": "ไม่มีสินค้าในคำสั่งซื้อ"}), 400

    order_num = f"FRM-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
    tracking_num = f"THP{random.randint(100000000, 999999999)}TH"

    subtotal = float(data.get('subtotal', 0))
    discount = float(data.get('discount', 0))
    shipping_fee = 0 if subtotal >= 2000 else 100
    total = max(0, subtotal - discount + shipping_fee)

    items_json = json.dumps(data.get('items', []))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO orders (
            order_number, customer_name, customer_phone, customer_email,
            shipping_address, province, postal_code, payment_method,
            payment_status, order_status, tracking_number,
            subtotal, discount, shipping_fee, total,
            coupon_code, gift_wrap, gift_message, items_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        order_num,
        data.get('customer_name'),
        data.get('customer_phone'),
        data.get('customer_email'),
        data.get('shipping_address'),
        data.get('province'),
        data.get('postal_code'),
        data.get('payment_method', 'promptpay'),
        'paid' if data.get('payment_method') in ['promptpay', 'card'] else 'pending',
        'processing',
        tracking_num,
        subtotal,
        discount,
        shipping_fee,
        total,
        data.get('coupon_code', ''),
        1 if data.get('gift_wrap') else 0,
        data.get('gift_message', ''),
        items_json
    ))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "order_number": order_num,
        "tracking_number": tracking_num,
        "total": total,
        "message": "สร้างคำสั่งซื้อสำเร็จ ขอบพระคุณที่ไว้วางใจเลือก FORME Jewelry"
    })

@app.route('/api/orders/<order_ref>', methods=['GET'])
def get_order_by_ref(order_ref):
    conn = get_db()
    cursor = conn.cursor()
    # Search by order_number or customer_phone
    cursor.execute('''
        SELECT * FROM orders 
        WHERE order_number = ? OR customer_phone = ? OR tracking_number = ?
        ORDER BY id DESC LIMIT 1
    ''', (order_ref, order_ref, order_ref))
    order = cursor.fetchone()
    conn.close()

    if not order:
        return jsonify({"success": False, "message": "ไม่พบข้อมูลคำสั่งซื้อ กรุณาตรวจสอบรหัสหรือเบอร์โทรอีกครั้ง"}), 404

    order_data = dict(order)
    try:
        order_data['items'] = json.loads(order_data['items_json'])
    except:
        order_data['items'] = []

    return jsonify({"success": True, "order": order_data})

# --- ADMIN AUTHENTICATION API ---

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.json or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()

    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        session['is_admin'] = True
        return jsonify({
            "success": True,
            "message": "เข้าสู่ระบบผู้ดูแลสำเร็จ",
            "token": ADMIN_TOKEN,
            "username": ADMIN_USERNAME
        })
    return jsonify({
        "success": False,
        "error": "ชื่อผู้ใช้หรือรหัสผ่านผู้ดูแลไม่ถูกต้อง"
    }), 401

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop('is_admin', None)
    return jsonify({"success": True, "message": "ออกจากระบบผู้ดูแลเรียบร้อย"})

@app.route('/api/admin/check-auth', methods=['GET'])
def admin_check_auth():
    return jsonify({
        "success": True,
        "authenticated": is_authenticated_admin(),
        "username": ADMIN_USERNAME if is_authenticated_admin() else None
    })

# --- PROTECTED ADMIN APIS ---

@app.route('/api/admin/orders', methods=['GET'])
@admin_required
def get_all_orders():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM orders ORDER BY id DESC")
    orders = []
    for r in cursor.fetchall():
        item = dict(r)
        try:
            item['items'] = json.loads(item['items_json'])
        except:
            item['items'] = []
        orders.append(item)
    conn.close()
    return jsonify({"success": True, "orders": orders})

@app.route('/api/admin/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    data = request.json or {}
    new_status = data.get('status')
    new_payment = data.get('payment_status')
    new_tracking = data.get('tracking_number')
    
    conn = get_db()
    cursor = conn.cursor()
    if new_status:
        cursor.execute("UPDATE orders SET order_status = ? WHERE id = ?", (new_status, order_id))
    if new_payment:
        cursor.execute("UPDATE orders SET payment_status = ? WHERE id = ?", (new_payment, order_id))
    if new_tracking:
        cursor.execute("UPDATE orders SET tracking_number = ? WHERE id = ?", (new_tracking, order_id))
    conn.commit()
    conn.close()
    return jsonify({"success": True, "message": "อัปเดตสถานะคำสั่งซื้อเรียบร้อย"})

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total_orders, COALESCE(SUM(total), 0) as total_revenue FROM orders")
    order_stats = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) as total_products FROM products")
    product_stats = cursor.fetchone()

    cursor.execute("SELECT COUNT(*) FROM products WHERE stock <= 3")
    low_stock = cursor.fetchone()[0]

    cursor.execute("SELECT order_status, COUNT(*) as count FROM orders GROUP BY order_status")
    status_counts = {r['order_status']: r['count'] for r in cursor.fetchall()}

    conn.close()

    return jsonify({
        "success": True,
        "total_revenue": order_stats['total_revenue'],
        "total_orders": order_stats['total_orders'],
        "total_products": product_stats['total_products'],
        "low_stock_products": low_stock,
        "order_status_counts": status_counts
    })

@app.route('/api/admin/products/<int:prod_id>/stock', methods=['PUT'])
@admin_required
def update_product_stock(prod_id):
    data = request.json or {}
    delta = data.get('delta')
    new_stock = data.get('stock')

    conn = get_db()
    cursor = conn.cursor()
    if new_stock is not None:
        cursor.execute("UPDATE products SET stock = MAX(0, ?) WHERE id = ?", (int(new_stock), prod_id))
    elif delta is not None:
        cursor.execute("UPDATE products SET stock = MAX(0, stock + ?) WHERE id = ?", (int(delta), prod_id))
    conn.commit()
    cursor.execute("SELECT stock FROM products WHERE id = ?", (prod_id,))
    row = cursor.fetchone()
    conn.close()
    return jsonify({"success": True, "stock": row['stock'] if row else 0})

@app.route('/api/admin/coupons', methods=['GET'])
@admin_required
def list_admin_coupons():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM coupons ORDER BY id DESC")
    coupons = [dict(c) for c in cursor.fetchall()]
    conn.close()
    return jsonify({"success": True, "coupons": coupons})

@app.route('/api/admin/coupons', methods=['POST'])
@admin_required
def create_admin_coupon():
    data = request.json or {}
    code = (data.get('code') or '').strip().upper()
    discount_type = data.get('discount_type', 'percentage')
    discount_value = float(data.get('discount_value', 10))
    min_spend = float(data.get('min_spend', 0))
    description = data.get('description', '')

    if not code:
        return jsonify({"success": False, "error": "กรุณาระบุรหัสคูปอง"}), 400

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO coupons (code, discount_type, discount_value, min_spend, description)
            VALUES (?, ?, ?, ?, ?)
        ''', (code, discount_type, discount_value, min_spend, description))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": f"สร้างคูปอง {code} เรียบร้อยแล้ว"})
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"success": False, "error": f"รหัสคูปอง {code} มีอยู่ในระบบแล้ว"}), 400


@app.route('/api/reviews', methods=['POST'])
def add_review():
    data = request.json
    product_id = data.get('product_id')
    name = data.get('customer_name', 'ลูกค้าคนสำคัญ')
    rating = int(data.get('rating', 5))
    comment = data.get('comment', '')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO reviews (product_id, customer_name, rating, comment)
        VALUES (?, ?, ?, ?)
    ''', (product_id, name, rating, comment))
    
    # Update product rating and review count
    cursor.execute("SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ?", (product_id,))
    res = cursor.fetchone()
    avg_rating = round(res['avg_rating'], 1) if res['avg_rating'] else 5.0
    count = res['count']

    cursor.execute("UPDATE products SET rating = ?, review_count = ? WHERE id = ?", (avg_rating, count, product_id))
    conn.commit()
    conn.close()

    return jsonify({"success": True, "message": "ขอบพระคุณสำหรับรีวิวของคุณ"})

if __name__ == '__main__':
    print("💎 FORME Jewelry Server starting on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
