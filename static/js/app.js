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
    updateCartCount();
    updateWishlistCount();
    await fetchProducts();
    setupEventListeners();
    setupAdminStatsAutoRefresh();
}

// Default Catalog (Fallback for static hosting / GitHub Pages)
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "แหวนเพชรแท้ Solitaire Eternal Brilliance 18K",
        category: "rings",
        material: "ทองคำขาว 18K",
        gemstone: "เพชรแท้ (GIA)",
        carat: "0.70 กะรัต (Color D / VVS1)",
        price: 35900,
        original_price: 42000,
        stock: 5,
        badge: "ขายดีอันดับ 1",
        rating: 4.9,
        review_count: 48,
        image_url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80"
        ],
        description: "แหวนหมั้นและแหวนแต่งงานเพชรเม็ดเดี่ยว ดีไซน์คลาสสิกเหนือกาลเวลา เพชรแท้น้ำ 100 ความสะอาดระดับ VVS1 เปล่งประกายสูงสุด พร้อมใบเซอร์ GIA สากล ตัวเรือนทองคำขาว 18K ขึ้นรูปประณีต",
        details: [
            "เพชรแท้ธรรมชาติทรงกลม Brilliant Cut 0.70 กะรัต",
            "เกรดสี: D (น้ำ 100) / ความสะอาด: VVS1 / การเจียระไน: Excellent 3EX",
            "ตัวเรือน: ทองคำขาวแท้ 18K (White Gold 750)",
            "พร้อมใบรับรองสากล GIA และใบรับประกันร้านตลอดชีพ"
        ],
        sizes: ["48", "49", "50", "52", "54", "56", "58"],
        can_engrave: 1,
        is_featured: 1
    },
    {
        id: 2,
        name: "สร้อยคอทองคำแท้ จี้เพชรรูปหัวใจ Amour Diamond Pendant",
        category: "necklaces",
        material: "ทองคำแท้ 18K",
        gemstone: "เพชรแท้ (GIA)",
        carat: "0.35 กะรัต",
        price: 18500,
        original_price: 22900,
        stock: 8,
        badge: "ยอดนิยม",
        rating: 5.0,
        review_count: 34,
        image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80"
        ],
        description: "สร้อยคอทองคำ 18K ดีไซน์โซ่เรียบหรู พร้อมจี้หัวใจประดับเพชรแท้ประกายระยิบระยับ สัญลักษณ์แห่งความรักอันบริสุทธิ์",
        details: [
            "ความยาวสร้อย: 42 ซม. ปรับระดับได้ถึง 45 ซม.",
            "เพชรแท้เบลเยี่ยมคัท น้ำหนักรวม 0.35 กะรัต น้ำ 99 (E Color)",
            "ตัวเรือน: ทองแท้ 18K Yellow Gold"
        ],
        sizes: ["42-45 cm (Standard)"],
        can_engrave: 1,
        is_featured: 1
    },
    {
        id: 3,
        name: "ต่างหูไข่มุกเซาท์ซีแท้ Golden South Sea Pearl Drop Earrings",
        category: "earrings",
        material: "ทองคำแท้ 18K",
        gemstone: "ไข่มุกแท้ (South Sea Pearl)",
        carat: "ไข่มุกขนาด 11-12 mm",
        price: 24900,
        original_price: 29500,
        stock: 4,
        badge: "หรูหราพรีเมียม",
        rating: 4.8,
        review_count: 21,
        image_url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=800&auto=format&fit=crop&q=80"
        ],
        description: "ต่างหูไข่มุกทอง South Sea ธรรมชาติ สีทองประกายธรรมชาติ ลัสเตอร์เงางามดุจกระจก ประดับเพชรแท้ด้านบน",
        details: [
            "ไข่มุก South Sea ธรรมชาติ 100% ขนาด 11.5 มม.",
            "ประดับเพชรแท้ทรงกลมรวม 0.20 กะรัต",
            "ตัวเรือนทองแท้ 18K สี Yellow Gold ผิวเงา"
        ],
        sizes: ["One Size"],
        can_engrave: 0,
        is_featured: 1
    },
    {
        id: 4,
        name: "สร้อยข้อมือเพชรรอบวง Classic Tennis Bracelet 18K",
        category: "bracelets",
        material: "ทองคำขาว 18K",
        gemstone: "เพชรแท้ (GIA)",
        carat: "เพชรรวม 3.50 กะรัต (52 เม็ด)",
        price: 68000,
        original_price: 79000,
        stock: 3,
        badge: "Signature",
        rating: 5.0,
        review_count: 19,
        image_url: "https://images.unsplash.com/photo-1611591475102-44122d264585?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1611591475102-44122d264585?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80"
        ],
        description: "สร้อยข้อมือเทนนิสเพชรแท้แถวเดี่ยว สัญลักษณ์ของความหรูหราขั้นสุด เพชรน้ำงามขนาดเท่ากันทุกเม็ด",
        details: [
            "เพชรแท้ธรรมชาติ 52 เม็ด รวม 3.50 กะรัต น้ำ 98-99 (F-E Color)",
            "ตัวเรือนทองคำขาวแท้ 18K (750 White Gold)",
            "ความยาว 16.5 ซม."
        ],
        sizes: ["15.5 cm", "16.5 cm", "17.5 cm"],
        can_engrave: 1,
        is_featured: 1
    },
    {
        id: 5,
        name: "แหวนพลอยไพลินซีลอนแท้ล้อมเพชร Royal Ceylon Sapphire Ring",
        category: "rings",
        material: "ทองคำขาว 18K",
        gemstone: "ไพลินแท้ (Ceylon Sapphire)",
        carat: "ไพลิน 1.80 กะรัต + เพชร 0.45 กะรัต",
        price: 45000,
        original_price: 54000,
        stock: 2,
        badge: "อัญมณีล้ำค่า",
        rating: 4.9,
        review_count: 16,
        image_url: "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&auto=format&fit=crop&q=80"
        ],
        description: "แหวนไพลินสีน้ำเงินรอยัลบลู จากแหล่งซีลอน ล้อมรอบด้วยเพชรแท้เจียระไนแบบเหลี่ยมเกสร สไตล์เจ้าหญิง",
        details: [
            "ไพลินแท้ธรรมชาติ สี Royal Blue หนัก 1.80 กะรัต",
            "เพชรแท้ล้อมวงและบ่าข้าง รวม 0.45 กะรัต น้ำ 99"
        ],
        sizes: ["50", "52", "54", "56"],
        can_engrave: 1,
        is_featured: 1
    },
    {
        id: 6,
        name: "จี้มรกตโคลัมเบียแท้ล้อมเพชร Colombian Emerald Pendant 18K",
        category: "necklaces",
        material: "ทองคำแท้ 18K",
        gemstone: "มรกตแท้ (Emerald)",
        carat: "มรกต 1.25 กะรัต + เพชร 0.30 กะรัต",
        price: 38900,
        original_price: 45000,
        stock: 3,
        badge: "คอลเลกชันใหม่",
        rating: 5.0,
        review_count: 12,
        image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80"
        ],
        description: "จี้มรกตโคลัมเบียสีเขียวเข้มสดใส ทรงหยดน้ำ ล้อมรอบด้วยเพชรแท้เปล่งประกาย ตัวเรือนทองคำแท้ 18K",
        details: [
            "มรกตธรรมชาติแท้แหล่งโคลัมเบีย 1.25 กะรัต ทรง Pear Cut",
            "เพชรแท้ล้อม 2 ชั้น น้ำ 99 รวม 0.30 กะรัต"
        ],
        sizes: ["One Size (พร้อมสายสร้อย 18K 45 cm)"],
        can_engrave: 1,
        is_featured: 0
    },
    {
        id: 7,
        name: "กำไลข้อมือทองคำแท้ 18K ดีไซน์เกลียวเพชร Aurora Spiral Bangle",
        category: "bracelets",
        material: "พิงก์โกลด์ 18K",
        gemstone: "เพชรแท้",
        carat: "0.40 กะรัต",
        price: 39500,
        original_price: 46000,
        stock: 6,
        badge: "ยอดนิยม",
        rating: 4.9,
        review_count: 27,
        image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80"
        ],
        description: "กำไลทองชมพู Rose Gold 18K ดีไซน์รูปทรงคลื่นเกลียวทันสมัย ปลายกำไลฝังเพชรแท้ทรงกลม",
        details: [
            "ทองคำแท้ 18K Rose Gold น้ำหนัก 9.2 กรัม",
            "เพชรแท้คัดเกรด Heart & Arrow รวม 0.40 กะรัต"
        ],
        sizes: ["S (14-15 cm)", "M (15.5-16.5 cm)", "L (17-18 cm)"],
        can_engrave: 1,
        is_featured: 0
    },
    {
        id: 8,
        name: "ต่างหูห่วงเพชรแท้รอบวง Diamond Huggie Hoop Earrings",
        category: "earrings",
        material: "ทองคำขาว 18K",
        gemstone: "เพชรแท้",
        carat: "0.55 กะรัต",
        price: 21900,
        original_price: 26000,
        stock: 9,
        badge: "Must Have",
        rating: 4.8,
        review_count: 42,
        image_url: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=800&auto=format&fit=crop&q=80"
        ],
        description: "ต่างหูห่วงเพชรแท้ดีไซน์ Huggie แนบกระชับใบหู ฝังเพชรทั้งด้านนอกและด้านใน เปล่งประกายรอบทิศทาง",
        details: [
            "เพชรแท้กลม 28 เม็ด รวม 0.55 กะรัต น้ำ 99 E Color",
            "ตัวเรือนทองคำขาว 18K ระบบตัวล็อกคลิกแน่นหนา"
        ],
        sizes: ["One Size (14 mm)"],
        can_engrave: 0,
        is_featured: 0
    },
    {
        id: 9,
        name: "เซ็ตเครื่องประดับเจ้าสาว Rose Gold Bridal Elegance Set",
        category: "bridal",
        material: "พิงก์โกลด์ 18K",
        gemstone: "เพชรแท้",
        carat: "เพชรรวม 2.20 กะรัต",
        price: 89000,
        original_price: 105000,
        stock: 2,
        badge: "ชุดพิเศษงานวิวาห์",
        rating: 5.0,
        review_count: 9,
        image_url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&auto=format&fit=crop&q=80"
        ],
        description: "เซ็ตเจ้าสาวสุดหรูหรา ประกอบด้วยสร้อยคอเพชร ต่างหูระย้า และแหวนคู่เพชรแท้ เข้าชุดในโทนสีพิงก์โกลด์",
        details: [
            "ประกอบด้วย: สร้อยคอ + ต่างหูระย้า + แหวนเพชร",
            "เพชรแท้รวมทั้งเซ็ต 2.20 กะรัต น้ำ 100-99 (D-E Color)"
        ],
        sizes: ["Custom Ring Size"],
        can_engrave: 1,
        is_featured: 1
    },
    {
        id: 10,
        name: "แหวนทับทิมสยามล้อมเพชร Siam Ruby & Diamond Halo Ring",
        category: "rings",
        material: "ทองคำแท้ 18K",
        gemstone: "ทับทิมแท้ (Pigeon's Blood)",
        carat: "ทับทิม 2.05 กะรัต + เพชร 0.50 กะรัต",
        price: 52000,
        original_price: 63000,
        stock: 3,
        badge: "อัญมณีมงคล",
        rating: 4.9,
        review_count: 14,
        image_url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800&auto=format&fit=crop&q=80"
        ],
        description: "แหวนทับทิมแท้สีเลือดนกพิราบ สีแดงสดสะกดสายตา ล้อมรอบด้วยเพชรแท้น้ำ 99 สองชั้น",
        details: [
            "ทับทิมแท้ธรรมชาติรูปไข่ Oval Cut ขนาด 2.05 กะรัต",
            "เพชรแท้ล้อมรอบและก้านแหวน รวม 0.50 กะรัต"
        ],
        sizes: ["50", "52", "54", "56", "58"],
        can_engrave: 1,
        is_featured: 0
    },
    {
        id: 11,
        name: "แหวนเพชรรอบวง Eternity Diamond Band 18K",
        category: "rings",
        material: "ทองคำแท้ 18K",
        gemstone: "เพชรแท้",
        carat: "0.85 กะรัต",
        price: 27500,
        original_price: 32000,
        stock: 7,
        badge: "ยอดนิยม",
        rating: 4.9,
        review_count: 31,
        image_url: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80"
        ],
        description: "แหวนเพชรรอบวงแบบ Full Eternity สัญลักษณ์แห่งความรักที่ไม่มีวันสิ้นสุด ฝังเพชรแท้เรียงชิดติดกันรอบวง",
        details: [
            "เพชรแท้ธรรมชาติฝังรอบวง รวม 0.85 กะรัต น้ำ 99 E Color",
            "ตัวเรือนทองคำแท้ 18K Yellow Gold"
        ],
        sizes: ["48", "50", "52", "54", "56"],
        can_engrave: 1,
        is_featured: 1
    },
    {
        id: 12,
        name: "สร้อยคอเงินแท้ 925 ชุบทองคำขาว จี้คริสตัลหยดน้ำ Grace Pendant",
        category: "necklaces",
        material: "เงินแท้ 925",
        gemstone: "คริสตัลสวิสเกรด 5A",
        carat: "เทียบเท่า 1.0 กะรัต",
        price: 2890,
        original_price: 3800,
        stock: 20,
        badge: "ราคาเข้าถึงง่าย",
        rating: 4.7,
        review_count: 55,
        image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
        gallery: [
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80"
        ],
        description: "สร้อยคอเงินแท้ 925 สเตอร์ลิง ชุบทองคำขาวหนาพิเศษ จี้ทรงหยดน้ำคริสตัลเกรด 5A สะท้อนแสงวิบวับ",
        details: [
            "เงินแท้ 925 ชุบ White Gold ไม่ลอกไม่ดำง่าย",
            "คริสตัลสวิสเกรด 5A ทรง Teardrop"
        ],
        sizes: ["40-45 cm"],
        can_engrave: 0,
        is_featured: 0
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

// Show Order Success Modal & Receipt
function showOrderSuccessModal(orderData, customerData) {
    const modal = document.getElementById('orderSuccessModal');
    if (!modal) return;

    document.getElementById('successOrderNumber').innerText = orderData.order_number;
    document.getElementById('successTrackingNumber').innerText = orderData.tracking_number;
    document.getElementById('successTotalAmount').innerText = `฿${orderData.total.toLocaleString()}`;
    document.getElementById('successCustName').innerText = customerData.customer_name;
    document.getElementById('successCustAddress').innerText = `${customerData.shipping_address}, ${customerData.province} ${customerData.postal_code}`;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeOrderSuccessModal() {
    const modal = document.getElementById('orderSuccessModal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}

// Order Tracking Function (Minimalist)
async function trackOrderModal(orderRef) {
    const ref = orderRef || document.getElementById('trackOrderInput')?.value.trim();
    if (!ref) {
        showToast('กรุณากรอกหมายเลขคำสั่งซื้อ หรือเบอร์โทรศัพท์', 'warning');
        return;
    }

    let o = null;
    try {
        const res = await fetch(`/api/orders/${encodeURIComponent(ref)}`);
        if (res.ok) {
            const data = await res.json();
            if (data.success) o = data.order;
        }
    } catch (err) {}

    if (!o) {
        const savedOrders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
        o = savedOrders.find(item => item.order_number === ref || item.customer_phone === ref || item.tracking_number === ref);
    }

    if (!o) {
        showToast('ไม่พบข้อมูลคำสั่งซื้อ กรุณาตรวจสอบรหัสหรือเบอร์โทร', 'error');
        return;
    }
        const resultContainer = document.getElementById('trackingResultContainer');
        if (!resultContainer) return;

        let activeStep = 1;
        if (o.order_status === 'preparing') activeStep = 2;
        if (o.order_status === 'quality_check') activeStep = 3;
        if (o.order_status === 'shipped') activeStep = 4;
        if (o.order_status === 'delivered') activeStep = 5;

        resultContainer.innerHTML = `
            <div class="mt-6 p-5 rounded-xl bg-neutral-50 border border-neutral-200">
                <div class="flex justify-between items-start mb-4 border-b border-neutral-200 pb-3">
                    <div>
                        <span class="text-[11px] text-neutral-400 font-medium uppercase tracking-widest">หมายเลขคำสั่งซื้อ</span>
                        <h4 class="text-base font-semibold text-neutral-900">${o.order_number}</h4>
                        <p class="text-xs text-neutral-500">เลขพัสดุ: <span class="text-neutral-800 font-mono font-medium">${o.tracking_number}</span></p>
                    </div>
                    <div class="text-right">
                        <span class="text-xs text-neutral-500">ยอดชำระ</span>
                        <p class="text-base font-semibold text-neutral-900 font-serif-luxury">฿${o.total.toLocaleString()}</p>
                        <span class="text-[10px] px-2 py-0.5 rounded ${o.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-800'}">
                            ${o.payment_status === 'paid' ? 'ชำระเงินเรียบร้อย' : 'รอชำระเงิน'}
                        </span>
                    </div>
                </div>

                <!-- 5-Step Timeline Minimal -->
                <div class="py-4">
                    <div class="relative flex justify-between">
                        <div class="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 -translate-y-1/2 z-0"></div>
                        <div class="absolute top-1/2 left-0 h-0.5 bg-neutral-900 -translate-y-1/2 z-0 transition-all duration-500" style="width: ${((activeStep - 1) / 4) * 100}%"></div>
                        
                        ${[
                            { step: 1, title: 'รับคำสั่งซื้อ' },
                            { step: 2, title: 'เตรียมสินค้า' },
                            { step: 3, title: 'ตรวจ GIA' },
                            { step: 4, title: 'จัดส่งพัสดุ' },
                            { step: 5, title: 'จัดส่งสำเร็จ' }
                        ].map(st => `
                            <div class="relative z-10 flex flex-col items-center">
                                <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${st.step <= activeStep ? 'bg-neutral-900 text-white font-bold' : 'bg-neutral-200 text-neutral-400'}">
                                    ${st.step}
                                </div>
                                <span class="text-[10px] mt-1.5 ${st.step <= activeStep ? 'text-neutral-900 font-medium' : 'text-neutral-400'}">${st.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Items -->
                <div class="mt-4 pt-3 border-t border-neutral-200">
                    <h5 class="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-2">รายการสินค้า</h5>
                    <div class="space-y-2">
                        ${o.items.map(item => `
                            <div class="flex items-center gap-3 text-xs text-neutral-700">
                                <img src="${item.image_url}" class="w-9 h-9 rounded object-cover bg-neutral-100">
                                <div class="flex-1">
                                    <p class="font-medium text-neutral-900">${item.name}</p>
                                    <p class="text-[11px] text-neutral-400">จำนวน: ${item.qty} ${item.size ? `| ไซส์: ${item.size}` : ''} ${item.engraving ? `| สลัก: "${item.engraving}"` : ''}</p>
                                </div>
                                <span class="text-neutral-900 font-medium">฿${(item.price * item.qty).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        const modal = document.getElementById('orderTrackingModal');
        if (modal) modal.classList.remove('hidden');
    } catch (err) {
        showToast('เกิดข้อผิดพลาดในการค้นหาคำสั่งซื้อ', 'error');
    }
}

function openOrderTrackingModal() {
    const modal = document.getElementById('orderTrackingModal');
    if (modal) modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
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

// Admin Dashboard Functions (Minimalist)
async function openAdminDashboard() {
    const modal = document.getElementById('adminDashboardModal');
    if (modal) modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    await loadAdminStats();
    await loadAdminOrders();
}

function closeAdminDashboard() {
    const modal = document.getElementById('adminDashboardModal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
}

async function loadAdminStats() {
    try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                document.getElementById('adminStatRevenue').innerText = `฿${data.total_revenue.toLocaleString()}`;
                document.getElementById('adminStatOrders').innerText = data.total_orders;
                document.getElementById('adminStatProducts').innerText = data.total_products;
                document.getElementById('adminStatLowStock').innerText = data.low_stock_products;
                return;
            }
        }
    } catch (err) {}

    const savedOrders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
    const totalRev = savedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    document.getElementById('adminStatRevenue').innerText = `฿${totalRev.toLocaleString()}`;
    document.getElementById('adminStatOrders').innerText = savedOrders.length;
    document.getElementById('adminStatProducts').innerText = (state.products || DEFAULT_PRODUCTS).length;
    document.getElementById('adminStatLowStock').innerText = (state.products || DEFAULT_PRODUCTS).filter(p => p.stock <= 3).length;
}

async function loadAdminOrders() {
    let orders = [];
    try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
            const data = await res.json();
            if (data.success) orders = data.orders;
        }
    } catch (err) {}

    if (orders.length === 0) {
        orders = JSON.parse(localStorage.getItem('forme_orders') || '[]');
    }

    const tbody = document.getElementById('adminOrdersTableBody');
    if (!tbody) return;

    if (!orders || orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-neutral-400 text-xs">ยังไม่มีคำสั่งซื้อในระบบ</td></tr>`;
        return;
    }

    tbody.innerHTML = orders.map(o => `
            <tr class="border-b border-neutral-100 hover:bg-neutral-50 text-xs text-neutral-800">
                <td class="py-3 px-3 font-mono font-medium text-neutral-900">${o.order_number}</td>
                <td class="py-3 px-3">
                    <p class="font-medium text-neutral-900">${o.customer_name}</p>
                    <p class="text-[11px] text-neutral-400">${o.customer_phone}</p>
                </td>
                <td class="py-3 px-3">
                    <span>${o.items.length} ชิ้น</span>
                    ${o.gift_wrap ? '<span class="ml-1 text-[10px] text-neutral-500">(ของขวัญ)</span>' : ''}
                </td>
                <td class="py-3 px-3 font-medium text-neutral-900">฿${o.total.toLocaleString()}</td>
                <td class="py-3 px-3">
                    <select onchange="updateOrderStatus(${o.id}, this.value)" class="bg-white border border-neutral-200 rounded px-2 py-1 text-xs text-neutral-800">
                        <option value="processing" ${o.order_status === 'processing' ? 'selected' : ''}>รอดำเนินการ</option>
                        <option value="preparing" ${o.order_status === 'preparing' ? 'selected' : ''}>เตรียมสินค้า</option>
                        <option value="quality_check" ${o.order_status === 'quality_check' ? 'selected' : ''}>ตรวจ GIA</option>
                        <option value="shipped" ${o.order_status === 'shipped' ? 'selected' : ''}>กำลังจัดส่ง</option>
                        <option value="delivered" ${o.order_status === 'delivered' ? 'selected' : ''}>จัดส่งสำเร็จ</option>
                    </select>
                </td>
                <td class="py-3 px-3 text-center">
                    <button onclick="trackOrderModal('${o.order_number}')" class="text-neutral-900 hover:underline text-xs">
                        ดูรายละเอียด
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error loading admin orders:', err);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const res = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            showToast('อัปเดตสถานะสำเร็จ', 'success');
            loadAdminStats();
        }
    } catch (err) {
        showToast('ไม่สามารถอัปเดตสถานะได้', 'error');
    }
}

// Add New Product in Admin
async function submitNewProductForm(event) {
    if (event) event.preventDefault();

    const name = document.getElementById('newProdName')?.value.trim();
    const category = document.getElementById('newProdCategory')?.value;
    const material = document.getElementById('newProdMaterial')?.value.trim();
    const gemstone = document.getElementById('newProdGemstone')?.value.trim();
    const carat = document.getElementById('newProdCarat')?.value.trim();
    const price = parseFloat(document.getElementById('newProdPrice')?.value || 0);
    const originalPrice = parseFloat(document.getElementById('newProdOrigPrice')?.value || 0);
    const stock = parseInt(document.getElementById('newProdStock')?.value || 5);
    const badge = document.getElementById('newProdBadge')?.value.trim();
    const imageUrl = document.getElementById('newProdImage')?.value.trim();
    const description = document.getElementById('newProdDesc')?.value.trim();
    const sizesStr = document.getElementById('newProdSizes')?.value.trim();

    if (!name || !price || !imageUrl) {
        showToast('กรุณากรอกชื่อสินค้า ราคา และ URL รูปภาพ', 'warning');
        return;
    }

    const sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()) : ["48", "50", "52", "54"];

    const payload = {
        name,
        category,
        material: material || 'ทองคำขาว 18K',
        gemstone: gemstone || 'เพชรแท้',
        carat: carat || '0.50 กะรัต',
        price,
        original_price: originalPrice || price,
        stock,
        badge,
        image_url: imageUrl,
        gallery: [imageUrl],
        description: description || 'เครื่องประดับเพชรแท้ล้ำค่า คุณภาพมาตรฐานสากล',
        details: ["เพชรแท้ธรรมชาติ", "ตัวเรือนทองแท้ 18K", "รับประกันตลอดอายุการใช้งาน"],
        sizes,
        can_engrave: 1,
        is_featured: 1
    };

    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
            showToast('เพิ่มสินค้าใหม่เรียบร้อยแล้ว', 'success');
            document.getElementById('newProductForm')?.reset();
            await fetchProducts();
            await loadAdminStats();
        }
    } catch (err) {
        showToast('ไม่สามารถเพิ่มสินค้าได้', 'error');
    }
}

function setupAdminStatsAutoRefresh() {
    setInterval(() => {
        const modal = document.getElementById('adminDashboardModal');
        if (modal && !modal.classList.contains('hidden')) {
            loadAdminStats();
        }
    }, 15000);
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
