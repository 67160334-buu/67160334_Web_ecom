/**
 * FORME JEWELRY - MINIMAL EDITORIAL JAVASCRIPT
 */

// Application State
const state = {
    products: [],
    filteredProducts: [],
    cart: JSON.parse(localStorage.getItem('forme_cart') || localStorage.getItem('aurora_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('forme_wishlist') || localStorage.getItem('aurora_wishlist') || '[]'),
    activeCategory: 'all',
    filters: {
        material: 'all',
        gemstone: 'all',
        minPrice: null,
        maxPrice: null,
        search: '',
        sort: 'default'
    },
    appliedCoupon: JSON.parse(localStorage.getItem('forme_coupon') || localStorage.getItem('aurora_coupon') || 'null'),
    currentProduct: null,
    selectedSize: '',
    selectedMaterial: '',
    engravingText: '',
    activeGalleryIndex: 0
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    initDefaultOrders();
    updateCartCount();
    updateWishlistCount();
    await fetchProducts();
    setupEventListeners();
}

// Default Catalog (Fallback for static hosting / GitHub Pages)
const DEFAULT_PRODUCTS = [
    {
        "id": 1,
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
        "gallery": [
            "static/images/products/solitaire_ring.jpg"
        ],
        "description": "แหวนหมั้นและแหวนแต่งงานเพชรเม็ดเดี่ยว ดีไซน์คลาสสิกเหนือกาลเวลา ฝังเพชรแท้น้ำ 100 6 หนามเตยประณีตสูงสุด ความสะอาดระดับ VVS1 พร้อมใบเซอร์ GIA สากล ตัวเรือนทองคำขาว 18K",
        "details": [
            "เพชรแท้ธรรมชาติทรงกลม Brilliant Cut 0.70 กะรัต",
            "เกรดสี: D (น้ำ 100) / ความสะอาด: VVS1 / การเจียระไน: Excellent 3EX",
            "ตัวเรือน: ทองคำขาวแท้ 18K (White Gold 750)",
            "พร้อมใบรับรองสากล GIA และใบรับประกันร้านตลอดชีพ",
            "แถมฟรี: กล่องกำมะหยี่หรูหรา & ผ้าเช็ดจิวเวลรี่พิเศษ"
        ],
        "sizes": [
            "48",
            "49",
            "50",
            "52",
            "54",
            "56",
            "58"
        ],
        "can_engrave": 1,
        "is_featured": 1
    },
    {
        "id": 2,
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
        "gallery": [
            "static/images/products/heart_necklace.jpg"
        ],
        "description": "สร้อยคอทองคำแท้ 18K ดีไซน์โซ่เรียบหรู พร้อมจี้หัวใจประดับเพชรแท้รูปหัวใจ Heart Brilliant Cut เปล่งประกายระยิบระยับ สัญลักษณ์แห่งความรักอันบริสุทธิ์ ใส่ได้ทุกโอกาส",
        "details": [
            "ความยาวสร้อย: 42 ซม. ปรับระดับได้ถึง 45 ซม.",
            "เพชรแท้ทรงหัวใจ Heart Cut 0.35 กะรัต น้ำ 99 (E Color)",
            "ตัวเรือน: ทองแท้ 18K Yellow Gold (750)",
            "บริการทำความสะอาดและตรวจสอบหนามเตยฟรีตลอดชีพ"
        ],
        "sizes": [
            "42-45 cm (Standard)"
        ],
        "can_engrave": 1,
        "is_featured": 1
    },
    {
        "id": 3,
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
        "gallery": [
            "static/images/products/pearl_earrings.jpg"
        ],
        "description": "ต่างหูไข่มุกทอง South Sea ธรรมชาติ สีทองประกายแชมเปญ ลัสเตอร์เงางามดุจกระจก ประดับเพชรแท้ระยิบระยับบนก้านทองคำ 18K เพิ่มความโดดเด่นสะกดทุกสายตา",
        "details": [
            "ไข่มุก South Sea ธรรมชาติแท้ 100% ขนาด 11.5 มม.",
            "ประดับเพชรแท้ทรงกลมรวม 0.20 กะรัต",
            "ตัวเรือนทองแท้ 18K สี Yellow Gold ผิวเงา",
            "แป้นต่างหูระบบ Double-Lock เพื่อความปลอดภัยสูงสุด"
        ],
        "sizes": [
            "One Size"
        ],
        "can_engrave": 0,
        "is_featured": 1
    },
    {
        "id": 4,
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
        "gallery": [
            "static/images/products/tennis_bracelet.jpg"
        ],
        "description": "สร้อยข้อมือเทนนิสเพชรแท้แถวเดี่ยว สัญลักษณ์ของความหรูหราขั้นสุด เพชรน้ำงามขนาดเท่ากันทุกเม็ด คัดสรรเกรดพรีเมียม ร้อยเรียงอย่างสมบูรณ์แบบบนตัวเรือนทองคำขาว 18K",
        "details": [
            "เพชรแท้ธรรมชาติ 52 เม็ด รวม 3.50 กะรัต น้ำ 98-99 (F-E Color)",
            "ตัวเรือนทองคำขาวแท้ 18K (750 White Gold)",
            "ความยาว 16.5 ซม. (สั่งปรับขนาดได้)",
            "ตัวล็อก 2 ชั้น Safety Clasp ป้องกันการหลุดหาย"
        ],
        "sizes": [
            "15.5 cm",
            "16.5 cm",
            "17.5 cm"
        ],
        "can_engrave": 1,
        "is_featured": 1
    },
    {
        "id": 5,
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
        "gallery": [
            "static/images/products/sapphire_ring.jpg"
        ],
        "description": "แหวนไพลินสีน้ำเงินรอยัลบลู (Royal Blue) จากแหล่งซีลอน ล้อมรอบด้วยเพชรแท้เจียระไนแบบเหลี่ยมเกสรและบ่าข้างเพชร ดีไซน์เจ้าหญิงสไตล์วินเทจราชวงศ์อังกฤษ",
        "details": [
            "ไพลินแท้ธรรมชาติ สี Royal Blue หนัก 1.80 กะรัต",
            "เพชรแท้ล้อมวงและบ่าข้าง รวม 0.45 กะรัต น้ำ 99",
            "ตัวเรือนทองคำขาว 18K น้ำหนักประมาณ 4.8 กรัม",
            "มีใบรับรองอัญมณีแท้จากสถาบันตรวจสอบอัญมณี"
        ],
        "sizes": [
            "50",
            "52",
            "54",
            "56"
        ],
        "can_engrave": 1,
        "is_featured": 1
    },
    {
        "id": 6,
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
        "gallery": [
            "static/images/products/emerald_pendant.jpg"
        ],
        "description": "จี้มรกตโคลัมเบียสีเขียวเข้มสดใส (Vivid Green) ทรงหยดน้ำ Pear Cut ล้อมรอบด้วยเพชรแท้เปล่งประกาย ตัวเรือนทองคำแท้ 18K เสริมบารมีและความสง่างาม",
        "details": [
            "มรกตธรรมชาติแท้แหล่งโคลัมเบีย 1.25 กะรัต ทรง Pear Cut",
            "เพชรแท้ล้อม 1 ชั้นและห่วงคล้อง น้ำ 99 รวม 0.30 กะรัต",
            "ตัวเรือนทองคำแท้ 18K Yellow Gold พร้อมห่วงคล้องสร้อย",
            "ใบเซอร์รับรองจากสถาบันอัญมณีสากล"
        ],
        "sizes": [
            "One Size (พร้อมสายสร้อย 18K 45 cm)"
        ],
        "can_engrave": 1,
        "is_featured": 0
    },
    {
        "id": 7,
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
        "gallery": [
            "static/images/products/bangle_bracelet.jpg"
        ],
        "description": "กำไลทองคำแท้ 18K ดีไซน์รูปทรงใบไม้เกลียวพริ้วไหว Flora Aurora สไตล์มินิมอลลักชูรี เส้นสายทองคำขึ้นรูปประณีต สวมใส่ง่าย โอบกระชับข้อมืออย่างสง่างาม",
        "details": [
            "ทองคำแท้ 18K Yellow Gold น้ำหนัก 8.5 กรัม",
            "ดีไซน์รูปทรงใบไม้บายพาสเกลียวโมเดิร์น",
            "เส้นผ่านศูนย์กลางภายใน 5.8 ซม. เหมาะกับข้อมือ 14 - 17 ซม.",
            "สลักชื่อเลเซอร์ข้อความพิเศษด้านในกำไลได้ฟรี"
        ],
        "sizes": [
            "S (14-15 cm)",
            "M (15.5-16.5 cm)",
            "L (17-18 cm)"
        ],
        "can_engrave": 1,
        "is_featured": 0
    },
    {
        "id": 8,
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
        "gallery": [
            "static/images/products/hoop_earrings.jpg"
        ],
        "description": "ต่างหูห่วงเพชรแท้ดีไซน์ Huggie แนบกระชับใบหู ฝังเพชรแท้ทรงกลมและบาแก็ตต์ เปล่งประกายรอบทิศทาง ใส่ติดหูได้ทุกวันโดยไม่เกะกะ",
        "details": [
            "เพชรแท้กลมและบาแก็ตต์ รวม 0.55 กะรัต น้ำ 99 E Color",
            "ตัวเรือนทองแท้ 18K Yellow Gold ระบบตัวล็อกคลิกแน่นหนา",
            "ขนาดเส้นผ่านศูนย์กลาง 14 มิลลิเมตร",
            "ไม่ก่อให้เกิดการระคายเคือง (Nickel Free 100%)"
        ],
        "sizes": [
            "One Size (14 mm)"
        ],
        "can_engrave": 0,
        "is_featured": 0
    },
    {
        "id": 9,
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
        "gallery": [
            "static/images/products/bridal_set.jpg"
        ],
        "description": "เซ็ตเจ้าสาวสุดหรูหรา ประกอบด้วยสร้อยคอทองคำแท้ลวดลายตาข่ายวิจิตรบรรจง และต่างหูระย้าเข้าชุด สมเกียรติในวันวิวาห์และโอกาสสำคัญที่สุด",
        "details": [
            "ประกอบด้วย: สร้อยคอทองคำลวดลายวิจิตร + ต่างหูระย้า 1 คู่",
            "ตัวเรือนทองคำแท้ 18K น้ำหนักรวม 28.5 กรัม",
            "งานขึ้นรูปมือช่างทองหลวงชั้นสูง ละเอียดทุกข้อต่อ",
            "แถมฟรี: กล่องกำมะหยี่เซ็ตใหญ่สั่งทำพิเศษ พร้อมชุดทำความสะอาด"
        ],
        "sizes": [
            "One Size (Bridal Set)"
        ],
        "can_engrave": 1,
        "is_featured": 1
    },
    {
        "id": 10,
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
        "gallery": [
            "static/images/products/ruby_ring.jpg"
        ],
        "description": "แหวนทับทิมแท้สีเลือดนกพิราบ (Pigeon's Blood) สีแดงสดสะกดสายตา อัญมณีแห่งความรักและอำนาจบารมี ล้อมรอบด้วยเพชรแท้น้ำ 99 สองชั้น",
        "details": [
            "ทับทิมแท้ธรรมชาติรูปไข่ Oval Cut ขนาด 2.05 กะรัต",
            "เพชรแท้ล้อมรอบและก้านแหวน รวม 0.50 กะรัต",
            "ตัวเรือนทองคำแท้ 18K Yellow Gold ประณีต",
            "ใบเซอร์รับรองจากสถาบัน GIT (สถาบันวิจัยและพัฒนาอัญมณีแห่งชาติ)"
        ],
        "sizes": [
            "50",
            "52",
            "54",
            "56",
            "58"
        ],
        "can_engrave": 1,
        "is_featured": 0
    },
    {
        "id": 11,
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
        "gallery": [
            "static/images/products/eternity_band.jpg"
        ],
        "description": "แหวนเพชรรอบวงแบบ Full Eternity สัญลักษณ์แห่งความรักที่ไม่มีวันสิ้นสุด ฝังเพชรแท้เรียงชิดติดกันรอบวง ใส่เดี่ยวหรือซ้อนคู่กับแหวนเม็ดเดี่ยวได้อย่างลงตัว",
        "details": [
            "เพชรแท้ธรรมชาติฝังรอบวง รวม 0.85 กะรัต น้ำ 99 E Color",
            "ตัวเรือนทองคำขาวแท้ 18K White Gold",
            "ออกแบบให้สวมใส่สบาย ไม่ขูดขีดนิ้วข้างเคียง",
            "รับประกันเพชรแท้ตลอดอายุการใช้งาน"
        ],
        "sizes": [
            "48",
            "50",
            "52",
            "54",
            "56"
        ],
        "can_engrave": 1,
        "is_featured": 1
    },
    {
        "id": 12,
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
        "gallery": [
            "static/images/products/crystal_pendant.jpg",
            "static/images/products/crystal_pendant_model.jpg"
        ],
        "description": "สร้อยคอเงินแท้ 925 สเตอร์ลิง ชุบทองคำขาวหนาพิเศษ ป้องกันการหมองคล้ำ จี้ทรงหยดน้ำคริสตัลเกรด 5A เหลี่ยมคมชัดสะท้อนแสงวิบวับ เหมาะเป็นของขวัญพิเศษ",
        "details": [
            "เงินแท้ 925 ชุบ White Gold ไม่ลอกไม่ดำง่าย",
            "คริสตัลสวิสเกรด 5A ทรง Teardrop",
            "ความยาวสายสร้อย 40 + 5 ซม. ข้อต่อเสริม",
            "บรรจุกล่องของขวัญพร้อมริบบิ้นสุดน่ารัก"
        ],
        "sizes": [
            "40-45 cm"
        ],
        "can_engrave": 0,
        "is_featured": 0
    }
];

// Fetch Products from API with Static Fallback
async function fetchProducts() {
    try {
        const params = new URLSearchParams();
        if (state.activeCategory && state.activeCategory !== 'all') params.append('category', state.activeCategory);
        if (state.filters.material && state.filters.material !== 'all') params.append('material', state.filters.material);
        if (state.filters.gemstone && state.filters.gemstone !== 'all') params.append('gemstone', state.filters.gemstone);
        if (state.filters.search) params.append('search', state.filters.search);
        if (state.filters.sort) params.append('sort', state.filters.sort);
        if (state.filters.minPrice) params.append('min_price', state.filters.minPrice);
        if (state.filters.maxPrice) params.append('max_price', state.filters.maxPrice);

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error('API unavailable, use fallback');
        const data = await res.json();
        if (data.success) {
            state.products = data.products;
            renderProducts(state.products);
            return;
        }
    } catch (err) {
        // Client-side fallback for GitHub Pages
        let prods = [...DEFAULT_PRODUCTS];
        if (state.activeCategory && state.activeCategory !== 'all') {
            prods = prods.filter(p => p.category === state.activeCategory);
        }
        if (state.filters.material && state.filters.material !== 'all') {
            prods = prods.filter(p => p.material.includes(state.filters.material));
        }
        if (state.filters.gemstone && state.filters.gemstone !== 'all') {
            prods = prods.filter(p => (p.gemstone || '').includes(state.filters.gemstone));
        }
        if (state.filters.search) {
            const s = state.filters.search.toLowerCase();
            prods = prods.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
        }
        if (state.filters.minPrice) prods = prods.filter(p => p.price >= state.filters.minPrice);
        if (state.filters.maxPrice) prods = prods.filter(p => p.price <= state.filters.maxPrice);

        if (state.filters.sort === 'price_asc') prods.sort((a,b) => a.price - b.price);
        else if (state.filters.sort === 'price_desc') prods.sort((a,b) => b.price - a.price);
        else if (state.filters.sort === 'rating') prods.sort((a,b) => b.rating - a.rating);
        else if (state.filters.sort === 'newest') prods.sort((a,b) => b.id - a.id);

        state.products = prods;
        renderProducts(state.products);
    }
}

// Render Products Grid (Minimalist Aesthetic)
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    const countEl = document.getElementById('productsCount');
    if (countEl) countEl.innerText = `${products.length} ชิ้นงาน`;

    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-20 text-center">
                <p class="text-sm text-neutral-400 mb-2 tracking-widest uppercase">No Results Found</p>
                <h3 class="text-xl font-serif text-neutral-800 mb-2">ไม่พบเครื่องประดับที่ตรงกับเงื่อนไข</h3>
                <p class="text-neutral-500 mb-6 text-xs">ลองปรับเงื่อนไขการค้นหา หรือรีเซ็ตตัวกรอง</p>
                <button onclick="resetFilters()" class="px-5 py-2 rounded-full border border-neutral-300 text-neutral-800 hover:border-black hover:bg-black hover:text-white transition text-xs tracking-wider">
                    รีเซ็ตตัวกรองทั้งหมด
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = products.map(p => {
        const isWishlisted = state.wishlist.includes(p.id);
        const discountPct = p.original_price && p.original_price > p.price 
            ? Math.round(((p.original_price - p.price) / p.original_price) * 100) 
            : 0;

        return `
            <div class="product-card group relative rounded-xl overflow-hidden flex flex-col justify-between">
                <!-- Badges & Wishlist -->
                <div class="absolute top-3.5 left-3.5 right-3.5 z-10 flex justify-between items-start pointer-events-none">
                    <div class="flex flex-col gap-1">
                        ${p.badge ? `<span class="px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase bg-white/95 text-neutral-900 border border-neutral-200/80 rounded shadow-sm pointer-events-auto">${p.badge}</span>` : ''}
                        ${discountPct > 0 ? `<span class="px-2 py-0.5 text-[10px] font-medium bg-neutral-900 text-white rounded pointer-events-auto">-${discountPct}%</span>` : ''}
                    </div>
                    <button onclick="toggleWishlist(${p.id}, event)" class="pointer-events-auto w-8 h-8 rounded-full bg-white/90 border border-neutral-200/80 flex items-center justify-center text-neutral-400 hover:text-red-500 hover:border-red-300 transition shadow-sm">
                        <i class="${isWishlisted ? 'fa-solid fa-heart text-red-500' : 'fa-regular fa-heart'} text-xs"></i>
                    </button>
                </div>

                <!-- Product Image -->
                <div class="relative w-full pt-[100%] overflow-hidden bg-neutral-100 cursor-pointer" onclick="openProductModal(${p.id})">
                    <img src="${p.image_url}" alt="${p.name}" class="product-img absolute inset-0 w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                        <span class="text-xs px-4 py-1.5 rounded-full bg-white text-neutral-900 font-medium shadow-md tracking-wider transform translate-y-1 group-hover:translate-y-0 transition">
                            ดูรายละเอียด
                        </span>
                    </div>
                </div>

                <!-- Product Info -->
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <div class="flex items-center justify-between text-[11px] text-neutral-400 uppercase tracking-widest mb-1.5 font-light">
                            <span>${p.category === 'rings' ? 'แหวน' : p.category === 'necklaces' ? 'สร้อยคอ' : p.category === 'earrings' ? 'ต่างหู' : p.category === 'bracelets' ? 'กำไล/ข้อมือ' : 'เซ็ตวิวาห์'}</span>
                            <div class="flex items-center gap-1 text-neutral-600">
                                <i class="fa-solid fa-star text-[9px] text-amber-500"></i>
                                <span class="font-medium text-neutral-800">${p.rating.toFixed(1)}</span>
                            </div>
                        </div>

                        <h3 onclick="openProductModal(${p.id})" class="text-neutral-900 font-medium text-sm line-clamp-2 hover:text-neutral-600 transition cursor-pointer mb-2">
                            ${p.name}
                        </h3>

                        <p class="text-xs text-neutral-500 mb-4 line-clamp-1">
                            ${p.gemstone ? `${p.gemstone} • ` : ''}${p.material}
                        </p>
                    </div>

                    <!-- Price & Action -->
                    <div class="pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <div>
                            <span class="text-base font-semibold text-neutral-900 font-serif-luxury tracking-wide">฿${p.price.toLocaleString()}</span>
                            ${p.original_price && p.original_price > p.price ? `
                                <span class="block text-[11px] text-neutral-400 line-through">฿${p.original_price.toLocaleString()}</span>
                            ` : ''}
                        </div>
                        <button onclick="quickAddToCart(${p.id}, event)" class="px-3.5 py-1.5 rounded-full border border-neutral-300 hover:border-black hover:bg-black hover:text-white text-neutral-800 transition text-xs tracking-wider">
                            + ตระกร้า
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Quick Add to Cart
function quickAddToCart(productId, event) {
    if (event) event.stopPropagation();
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const defaultSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'Standard';
    const defaultMaterial = product.material;

    addToCart(product, defaultSize, defaultMaterial, '', 1);
}

// Add to Cart
function addToCart(product, size, material, engraving, qty = 1) {
    const existingIndex = state.cart.findIndex(item => 
        item.id === product.id && 
        item.size === size && 
        item.material === material && 
        item.engraving === engraving
    );

    if (existingIndex > -1) {
        state.cart[existingIndex].qty += qty;
    } else {
        state.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            image_url: product.image_url,
            size: size || 'Standard',
            material: material || product.material,
            engraving: engraving || '',
            qty: qty
        });
    }

    saveCart();
    updateCartCount();
    renderCart();
    openCartDrawer();
    showToast(`เพิ่ม "${product.name.slice(0, 22)}..." ลงตระกร้าแล้ว`, 'success');
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('forme_cart', JSON.stringify(state.cart));
}

// Update Cart Count Badges
function updateCartCount() {
    const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => {
        b.innerText = totalQty;
        b.classList.toggle('hidden', totalQty === 0);
    });
}

// Update Wishlist Count
function updateWishlistCount() {
    const badges = document.querySelectorAll('.wishlist-badge');
    badges.forEach(b => {
        b.innerText = state.wishlist.length;
        b.classList.toggle('hidden', state.wishlist.length === 0);
    });
}

// Toggle Wishlist
function toggleWishlist(productId, event) {
    if (event) event.stopPropagation();
    const idx = state.wishlist.indexOf(productId);
    if (idx > -1) {
        state.wishlist.splice(idx, 1);
        showToast('นำออกจากรายการโปรดแล้ว', 'info');
    } else {
        state.wishlist.push(productId);
        showToast('บันทึกลงในรายการโปรดเรียบร้อย', 'success');
    }
    localStorage.setItem('forme_wishlist', JSON.stringify(state.wishlist));
    updateWishlistCount();
    renderProducts(state.products);
    renderWishlist();
}

// Open Product Modal (Minimalist)
async function openProductModal(productId) {
    try {
        let p = null;
        try {
            const res = await fetch(`/api/products/${productId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.success) p = data.product;
            }
        } catch (err) {}

        if (!p) {
            p = (state.products || []).find(item => item.id === productId) || DEFAULT_PRODUCTS.find(item => item.id === productId);
        }
        if (!p) return;
        state.currentProduct = p;
        state.activeGalleryIndex = 0;
        state.selectedSize = (p.sizes && p.sizes.length > 0) ? p.sizes[0] : '';
        state.selectedMaterial = p.material;
        state.engravingText = '';

        const modal = document.getElementById('productModal');
        const modalContent = document.getElementById('productModalContent');
        if (!modal || !modalContent) return;

        modalContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-neutral-800">
                <!-- Gallery Section -->
                <div>
                    <div class="relative w-full pt-[100%] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 mb-3">
                        <img id="mainModalImg" src="${p.gallery[0] || p.image_url}" alt="${p.name}" class="absolute inset-0 w-full h-full object-cover">
                        ${p.badge ? `<span class="absolute top-3 left-3 px-2.5 py-0.5 text-[10px] font-medium tracking-wider uppercase bg-white/95 text-neutral-900 border border-neutral-200 rounded shadow-sm">${p.badge}</span>` : ''}
                    </div>
                    <!-- Thumbnails -->
                    ${p.gallery && p.gallery.length > 1 ? `
                        <div class="flex gap-2 overflow-x-auto pb-1">
                            ${p.gallery.map((img, idx) => `
                                <button onclick="setModalGalleryImg('${img}', ${idx})" class="thumb-btn flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border ${idx === 0 ? 'border-neutral-900' : 'border-neutral-200 opacity-60'} hover:opacity-100 transition">
                                    <img src="${img}" class="w-full h-full object-cover">
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}

                    <!-- Guarantees Minimal -->
                    <div class="grid grid-cols-2 gap-3 mt-6 p-4 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs text-neutral-600">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-certificate text-neutral-800"></i>
                            <span>ใบรับรองแท้ GIA / HRD</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-truck-fast text-neutral-800"></i>
                            <span>จัดส่งฟรี มีประกันภัยเต็ม</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-pen-nib text-neutral-800"></i>
                            <span>บริการสลักชื่อเลเซอร์ฟรี</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-arrows-rotate text-neutral-800"></i>
                            <span>บริการสปาปรับไซส์ตลอดชีพ</span>
                        </div>
                    </div>
                </div>

                <!-- Product Details -->
                <div class="flex flex-col justify-between">
                    <div>
                        <!-- Category & Title -->
                        <div class="text-[11px] text-neutral-400 font-medium tracking-widest uppercase mb-1">
                            ${p.category.toUpperCase()} • ${p.material}
                        </div>
                        <h2 class="text-2xl font-serif text-neutral-900 mb-2 leading-snug">${p.name}</h2>
                        
                        <!-- Rating & Reviews -->
                        <div class="flex items-center gap-2 mb-4 text-xs text-neutral-600">
                            <div class="flex text-amber-500 text-[10px]">
                                ${Array(5).fill(0).map((_, i) => `
                                    <i class="fa-solid fa-star ${i < Math.round(p.rating) ? 'text-amber-500' : 'text-neutral-300'}"></i>
                                `).join('')}
                            </div>
                            <span class="font-medium text-neutral-900">${p.rating.toFixed(1)}</span>
                            <span class="text-neutral-400">(${p.review_count} รีวิว)</span>
                            <span class="text-[11px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 ml-1">
                                พร้อมส่ง (${p.stock} ชิ้น)
                            </span>
                        </div>

                        <!-- Price Section -->
                        <div class="py-3 mb-4 flex items-baseline gap-3 border-b border-neutral-100">
                            <span class="text-2xl font-semibold text-neutral-900 font-serif-luxury tracking-wide">฿${p.price.toLocaleString()}</span>
                            ${p.original_price && p.original_price > p.price ? `
                                <span class="text-sm text-neutral-400 line-through">฿${p.original_price.toLocaleString()}</span>
                            ` : ''}
                        </div>

                        <!-- Description -->
                        <p class="text-xs text-neutral-600 leading-relaxed mb-5">${p.description}</p>

                        <!-- Product Specification Highlights -->
                        ${p.details && p.details.length > 0 ? `
                            <div class="mb-5">
                                <h4 class="text-[11px] font-medium text-neutral-500 tracking-widest uppercase mb-2">รายละเอียดอัญมณี</h4>
                                <ul class="space-y-1 text-xs text-neutral-600">
                                    ${p.details.map(d => `
                                        <li class="flex items-start gap-2">
                                            <span class="text-neutral-400">•</span>
                                            <span>${d}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <!-- Ring / Size Selector -->
                        ${p.sizes && p.sizes.length > 0 ? `
                            <div class="mb-5">
                                <div class="flex justify-between items-center mb-2">
                                    <label class="text-[11px] font-medium text-neutral-600 uppercase tracking-widest">ขนาด / ไซส์:</label>
                                    <button onclick="openSizeGuideModal()" class="text-xs text-neutral-500 hover:text-black underline flex items-center gap-1">
                                        <i class="fa-solid fa-ruler"></i> คู่มือวัดไซส์
                                    </button>
                                </div>
                                <div class="flex flex-wrap gap-2" id="modalSizeContainer">
                                    ${p.sizes.map((s, idx) => `
                                        <button onclick="selectProductSize('${s}', this)" class="size-btn px-3.5 py-1.5 rounded-lg text-xs transition ${idx === 0 ? 'active' : ''}">
                                            ${s}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Laser Engraving Option -->
                        ${p.can_engrave ? `
                            <div class="mb-5 p-3 rounded-lg bg-neutral-50 border border-neutral-200/80">
                                <div class="flex items-center justify-between mb-1.5">
                                    <label class="text-xs font-medium text-neutral-800 flex items-center gap-1.5">
                                        <i class="fa-solid fa-pen-nib text-xs"></i> สลักชื่อเลเซอร์ฟรี
                                    </label>
                                    <span class="text-[10px] text-neutral-400">สูงสุด 15 ตัวอักษร</span>
                                </div>
                                <input type="text" id="modalEngravingInput" maxlength="15" placeholder="เช่น FOREVER ♡ / 14.02.26 / ชื่อย่อ" 
                                    class="w-full bg-white border border-neutral-300 rounded-md px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-black">
                            </div>
                        ` : ''}
                    </div>

                    <!-- Actions -->
                    <div class="pt-4 border-t border-neutral-100 flex gap-3">
                        <div class="flex items-center bg-white rounded-lg border border-neutral-300">
                            <button onclick="changeModalQty(-1)" class="w-8 h-9 text-neutral-600 hover:text-black flex items-center justify-center text-xs">-</button>
                            <input id="modalQtyInput" type="number" value="1" min="1" max="${p.stock}" class="w-8 text-center bg-transparent text-xs font-medium text-neutral-900 focus:outline-none">
                            <button onclick="changeModalQty(1)" class="w-8 h-9 text-neutral-600 hover:text-black flex items-center justify-center text-xs">+</button>
                        </div>
                        <button onclick="submitModalAddToCart()" class="flex-1 py-2.5 px-6 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-medium tracking-wider transition">
                            เพิ่มลงตระกร้า
                        </button>
                    </div>

                    <!-- Customer Reviews -->
                    <div class="mt-6 pt-5 border-t border-neutral-100">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="font-medium text-neutral-900 text-xs tracking-wider uppercase">รีวิวจากลูกค้า (${p.reviews ? p.reviews.length : 0})</h4>
                            <button onclick="toggleReviewForm()" class="text-xs text-neutral-500 hover:text-black underline">
                                เขียนรีวิว
                            </button>
                        </div>

                        <!-- Write Review Form -->
                        <div id="reviewForm" class="hidden p-3.5 rounded-lg bg-neutral-50 border border-neutral-200 mb-3 space-y-2.5">
                            <input type="text" id="revAuthor" placeholder="ชื่อของคุณ" class="w-full bg-white border border-neutral-300 rounded-md px-3 py-1.5 text-xs text-neutral-800">
                            <div class="flex items-center gap-2">
                                <span class="text-xs text-neutral-500">คะแนน:</span>
                                <select id="revRating" class="bg-white border border-neutral-300 rounded-md px-2 py-1 text-xs text-neutral-800">
                                    <option value="5">⭐⭐⭐⭐⭐ 5 ดาว</option>
                                    <option value="4">⭐⭐⭐⭐ 4 ดาว</option>
                                    <option value="3">⭐⭐⭐ 3 ดาว</option>
                                </select>
                            </div>
                            <textarea id="revComment" rows="2" placeholder="ความคิดเห็นเกี่ยวกับสินค้า..." class="w-full bg-white border border-neutral-300 rounded-md px-3 py-1.5 text-xs text-neutral-800"></textarea>
                            <button onclick="submitProductReview(${p.id})" class="px-4 py-1.5 rounded-md bg-neutral-900 text-white text-xs">ส่งรีวิว</button>
                        </div>

                        <!-- Reviews List -->
                        <div class="space-y-2.5 max-h-40 overflow-y-auto pr-1">
                            ${p.reviews && p.reviews.length > 0 ? p.reviews.map(rev => `
                                <div class="p-2.5 rounded-md bg-neutral-50 text-xs">
                                    <div class="flex justify-between items-center mb-1">
                                        <span class="font-medium text-neutral-800">${rev.customer_name}</span>
                                        <span class="text-amber-500 text-[9px]">${'★'.repeat(rev.rating)}</span>
                                    </div>
                                    <p class="text-neutral-500">${rev.comment}</p>
                                </div>
                            `).join('') : `
                                <p class="text-xs text-neutral-400 italic">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (err) {
        console.error('Error opening product modal:', err);
    }
}

function setModalGalleryImg(url, idx) {
    const mainImg = document.getElementById('mainModalImg');
    if (mainImg) mainImg.src = url;

    const thumbBtns = document.querySelectorAll('.thumb-btn');
    thumbBtns.forEach((btn, i) => {
        if (i === idx) {
            btn.classList.add('border-neutral-900');
            btn.classList.remove('border-neutral-200', 'opacity-60');
        } else {
            btn.classList.remove('border-neutral-900');
            btn.classList.add('border-neutral-200', 'opacity-60');
        }
    });
}

function selectProductSize(size, btn) {
    state.selectedSize = size;
    const allBtns = document.querySelectorAll('#modalSizeContainer .size-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function changeModalQty(delta) {
    const input = document.getElementById('modalQtyInput');
    if (!input) return;
    let val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (state.currentProduct && val > state.currentProduct.stock) val = state.currentProduct.stock;
    input.value = val;
}

function toggleReviewForm() {
    const form = document.getElementById('reviewForm');
    if (form) form.classList.toggle('hidden');
}

async function submitProductReview(productId) {
    const name = document.getElementById('revAuthor')?.value.trim();
    const rating = document.getElementById('revRating')?.value;
    const comment = document.getElementById('revComment')?.value.trim();

    if (!name || !comment) {
        showToast('กรุณากรอกชื่อและความเห็น', 'warning');
        return;
    }

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, customer_name: name, rating, comment })
        });
        const data = await res.json();
        if (data.success) {
            showToast('ขอบพระคุณสำหรับรีวิวของคุณ', 'success');
            openProductModal(productId);
            fetchProducts();
        }
    } catch (err) {
        showToast('เกิดข้อผิดพลาดในการส่งรีวิว', 'error');
    }
}

function submitModalAddToCart() {
    if (!state.currentProduct) return;
    const qty = parseInt(document.getElementById('modalQtyInput')?.value || 1);
    const engraving = document.getElementById('modalEngravingInput')?.value.trim() || '';

    addToCart(state.currentProduct, state.selectedSize, state.selectedMaterial, engraving, qty);
    closeProductModal();
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Shopping Cart Drawer Functions (Minimalist)
function openCartDrawer() {
    renderCart();
    const drawer = document.getElementById('cartDrawer');
    if (drawer) drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    if (drawer) drawer.classList.add('hidden');
    document.body.style.overflow = '';
}

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountEl = document.getElementById('cartDiscount');
    const shippingEl = document.getElementById('cartShipping');
    const totalEl = document.getElementById('cartTotal');
    const progressEl = document.getElementById('freeShippingProgress');
    const progressTextEl = document.getElementById('freeShippingText');

    if (!container) return;

    if (state.cart.length === 0) {
        container.innerHTML = `
            <div class="py-20 text-center text-neutral-400">
                <i class="fa-solid fa-bag-shopping text-4xl text-neutral-300 mb-3 block"></i>
                <p class="text-sm font-medium text-neutral-800">ตระกร้าของคุณว่างเปล่า</p>
                <p class="text-xs text-neutral-500 mt-1">สำรวจเครื่องประดับแล้วเลือกชิ้นโปรดของคุณ</p>
                <button onclick="closeCartDrawer()" class="mt-5 px-5 py-2 rounded-full bg-neutral-900 text-white text-xs tracking-wider">
                    เริ่มช้อปปิ้ง
                </button>
            </div>
        `;
        if (subtotalEl) subtotalEl.innerText = '฿0';
        if (discountEl) discountEl.innerText = '-฿0';
        if (shippingEl) shippingEl.innerText = '฿0';
        if (totalEl) totalEl.innerText = '฿0';
        if (progressEl) progressEl.style.width = '0%';
        if (progressTextEl) progressTextEl.innerText = 'ซื้อครบ 2,000.- ส่งฟรีทั่วประเทศ';
        return;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const freeShippingThreshold = 2000;
    const shippingFee = subtotal >= freeShippingThreshold ? 0 : 100;
    const progressPct = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
    
    if (progressEl) progressEl.style.width = `${progressPct}%`;
    if (progressTextEl) {
        if (subtotal >= freeShippingThreshold) {
            progressTextEl.innerHTML = '<span class="text-neutral-900 font-medium">คุณได้รับสิทธิ์จัดส่งฟรีแล้ว</span>';
        } else {
            const remaining = freeShippingThreshold - subtotal;
            progressTextEl.innerHTML = `ช้อปอีก <strong class="text-neutral-900">฿${remaining.toLocaleString()}</strong> เพื่อส่งฟรี`;
        }
    }

    let discountAmount = 0;
    if (state.appliedCoupon) {
        if (state.appliedCoupon.discount_type === 'percentage') {
            discountAmount = Math.round(subtotal * (state.appliedCoupon.discount_value / 100));
        } else {
            discountAmount = Math.min(subtotal, state.appliedCoupon.discount_value);
        }
    }

    const total = Math.max(0, subtotal - discountAmount + shippingFee);

    container.innerHTML = state.cart.map((item, idx) => `
        <div class="flex gap-3.5 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80">
            <img src="${item.image_url}" alt="${item.name}" class="w-16 h-16 rounded-md object-cover bg-neutral-100">
            <div class="flex-1 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start">
                        <h4 class="text-xs font-medium text-neutral-900 line-clamp-1">${item.name}</h4>
                        <button onclick="removeCartItem(${idx})" class="text-neutral-400 hover:text-neutral-800 text-xs">
                            <i class="fa-regular fa-trash-can"></i>
                        </button>
                    </div>
                    <div class="text-[11px] text-neutral-500 mt-0.5">
                        ${item.size ? `<span>ไซส์: ${item.size}</span>` : ''}
                        ${item.engraving ? `<span class="block text-neutral-700">สลัก: "${item.engraving}"</span>` : ''}
                    </div>
                </div>

                <div class="flex justify-between items-center mt-2 pt-2 border-t border-neutral-200/60">
                    <span class="text-xs font-semibold text-neutral-900 font-serif-luxury">฿${(item.price * item.qty).toLocaleString()}</span>
                    <div class="flex items-center bg-white rounded border border-neutral-300">
                        <button onclick="updateCartItemQty(${idx}, -1)" class="w-6 h-6 text-xs text-neutral-600 hover:text-black flex items-center justify-center">-</button>
                        <span class="w-6 text-center text-xs text-neutral-900 font-medium">${item.qty}</span>
                        <button onclick="updateCartItemQty(${idx}, 1)" class="w-6 h-6 text-xs text-neutral-600 hover:text-black flex items-center justify-center">+</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    if (subtotalEl) subtotalEl.innerText = `฿${subtotal.toLocaleString()}`;
    if (discountEl) discountEl.innerText = `-฿${discountAmount.toLocaleString()}`;
    if (shippingEl) shippingEl.innerText = shippingFee === 0 ? 'ฟรี' : `฿${shippingFee.toLocaleString()}`;
    if (totalEl) totalEl.innerText = `฿${total.toLocaleString()}`;

    // Render active coupon tag
    const couponTag = document.getElementById('activeCouponTag');
    if (couponTag) {
        if (state.appliedCoupon) {
            couponTag.innerHTML = `
                <div class="flex items-center justify-between px-3 py-1 rounded bg-neutral-100 border border-neutral-300 text-xs text-neutral-800">
                    <span>โค้ด: <strong>${state.appliedCoupon.code}</strong> (-฿${discountAmount.toLocaleString()})</span>
                    <button onclick="removeCoupon()" class="text-neutral-500 hover:text-black ml-2">×</button>
                </div>
            `;
            couponTag.classList.remove('hidden');
        } else {
            couponTag.classList.add('hidden');
        }
    }
}

function updateCartItemQty(index, delta) {
    if (state.cart[index]) {
        state.cart[index].qty += delta;
        if (state.cart[index].qty <= 0) {
            state.cart.splice(index, 1);
        }
        saveCart();
        updateCartCount();
        renderCart();
    }
}

function removeCartItem(index) {
    state.cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCart();
    showToast('ลบสินค้าออกจากตระกร้าแล้ว', 'info');
}

// Coupon validation
async function applyCoupon() {
    const input = document.getElementById('couponInput');
    const code = input?.value.trim().toUpperCase();
    if (!code) {
        showToast('กรุณากรอกรหัสคูปอง', 'warning');
        return;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    try {
        const res = await fetch('/api/coupons/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, cart_total: subtotal })
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                state.appliedCoupon = data;
                localStorage.setItem('forme_coupon', JSON.stringify(data));
                renderCart();
                showToast(data.message, 'success');
                if (input) input.value = '';
                return;
            } else {
                showToast(data.message || 'รหัสคูปองไม่ถูกต้อง', 'error');
                return;
            }
        }
    } catch (err) {}

    // Static fallback
    const staticCoupons = {
        'WELCOME10': { discount_type: 'percentage', discount_value: 10, min_spend: 1000, description: 'ส่วนลด 10%' },
        'SPARKLE500': { discount_type: 'fixed', discount_value: 500, min_spend: 3000, description: 'ส่วนลด 500.-' },
        'LUXE20': { discount_type: 'percentage', discount_value: 20, min_spend: 10000, description: 'ส่วนลด 20%' }
    };
    if (staticCoupons[code]) {
        const c = staticCoupons[code];
        if (subtotal < c.min_spend) {
            showToast(`คูปองนี้ใช้ได้เมื่อช้อปครบ ฿${c.min_spend.toLocaleString()}`, 'warning');
            return;
        }
        const disc = c.discount_type === 'percentage' ? Math.round(subtotal * (c.discount_value / 100)) : c.discount_value;
        const couponData = { code, discount_type: c.discount_type, discount_value: c.discount_value, discount_amount: disc, description: c.description };
        state.appliedCoupon = couponData;
        localStorage.setItem('forme_coupon', JSON.stringify(couponData));
        renderCart();
        showToast(`ใช้คูปอง ${code} สำเร็จ! ประหยัด ฿${disc.toLocaleString()}`, 'success');
        if (input) input.value = '';
    } else {
        showToast('รหัสคูปองไม่ถูกต้อง หรือหมดอายุแล้ว', 'error');
    }
}

function removeCoupon() {
    state.appliedCoupon = null;
    localStorage.removeItem('forme_coupon');
    renderCart();
    showToast('ยกเลิกการใช้คูปองแล้ว', 'info');
}

// Wishlist Drawer Functions (Minimalist)
function openWishlistDrawer() {
    renderWishlist();
    const drawer = document.getElementById('wishlistDrawer');
    if (drawer) drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeWishlistDrawer() {
    const drawer = document.getElementById('wishlistDrawer');
    if (drawer) drawer.classList.add('hidden');
    document.body.style.overflow = '';
}

function renderWishlist() {
    const container = document.getElementById('wishlistItemsContainer');
    if (!container) return;

    const wishlistedProducts = state.products.filter(p => state.wishlist.includes(p.id));

    if (wishlistedProducts.length === 0) {
        container.innerHTML = `
            <div class="py-20 text-center text-neutral-400">
                <i class="fa-regular fa-heart text-4xl text-neutral-300 mb-3 block"></i>
                <p class="text-sm font-medium text-neutral-800">ยังไม่มีสินค้าในรายการโปรด</p>
                <p class="text-xs text-neutral-500 mt-1">กดไอคอนหัวใจเพื่อบันทึกชิ้นงานที่สนใจ</p>
            </div>
        `;
        return;
    }

    container.innerHTML = wishlistedProducts.map(p => `
        <div class="flex gap-3.5 p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/80 items-center">
            <img src="${p.image_url}" alt="${p.name}" class="w-16 h-16 rounded-md object-cover bg-neutral-100">
            <div class="flex-1">
                <h4 class="text-xs font-medium text-neutral-900 line-clamp-1">${p.name}</h4>
                <p class="text-xs text-neutral-900 font-semibold font-serif-luxury mt-0.5">฿${p.price.toLocaleString()}</p>
                <div class="flex gap-2 mt-2">
                    <button onclick="quickAddToCart(${p.id}); toggleWishlist(${p.id});" class="text-xs px-3 py-1 rounded bg-neutral-900 text-white transition">
                        ใส่ตระกร้า
                    </button>
                    <button onclick="toggleWishlist(${p.id})" class="text-xs text-neutral-400 hover:text-neutral-800">
                        ลบ
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Checkout Modal Flow
function openCheckoutModal() {
    if (state.cart.length === 0) {
        showToast('กรุณาเลือกสินค้าใส่ตระกร้าก่อนดำเนินการชำระเงิน', 'warning');
        return;
    }
    closeCartDrawer();

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const shippingFee = subtotal >= 2000 ? 0 : 100;
    let discountAmount = 0;
    if (state.appliedCoupon) {
        if (state.appliedCoupon.discount_type === 'percentage') {
            discountAmount = Math.round(subtotal * (state.appliedCoupon.discount_value / 100));
        } else {
            discountAmount = Math.min(subtotal, state.appliedCoupon.discount_value);
        }
    }
    const total = Math.max(0, subtotal - discountAmount + shippingFee);

    const sumSubtotal = document.getElementById('checkoutSubtotal');
    const sumDiscount = document.getElementById('checkoutDiscount');
    const sumShipping = document.getElementById('checkoutShipping');
    const sumTotal = document.getElementById('checkoutTotal');
    const promptpayAmount = document.getElementById('promptpayAmount');

    if (sumSubtotal) sumSubtotal.innerText = `฿${subtotal.toLocaleString()}`;
    if (sumDiscount) sumDiscount.innerText = `-฿${discountAmount.toLocaleString()}`;
    if (sumShipping) sumShipping.innerText = shippingFee === 0 ? 'ฟรี' : `฿${shippingFee.toLocaleString()}`;
    if (sumTotal) sumTotal.innerText = `฿${total.toLocaleString()}`;
    if (promptpayAmount) promptpayAmount.innerText = `฿${total.toLocaleString()}`;

    const checkoutItems = document.getElementById('checkoutItemsList');
    if (checkoutItems) {
        checkoutItems.innerHTML = state.cart.map(i => `
            <div class="flex justify-between items-center text-xs py-1.5 border-b border-neutral-100">
                <span class="text-neutral-700">${i.name} (x${i.qty})</span>
                <span class="text-neutral-900 font-medium">฿${(i.price * i.qty).toLocaleString()}</span>
            </div>
        `).join('');
    }

    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function setPaymentMethod(method) {
    document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('border-neutral-900', 'bg-neutral-100'));
    document.querySelectorAll('.payment-panel').forEach(p => p.classList.add('hidden'));

    const tab = document.getElementById(`payTab_${method}`);
    const panel = document.getElementById(`payPanel_${method}`);
    if (tab) tab.classList.add('border-neutral-900', 'bg-neutral-100');
    if (panel) panel.classList.remove('hidden');
}

// Process Complete Order
async function processOrderSubmit(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('orderCustName')?.value.trim();
    const phone = document.getElementById('orderCustPhone')?.value.trim();
    const email = document.getElementById('orderCustEmail')?.value.trim();
    const address = document.getElementById('orderCustAddress')?.value.trim();
    const province = document.getElementById('orderCustProvince')?.value.trim();
    const postal = document.getElementById('orderCustPostal')?.value.trim();
    const giftWrap = document.getElementById('orderGiftWrap')?.checked;
    const giftMsg = document.getElementById('orderGiftMsg')?.value.trim();
    
    let paymentMethod = 'promptpay';
    const checkedPay = document.querySelector('input[name="payment_method_choice"]:checked');
    if (checkedPay) paymentMethod = checkedPay.value;

    if (!name || !phone || !address || !province || !postal) {
        showToast('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน', 'warning');
        return;
    }

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    let discountAmount = 0;
    if (state.appliedCoupon) {
        if (state.appliedCoupon.discount_type === 'percentage') {
            discountAmount = Math.round(subtotal * (state.appliedCoupon.discount_value / 100));
        } else {
            discountAmount = Math.min(subtotal, state.appliedCoupon.discount_value);
        }
    }

    const payload = {
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        shipping_address: address,
        province: province,
        postal_code: postal,
        payment_method: paymentMethod,
        subtotal: subtotal,
        discount: discountAmount,
        coupon_code: state.appliedCoupon ? state.appliedCoupon.code : '',
        gift_wrap: giftWrap,
        gift_message: giftMsg,
        items: state.cart
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                closeCheckoutModal();
                state.cart = [];
                state.appliedCoupon = null;
                saveCart();
                localStorage.removeItem('forme_coupon');
                updateCartCount();

                // Save to local storage history for device tracking
                const savedOrders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
                const newRecord = {
                    order_number: data.order_number,
                    tracking_number: data.tracking_number,
                    total: data.total || subtotal,
                    order_status: data.order_status || 'processing',
                    payment_status: ['promptpay', 'card'].includes(paymentMethod) ? 'paid' : 'pending',
                    created_at: new Date().toISOString(),
                    items: payload.items || [],
                    customer_name: payload.customer_name,
                    customer_phone: payload.customer_phone,
                    shipping_address: payload.shipping_address,
                    province: payload.province,
                    postal_code: payload.postal_code,
                    ...payload
                };
                savedOrders.unshift(newRecord);
                localStorage.setItem('forme_orders', JSON.stringify(savedOrders));

                showOrderSuccessModal(data, payload);
                return;
            }
        }
    } catch (err) {}

    // Static fallback for GitHub Pages
    const orderNum = `FRM-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNum = `THP${Math.floor(100000000 + Math.random() * 900000000)}TH`;
    const staticOrder = {
        order_number: orderNum,
        tracking_number: trackingNum,
        total: Math.max(0, subtotal - discountAmount + (subtotal >= 2000 ? 0 : 100)),
        order_status: 'processing',
        payment_status: ['promptpay', 'card'].includes(paymentMethod) ? 'paid' : 'pending',
        created_at: new Date().toISOString(),
        items: payload.items || [],
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone,
        shipping_address: payload.shipping_address,
        province: payload.province,
        postal_code: payload.postal_code,
        ...payload
    };
    const savedOrders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
    savedOrders.unshift(staticOrder);
    localStorage.setItem('forme_orders', JSON.stringify(savedOrders));

    closeCheckoutModal();
    state.cart = [];
    state.appliedCoupon = null;
    saveCart();
    localStorage.removeItem('forme_coupon');
    updateCartCount();

    showOrderSuccessModal(staticOrder, payload);
}

// Default Demo Orders for Instant User Testing & Tracking
const DEFAULT_DEMO_ORDERS = [
    {
        id: 101,
        order_number: 'FRM-20261022-3023',
        tracking_number: 'THP99887766TH',
        customer_name: 'คุณณัฐพร ภัทรเดชากุล',
        customer_phone: '089-123-4567',
        customer_email: 'nattaporn.p@gmail.com',
        shipping_address: '88/12 อาคารพาร์คเวนเชอร์ อีโคเพล็กซ์ ถ.วิทยุ แขวงลุมพินี เขตปทุมวัน',
        province: 'กรุงเทพมหานคร',
        postal_code: '10330',
        order_status: 'shipped',
        payment_status: 'paid',
        payment_method: 'credit_card',
        created_at: '2026-10-21T09:30:00Z',
        subtotal: 35900,
        discount: 3590,
        shipping_fee: 0,
        total: 32310,
        carrier: 'Kerry Express VIP (พัสดุคุ้มครองมูลค่าสูง)',
        items: [
            {
                id: 1,
                name: 'แหวนเพชรแท้ Solitaire Eternal Brilliance 18K',
                price: 35900,
                qty: 1,
                size: '52',
                engraving: 'FOREVER & ALWAYS 🤍',
                image_url: 'static/images/products/solitaire_ring.jpg'
            }
        ]
    },
    {
        id: 102,
        order_number: 'FRM-20261022-1450',
        tracking_number: 'THP44332211TH',
        customer_name: 'คุณพัชราภา เลิศวรวัฒน์',
        customer_phone: '081-998-8776',
        customer_email: 'patcharapa.l@hotmail.com',
        shipping_address: '45/8 หมู่บ้านพฤกษาวิลเลจ ถ.สุขุมวิท ต.แสนสุข อ.เมือง',
        province: 'ชลบุรี',
        postal_code: '20130',
        order_status: 'quality_check',
        payment_status: 'paid',
        payment_method: 'promptpay',
        created_at: '2026-10-22T08:15:00Z',
        subtotal: 39500,
        discount: 3950,
        shipping_fee: 0,
        total: 35550,
        carrier: 'ไปรษณีย์ไทย EMS (ประกันภัยอัญมณีแท้)',
        items: [
            {
                id: 6,
                name: 'ต่างหูไข่มุกเซาท์ซีแท้ Golden South Sea Pearl Drop Earrings',
                price: 39500,
                qty: 1,
                size: 'มาตรฐาน',
                engraving: '',
                image_url: 'static/images/products/pearl_earrings.jpg'
            }
        ]
    },
    {
        id: 103,
        order_number: 'FRM-20261021-5685',
        tracking_number: 'THP778013849TH',
        customer_name: 'คุณกิตติศักดิ์ เจริญพร',
        customer_phone: '086-554-4332',
        customer_email: 'kittisak.c@yahoo.com',
        shipping_address: '120/5 ถ.มิตรภาพ ต.ในเมือง อ.เมือง',
        province: 'ขอนแก่น',
        postal_code: '40000',
        order_status: 'preparing',
        payment_status: 'paid',
        payment_method: 'promptpay',
        created_at: '2026-10-21T14:20:00Z',
        subtotal: 58000,
        discount: 5800,
        shipping_fee: 0,
        total: 52200,
        carrier: 'Kerry Express VIP Delivery',
        items: [
            {
                id: 5,
                name: 'จี้มรกตโคลัมเบียแท้ล้อมเพชร Colombian Emerald Pendant 18K',
                price: 58000,
                qty: 1,
                size: 'สายยาว 45 ซม.',
                engraving: 'FOR MY QUEEN',
                image_url: 'static/images/products/emerald_pendant.jpg'
            }
        ]
    }
];

function initDefaultOrders() {
    try {
        const existing = localStorage.getItem('forme_orders');
        if (!existing || JSON.parse(existing).length === 0) {
            localStorage.setItem('forme_orders', JSON.stringify(DEFAULT_DEMO_ORDERS));
        }
    } catch (e) {}
}

function formatOrderDate(dateString) {
    if (!dateString) return 'เร็วๆ นี้';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return dateString;
        return d.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

function calculateMilestoneTime(baseDate, hoursToAdd) {
    try {
        const d = new Date(baseDate || Date.now());
        if (isNaN(d.getTime())) return 'กำลังดำเนินการ';
        d.setHours(d.getHours() + hoursToAdd);
        return d.toLocaleDateString('th-TH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'กำลังดำเนินการ';
    }
}

function getOrderStatusBadge(status) {
    switch (status) {
        case 'preparing':
            return { label: 'เตรียมสินค้า & สลักชื่อ', bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' };
        case 'quality_check':
            return { label: 'ตรวจสอบ GIA & QC', bg: 'bg-sky-100', text: 'text-sky-800', dot: 'bg-sky-500' };
        case 'shipped':
            return { label: 'อยู่ระหว่างจัดส่ง', bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' };
        case 'delivered':
            return { label: 'จัดส่งสำเร็จ', bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' };
        case 'cancelled':
            return { label: 'ยกเลิกคำสั่งซื้อ', bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500' };
        case 'processing':
        default:
            return { label: 'รับคำสั่งซื้อแล้ว', bg: 'bg-neutral-200', text: 'text-neutral-800', dot: 'bg-neutral-500' };
    }
}

function copyTrackingCode(trackingCode) {
    if (!trackingCode) return;
    navigator.clipboard.writeText(trackingCode).then(() => {
        showToast(`คัดลอกเลขพัสดุ ${trackingCode} เรียบร้อยแล้ว`, 'success');
    }).catch(() => {
        showToast(`หมายเลขพัสดุ: ${trackingCode}`, 'info');
    });
}

function fillTrackingDemo(ref) {
    const input = document.getElementById('trackOrderInput');
    if (input) input.value = ref;
    trackOrderModal(ref);
}

function renderRecentOrdersList() {
    const section = document.getElementById('recentOrdersSection');
    const list = document.getElementById('recentOrdersList');
    if (!section || !list) return;

    let savedOrders = [];
    try {
        savedOrders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
    } catch (e) {}

    if (!savedOrders || savedOrders.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    list.innerHTML = savedOrders.slice(0, 3).map(o => {
        const badgeInfo = getOrderStatusBadge(o.order_status);
        const dateStr = formatOrderDate(o.created_at);
        const itemCount = (o.items || []).reduce((sum, it) => sum + (it.qty || 1), 0);
        return `
            <div onclick="fillTrackingDemo('${o.order_number}')" 
                class="group p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200/80 cursor-pointer transition flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 text-xs shadow-sm">
                        <i class="fa-solid fa-box"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-medium text-xs text-neutral-900 group-hover:underline">${o.order_number}</span>
                            <span class="text-[10px] px-2 py-0.5 rounded-full ${badgeInfo.bg} ${badgeInfo.text} font-medium">
                                ${badgeInfo.label}
                            </span>
                        </div>
                        <p class="text-[11px] text-neutral-400 mt-0.5 font-light">
                            ${dateStr} • ${itemCount} ชิ้น • ฿${(o.total || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="text-xs text-neutral-600 group-hover:text-black font-medium flex items-center gap-1">
                        ติดตาม <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Show Order Success Modal & Receipt
function showOrderSuccessModal(orderData, customerData) {
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) return;

    const ordNum = orderData.order_number || '-';
    const trkNum = orderData.tracking_number || '-';

    document.getElementById('successOrderNumber').innerText = ordNum;
    document.getElementById('successTrackingNumber').innerText = trkNum;
    document.getElementById('successTotalAmount').innerText = `฿${(orderData.total || 0).toLocaleString()}`;
    document.getElementById('successCustName').innerText = customerData.customer_name || '-';
    document.getElementById('successCustAddress').innerText = `${customerData.shipping_address || ''}, ${customerData.province || ''} ${customerData.postal_code || ''}`;

    const trackNowBtn = document.getElementById('successTrackNowBtn');
    if (trackNowBtn) {
        trackNowBtn.onclick = () => {
            closeOrderSuccessModal();
            openOrderTrackingModal(ordNum);
        };
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeOrderSuccessModal() {
    const modal = document.getElementById('orderSuccessModal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Order Tracking Function (VIP Luxury)
async function trackOrderModal(orderRef) {
    const input = document.getElementById('trackOrderInput');
    const ref = (orderRef || input?.value || '').trim();
    if (!ref) {
        showToast('กรุณากรอกหมายเลขคำสั่งซื้อ เบอร์โทร หรือเลขพัสดุ', 'warning');
        if (input) input.focus();
        return;
    }

    if (input) input.value = ref;

    const resultContainer = document.getElementById('trackingResultContainer');
    if (!resultContainer) return;

    // Show luxury loading state
    resultContainer.innerHTML = `
        <div class="py-12 text-center text-neutral-400">
            <div class="w-10 h-10 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin mx-auto mb-3"></div>
            <p class="text-xs tracking-wider uppercase font-light">กำลังค้นหาข้อมูลคำสั่งซื้อในระบบ VIP Concierge...</p>
        </div>
    `;

    let o = null;

    // 1. Try server API
    try {
        const res = await fetch(`/api/orders/${encodeURIComponent(ref)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.order) {
                o = data.order;
            }
        }
    } catch (err) {}

    // 2. Fallback to localStorage forme_orders
    if (!o) {
        try {
            const savedOrders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
            o = savedOrders.find(item => 
                (item.order_number && item.order_number.toLowerCase() === ref.toLowerCase()) || 
                (item.customer_phone && item.customer_phone.replace(/\D/g, '') === ref.replace(/\D/g, '')) || 
                (item.tracking_number && item.tracking_number.toLowerCase() === ref.toLowerCase())
            );
        } catch (e) {}
    }

    // 3. Fallback to DEFAULT_DEMO_ORDERS
    if (!o) {
        o = DEFAULT_DEMO_ORDERS.find(item => 
            (item.order_number && item.order_number.toLowerCase() === ref.toLowerCase()) || 
            (item.customer_phone && item.customer_phone.replace(/\D/g, '') === ref.replace(/\D/g, '')) || 
            (item.tracking_number && item.tracking_number.toLowerCase() === ref.toLowerCase())
        );
    }

    // Handle Not Found
    if (!o) {
        resultContainer.innerHTML = `
            <div class="p-6 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-center">
                <div class="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                    <i class="fa-solid fa-magnifying-glass text-lg"></i>
                </div>
                <h4 class="text-sm font-medium text-neutral-900 mb-1">ไม่พบข้อมูลคำสั่งซื้อ "${ref}"</h4>
                <p class="text-xs text-neutral-500 font-light max-w-sm mx-auto mb-4">
                    กรุณาตรวจสอบหมายเลขคำสั่งซื้อ (เช่น FRM-20261022-3023) หรือหมายเลขโทรศัพท์ที่ใช้สั่งซื้อ
                </p>
                <div class="flex flex-wrap justify-center gap-2">
                    <button type="button" onclick="fillTrackingDemo('FRM-20261022-3023')" class="px-3.5 py-1.5 rounded-full bg-white border border-neutral-300 text-neutral-800 hover:border-black text-xs font-light transition shadow-sm">
                        🚚 ลองค้นหา: ออเดอร์กำลังจัดส่ง
                    </button>
                    <button type="button" onclick="fillTrackingDemo('089-123-4567')" class="px-3.5 py-1.5 rounded-full bg-white border border-neutral-300 text-neutral-800 hover:border-black text-xs font-light transition shadow-sm">
                        📞 ลองค้นหาด้วยเบอร์โทร: 089-123-4567
                    </button>
                </div>
            </div>
        `;
        return;
    }

    // Parse items if string
    if (typeof o.items === 'string') {
        try { o.items = JSON.parse(o.items); } catch (e) { o.items = []; }
    }
    if (!Array.isArray(o.items)) o.items = [];

    // Map Active Step (1 to 5)
    let activeStep = 1;
    if (o.order_status === 'preparing') activeStep = 2;
    if (o.order_status === 'quality_check') activeStep = 3;
    if (o.order_status === 'shipped') activeStep = 4;
    if (o.order_status === 'delivered') activeStep = 5;

    const badgeInfo = getOrderStatusBadge(o.order_status);
    const orderCreatedAt = o.created_at || '2026-10-22T10:00:00Z';
    const carrierName = o.carrier || (o.tracking_number && o.tracking_number.startsWith('THP') ? 'ไปรษณีย์ไทย EMS (ประกันภัยอัญมณีแท้)' : 'Kerry Express VIP Delivery');
    const trackingCode = o.tracking_number || 'THP220044256TH';

    // 5 Milestones Data
    const milestones = [
        {
            step: 1,
            title: 'ยืนยันคำสั่งซื้อ & ชำระเงิน',
            subtitle: 'Order Confirmed',
            desc: 'ระบบยืนยันยอดชำระเงินและบันทึกข้อมูลคำสั่งซื้อเข้าระบบความปลอดภัยของ FORME เรียบร้อย',
            icon: 'fa-file-invoice-dollar',
            time: formatOrderDate(orderCreatedAt)
        },
        {
            step: 2,
            title: 'คัดสรรอัญมณี & สลักชื่อเลเซอร์',
            subtitle: 'Crafting & Engraving',
            desc: o.items.some(it => it.engraving) 
                ? 'ช่างทองคัดสรรเพชรแท้/พลอยแท้ และสลักเลเซอร์ข้อความพิเศษตามที่ท่านระบุ' 
                : 'ช่างฝีมือคัดสรรอัญมณีแท้คุณภาพสูงสุดและขึ้นรูปตัวเรือนทองคำ 18K',
            icon: 'fa-gem',
            time: calculateMilestoneTime(orderCreatedAt, 4)
        },
        {
            step: 3,
            title: 'ตรวจสอบคุณภาพมาตรฐาน GIA & QC',
            subtitle: 'GIA Quality Inspection',
            desc: 'นักอัญมณีศาสตร์ตรวจสอบความสมบูรณ์และบรรจุลงในกล่องกำมะหยี่หรูหราพร้อมใบรับรอง',
            icon: 'fa-certificate',
            time: calculateMilestoneTime(orderCreatedAt, 10)
        },
        {
            step: 4,
            title: 'ส่งมอบบริษัทขนส่งพัสดุหุ้มเกราะ',
            subtitle: 'In Transit / Dispatched',
            desc: `ส่งมอบ ${carrierName} พร้อมวงเงินประกันภัยคุ้มครองสินค้าเต็มจำนวน 100%`,
            icon: 'fa-truck-fast',
            time: calculateMilestoneTime(orderCreatedAt, 22)
        },
        {
            step: 5,
            title: 'จัดส่งสำเร็จถึงปลายทาง',
            subtitle: 'Delivered Safely',
            desc: 'พัสดุถึงที่อยู่ปลายทางเรียบร้อย พร้อมเซ็นรับมอบต่อเจ้าหน้าที่นำส่ง',
            icon: 'fa-house-circle-check',
            time: calculateMilestoneTime(orderCreatedAt, 48)
        }
    ];

    // Status description note
    let statusNotice = '';
    if (activeStep === 5) {
        statusNotice = `<span class="text-emerald-700 font-medium"><i class="fa-solid fa-circle-check mr-1"></i> พัสดุถูกจัดส่งและเซ็นรับมอบเรียบร้อยแล้ว ขอบพระคุณที่ไว้วางใจ FORME Fine Jewelry</span>`;
    } else if (activeStep === 4) {
        statusNotice = `<span class="text-indigo-700 font-medium"><i class="fa-solid fa-truck-fast mr-1"></i> พัสดุอยู่ระหว่างนำส่ง คาดว่าจะได้รับภายใน 1-2 วันทำการ (ประกันภัยครอบคลุม 100%)</span>`;
    } else if (activeStep === 3) {
        statusNotice = `<span class="text-sky-700 font-medium"><i class="fa-solid fa-microscope mr-1"></i> อยู่ระหว่างตรวจสอบอัญมณีและออกใบรับรอง GIA เพื่อความมั่นใจในมาตรฐานสูงสุด</span>`;
    } else if (activeStep === 2) {
        statusNotice = `<span class="text-amber-700 font-medium"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i> ช่างฝีมือผู้เชี่ยวชาญกำลังจัดเตรียมชิ้นงานและสลักชื่อเลเซอร์ด้วยความประณีต</span>`;
    } else {
        statusNotice = `<span class="text-neutral-700 font-medium"><i class="fa-solid fa-clock mr-1"></i> รับคำสั่งซื้อเรียบร้อย กำลังส่งต่อฝ่ายผลิตและคัดสรรเพชรแท้</span>`;
    }

    resultContainer.innerHTML = `
        <div class="space-y-4 animate-fade-in text-left">
            
            <!-- 1. Header Overview Card -->
            <div class="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 shadow-sm">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200/70">
                    <div>
                        <span class="text-[10px] text-neutral-400 uppercase tracking-widest block font-light">หมายเลขคำสั่งซื้อ (Order No.)</span>
                        <h4 class="text-lg font-semibold font-mono text-neutral-900 tracking-tight">${o.order_number}</h4>
                        <p class="text-[11px] text-neutral-500 mt-0.5 font-light">วันที่สั่งซื้อ: ${formatOrderDate(orderCreatedAt)}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${badgeInfo.bg} ${badgeInfo.text} text-xs font-medium border border-black/5 shadow-sm">
                            <span class="w-2 h-2 rounded-full ${badgeInfo.dot} animate-pulse"></span>
                            <span>${badgeInfo.label}</span>
                        </span>
                    </div>
                </div>

                <div class="pt-3 text-xs font-light">
                    ${statusNotice}
                </div>
            </div>

            <!-- 2. Carrier & Live Tracking Box -->
            <div class="p-4 sm:p-5 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div class="flex items-center gap-3.5">
                    <div class="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-amber-300 text-xl flex-shrink-0">
                        <i class="fa-solid fa-truck-shield"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] uppercase tracking-widest text-neutral-400">ขนส่งด่วนพิเศษ</span>
                            <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium">VIP 100% Insured</span>
                        </div>
                        <p class="text-xs font-medium text-white mt-0.5">${carrierName}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[11px] text-neutral-400 font-light">เลขพัสดุ:</span>
                            <span class="font-mono text-xs text-amber-200 tracking-wider font-semibold">${trackingCode}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 w-full sm:w-auto">
                    <button type="button" onclick="copyTrackingCode('${trackingCode}')" 
                        class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-light transition flex items-center justify-center gap-1.5 border border-white/10">
                        <i class="fa-regular fa-copy text-[11px]"></i>
                        <span>คัดลอกเลขพัสดุ</span>
                    </button>
                    <a href="https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(trackingCode)}" target="_blank" rel="noopener noreferrer" 
                        class="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white text-neutral-900 hover:bg-neutral-100 text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-sm">
                        <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                        <span>เช็คเว็บขนส่ง</span>
                    </a>
                </div>
            </div>

            <!-- 3. Vertical Milestone Timeline -->
            <div class="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-sm">
                <h5 class="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <i class="fa-solid fa-timeline text-neutral-400"></i>
                    <span>ลำดับขั้นตอนการจัดส่งสินค้า (Milestones)</span>
                </h5>

                <div class="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
                    ${milestones.map((m) => {
                        const isDone = m.step < activeStep;
                        const isCurrent = m.step === activeStep;
                        const isFuture = m.step > activeStep;

                        let circleClass = 'bg-neutral-100 text-neutral-400 border border-neutral-300';
                        let iconHtml = `<span class="text-[10px] font-mono">${m.step}</span>`;

                        if (isDone) {
                            circleClass = 'bg-neutral-900 text-white shadow-sm';
                            iconHtml = `<i class="fa-solid fa-check text-[11px]"></i>`;
                        } else if (isCurrent) {
                            circleClass = 'bg-neutral-900 text-white ring-4 ring-neutral-200 shadow-md';
                            iconHtml = `<i class="fa-solid ${m.icon} text-[11px] animate-pulse"></i>`;
                        }

                        return `
                            <div class="relative flex items-start gap-4">
                                <!-- Circle Node -->
                                <div class="absolute -left-[24px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${circleClass} transition-all z-10">
                                    ${iconHtml}
                                </div>

                                <!-- Text Content -->
                                <div class="flex-1">
                                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div class="flex items-center gap-2">
                                            <h6 class="text-xs font-medium ${isFuture ? 'text-neutral-400' : 'text-neutral-900'}">
                                                ${m.title}
                                            </h6>
                                            ${isCurrent ? `<span class="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[9px] font-medium">ขั้นตอนปัจจุบัน</span>` : ''}
                                        </div>
                                        <span class="text-[11px] ${isFuture ? 'text-neutral-400' : 'text-neutral-500'} font-light">
                                            ${m.time}
                                        </span>
                                    </div>
                                    <p class="text-[11px] ${isFuture ? 'text-neutral-400' : 'text-neutral-600'} mt-1 font-light leading-relaxed">
                                        ${m.desc}
                                    </p>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- 4. Shipping Address & Recipient Card -->
            <div class="p-5 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-xs font-light space-y-2">
                <div class="flex items-center gap-2 text-neutral-900 font-medium mb-1">
                    <i class="fa-solid fa-location-dot text-neutral-600"></i>
                    <span>ข้อมูลผู้รับและการจัดส่ง</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-neutral-700">
                    <div>
                        <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">ชื่อผู้รับ</span>
                        <p class="font-medium text-neutral-900 mt-0.5">${o.customer_name || 'ลูกค้าผู้มีเกียรติ'}</p>
                    </div>
                    <div>
                        <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">เบอร์โทรศัพท์</span>
                        <p class="font-mono text-neutral-900 mt-0.5">${o.customer_phone || '-'}</p>
                    </div>
                    <div class="sm:col-span-2">
                        <span class="text-[10px] text-neutral-400 uppercase tracking-wider block">ที่อยู่ปลายทาง</span>
                        <p class="text-neutral-800 mt-0.5">${o.shipping_address || ''} ${o.province || ''} ${o.postal_code || ''}</p>
                    </div>
                </div>
            </div>

            <!-- 5. Items in this Order -->
            <div class="p-5 rounded-2xl bg-white border border-neutral-200/90">
                <h5 class="text-xs font-medium text-neutral-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                    <span>รายการจิวเวลรี่ในคำสั่งซื้อ (${o.items.length} รายการ)</span>
                    <span class="text-[11px] text-neutral-400 font-light">รับประกันของแท้ 100%</span>
                </h5>
                <div class="divide-y divide-neutral-100">
                    ${o.items.map(item => `
                        <div class="py-3 flex items-center gap-3 text-xs first:pt-0 last:pb-0">
                            <img src="${item.image_url}" alt="${item.name}" 
                                onerror="this.src='static/images/products/solitaire_ring.jpg'"
                                class="w-12 h-12 rounded-xl object-cover bg-neutral-100 border border-neutral-200 flex-shrink-0">
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-neutral-900 truncate">${item.name}</p>
                                <div class="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 mt-0.5 font-light">
                                    <span>จำนวน: ${item.qty} ชิ้น</span>
                                    ${item.size ? `<span>• ไซส์: ${item.size}</span>` : ''}
                                    ${item.engraving ? `<span class="text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/50">• สลัก: "${item.engraving}"</span>` : ''}
                                </div>
                            </div>
                            <div class="text-right flex-shrink-0">
                                <span class="font-serif-luxury font-medium text-neutral-900">฿${((item.price || 0) * (item.qty || 1)).toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Financial Summary -->
                <div class="mt-4 pt-4 border-t border-neutral-200/80 space-y-1.5 text-xs font-light">
                    <div class="flex justify-between text-neutral-500">
                        <span>ราคารวมสินค้า</span>
                        <span>฿${(o.subtotal || o.total || 0).toLocaleString()}</span>
                    </div>
                    ${o.discount ? `
                        <div class="flex justify-between text-emerald-700">
                            <span>ส่วนลดคูปองพิเศษ</span>
                            <span>-฿${o.discount.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-neutral-500">
                        <span>ค่าจัดส่งพร้อมประกันภัย</span>
                        <span class="text-emerald-700 font-medium">ฟรี (VIP Insured)</span>
                    </div>
                    <div class="flex justify-between text-sm font-medium text-neutral-900 pt-2 border-t border-neutral-200">
                        <span>ยอดชำระสุทธิ</span>
                        <span class="font-serif-luxury text-base font-semibold">฿${(o.total || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <!-- 6. Footer Actions -->
            <div class="flex flex-col sm:flex-row gap-2 pt-2">
                <button type="button" onclick="window.print()" 
                    class="flex-1 py-2.5 rounded-xl border border-neutral-300 hover:border-black text-neutral-800 text-xs font-light transition flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-print text-[11px]"></i>
                    <span>พิมพ์ใบเสร็จและใบรับรอง</span>
                </button>
                <a href="https://line.me/ti/p/@forme.jewelry" target="_blank" 
                    class="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-light transition flex items-center justify-center gap-1.5">
                    <i class="fa-brands fa-line text-sm"></i>
                    <span>สอบถามเพิ่มเติมผ่าน LINE VIP</span>
                </a>
            </div>

        </div>
    `;
}

function openOrderTrackingModal(optionalOrderRef) {
    const modal = document.getElementById('orderTrackingModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    const input = document.getElementById('trackOrderInput');
    if (optionalOrderRef) {
        if (input) input.value = optionalOrderRef;
        trackOrderModal(optionalOrderRef);
    } else {
        renderRecentOrdersList();
        if (input) {
            setTimeout(() => input.focus(), 100);
        }
    }
}

function closeOrderTrackingModal() {
    const modal = document.getElementById('orderTrackingModal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Ring Size Guide Modal
function openSizeGuideModal() {
    const modal = document.getElementById('sizeGuideModal');
    if (modal) modal.classList.remove('hidden');
}

function closeSizeGuideModal() {
    const modal = document.getElementById('sizeGuideModal');
    if (modal) modal.classList.add('hidden');
}

// Filter & Category Handlers (Minimalist Underline Tabs)
function setCategory(cat, element) {
    state.activeCategory = cat;
    document.querySelectorAll('.cat-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    if (element) {
        element.classList.add('active');
    }
    fetchProducts();
}

function handleSearch(term) {
    state.filters.search = term.trim();
    fetchProducts();
}

function handleSort(sortValue) {
    state.filters.sort = sortValue;
    fetchProducts();
}

function handleMaterialFilter(material) {
    state.filters.material = material;
    fetchProducts();
}

function handleGemstoneFilter(gem) {
    state.filters.gemstone = gem;
    fetchProducts();
}

function handlePricePreset(min, max) {
    state.filters.minPrice = min;
    state.filters.maxPrice = max;
    fetchProducts();
}

function resetFilters() {
    state.activeCategory = 'all';
    state.filters = {
        material: 'all',
        gemstone: 'all',
        minPrice: null,
        maxPrice: null,
        search: '',
        sort: 'default'
    };
    const searchInput = document.getElementById('headerSearchInput');
    if (searchInput) searchInput.value = '';
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';

    document.querySelectorAll('.cat-tab').forEach((btn, idx) => {
        if (idx === 0) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    fetchProducts();
    showToast('รีเซ็ตตัวกรองแล้ว', 'info');
}

// Toast Notifications System (Minimalist)
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-neutral-900 text-white shadow-lg text-xs transform translate-y-3 opacity-0 transition-all duration-300 font-light`;
    toast.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full ${type === 'success' ? 'bg-emerald-400' : type === 'error' ? 'bg-red-400' : 'bg-white'}"></span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-3', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('translate-y-3', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// Event Listeners Setup
function setupEventListeners() {
    const searchInput = document.getElementById('headerSearchInput');
    let debounceTimer;
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                handleSearch(e.target.value);
            }, 300);
        });
    }

    const trackInput = document.getElementById('trackOrderInput');
    if (trackInput) {
        trackInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                trackOrderModal();
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeProductModal();
            closeCartDrawer();
            closeWishlistDrawer();
            closeCheckoutModal();
            closeOrderSuccessModal();
            closeOrderTrackingModal();
            closeSizeGuideModal();
            closeAdminDashboard();
        }
    });
}
