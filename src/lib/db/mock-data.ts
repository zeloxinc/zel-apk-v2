import {
  Shop,
  Category,
  ProductType,
  ProductVariant,
  StaffProfile,
  Staff,
  SaleReceipt,
  SaleItem,
} from "./types";

const createId = () => Math.random().toString(36).slice(2);

// ==========================================
// 1. SHOPS DATA
// ==========================================
const shopId = createId();

export const shops: Shop[] = [
  {
    shop_id: shopId,
    shop_name: "Zelox Mart CBD",
    shop_business_email: "hello@zeloxmart.co.ke",
    shop_phone_number: "+254712345678",
    shop_location_city: "Nairobi",
    shop_location_country: "Kenya",
    shop_created_at: new Date("2026-01-01T08:00:00Z").toISOString(),
    shop_is_active: true,
  },
];

// ==========================================
// 2. CATEGORIES DATA
// ==========================================
const catBeverages   = createId();
const catElectronics = createId();
const catSnacks      = createId();
const catToiletries  = createId();
const catBakery      = createId();
const catGrains      = createId();
const catHousehold   = createId();
const catBabyCare    = createId();
const catFresh       = createId();
const catDairy       = createId();

export const categories: Category[] = [
  { category_id: catBeverages,   category_shop_id: shopId, category_name: "Beverages" },
  { category_id: catElectronics, category_shop_id: shopId, category_name: "Electronics" },
  { category_id: catSnacks,      category_shop_id: shopId, category_name: "Snacks" },
  { category_id: catToiletries,  category_shop_id: shopId, category_name: "Toiletries" },
  { category_id: catBakery,      category_shop_id: shopId, category_name: "Bakery" },
  { category_id: catGrains,      category_shop_id: shopId, category_name: "Grains & Flour" },
  { category_id: catHousehold,   category_shop_id: shopId, category_name: "Household Cleaning" },
  { category_id: catBabyCare,    category_shop_id: shopId, category_name: "Baby Care" },
  { category_id: catFresh,       category_shop_id: shopId, category_name: "Fresh Produce" },
  { category_id: catDairy,       category_shop_id: shopId, category_name: "Dairy & Eggs" },
];

// ==========================================
// 3. PRODUCT TYPES DATA
// ==========================================
const ptCoke = createId(), ptKeringet = createId(), ptNescafe = createId();
const ptSamsungA15 = createId(), ptAnkerPowerbank = createId(), ptOraimoCable = createId();
const ptTropicalHeatChips = createId(), ptCadburyDairyMilk = createId();
const ptGeishaSoap = createId(), ptColgateToothpaste = createId();
const ptBroadwaysBread = createId(), ptFestiveBread = createId();
const ptAbaaSugar = createId(), ptJogooFlour = createId(), ptDaawatRice = createId();
const ptOmoDetergent = createId(), ptHarpicCleaner = createId();
const ptPampersDiapers = createId(), ptHuggiesWipes = createId();
const ptTomatoes = createId(), ptOnions = createId();
const ptBrooksideMilk = createId(), ptKCCButter = createId();

export const productTypes: ProductType[] = [
  { product_type_id: ptCoke, product_type_shop_id: shopId, product_type_category_id: catBeverages, product_type_name: "Coca Cola Soda", product_type_brand: "Coca Cola", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptKeringet, product_type_shop_id: shopId, product_type_category_id: catBeverages, product_type_name: "Mineral Water", product_type_brand: "Keringet", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptNescafe, product_type_shop_id: shopId, product_type_category_id: catBeverages, product_type_name: "Classic Instant Coffee", product_type_brand: "Nescafe", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptSamsungA15, product_type_shop_id: shopId, product_type_category_id: catElectronics, product_type_name: "Galaxy A15", product_type_brand: "Samsung", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptAnkerPowerbank, product_type_shop_id: shopId, product_type_category_id: catElectronics, product_type_name: "PowerCore 20k", product_type_brand: "Anker", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptOraimoCable, product_type_shop_id: shopId, product_type_category_id: catElectronics, product_type_name: "Fast Charging USB-C Cable", product_type_brand: "Oraimo", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptTropicalHeatChips, product_type_shop_id: shopId, product_type_category_id: catSnacks, product_type_name: "Potato Crisps", product_type_brand: "Tropical Heat", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptCadburyDairyMilk, product_type_shop_id: shopId, product_type_category_id: catSnacks, product_type_name: "Dairy Milk Chocolate", product_type_brand: "Cadbury", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptGeishaSoap, product_type_shop_id: shopId, product_type_category_id: catToiletries, product_type_name: "Bathing Soap", product_type_brand: "Geisha", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptColgateToothpaste, product_type_shop_id: shopId, product_type_category_id: catToiletries, product_type_name: "Maximum Cavity Protection", product_type_brand: "Colgate", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptBroadwaysBread, product_type_shop_id: shopId, product_type_category_id: catBakery, product_type_name: "White Bread", product_type_brand: "Broadways", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptFestiveBread, product_type_shop_id: shopId, product_type_category_id: catBakery, product_type_name: "Brown Premium Bread", product_type_brand: "Festive", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptAbaaSugar, product_type_shop_id: shopId, product_type_category_id: catGrains, product_type_name: "Local Brown Sugar", product_type_brand: "Abaa", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptJogooFlour, product_type_shop_id: shopId, product_type_category_id: catGrains, product_type_name: "Maize Meal Flour", product_type_brand: "Jogoo", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptDaawatRice, product_type_shop_id: shopId, product_type_category_id: catGrains, product_type_name: "Basmati Long Grain Rice", product_type_brand: "Daawat", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptOmoDetergent, product_type_shop_id: shopId, product_type_category_id: catHousehold, product_type_name: "Omo Hand Washing Powder", product_type_brand: "Omo", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptHarpicCleaner, product_type_shop_id: shopId, product_type_category_id: catHousehold, product_type_name: "Harpic Toilet Cleaner", product_type_brand: "Harpic", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptPampersDiapers, product_type_shop_id: shopId, product_type_category_id: catBabyCare, product_type_name: "Pampers Baby Dry", product_type_brand: "Pampers", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptHuggiesWipes, product_type_shop_id: shopId, product_type_category_id: catBabyCare, product_type_name: "Pure Care Baby Wipes", product_type_brand: "Huggies", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptTomatoes, product_type_shop_id: shopId, product_type_category_id: catFresh, product_type_name: "Local Round Tomatoes", product_type_brand: "Fresh Farms", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptOnions, product_type_shop_id: shopId, product_type_category_id: catFresh, product_type_name: "Red Bulb Onions", product_type_brand: "Fresh Farms", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptBrooksideMilk, product_type_shop_id: shopId, product_type_category_id: catDairy, product_type_name: "Fresh Whole Milk", product_type_brand: "Brookside", product_type_created_at: new Date().toISOString() },
  { product_type_id: ptKCCButter, product_type_shop_id: shopId, product_type_category_id: catDairy, product_type_name: "Pure Cream Butter Salted", product_type_brand: "KCC", product_type_created_at: new Date().toISOString() },
];

// ==========================================
// 4. PRODUCT VARIANTS DATA
// ==========================================
export const productVariants: ProductVariant[] = [];

const addVariant = (ptId: string, sku: string, name: string, unit: string, buy: number, sell: number, stock: number, min: number) => {
  const id = createId();
  productVariants.push({
    variant_id: id,
    variant_product_type_id: ptId,
    variant_shop_id: shopId,
    variant_sku: sku,
    variant_name: name,
    variant_unit_measure: unit,
    variant_buying_price: buy,
    variant_selling_price: sell,
    variant_current_stock: stock,
    variant_min_stock_level: min,
    variant_is_active: true
  });
  return id;
};

const vCoke500       = addVariant(ptCoke, "COKE-500ML", "Coca Cola 500ml", "Bottle", 70, 100, 150, 20);
const vKeringet1L     = addVariant(ptKeringet, "KER-1L", "Keringet Water 1L", "Bottle", 60, 90, 200, 25);
const vNescafe100g    = addVariant(ptNescafe, "NES-100G", "Nescafe Classic 100g", "Jar", 380, 490, 24, 5);
const vSamsungA15_128 = addVariant(ptSamsungA15, "SAM-A15-128", "Samsung Galaxy A15 128GB", "Piece", 18000, 24000, 8, 2);
const vAnker20k       = addVariant(ptAnkerPowerbank, "ANK-PC-20K", "Anker PowerCore 20,000mAh", "Piece", 4200, 5500, 15, 3);
const vOraimoC        = addVariant(ptOraimoCable, "ORA-USBC-1M", "Oraimo Type-C Cable 1m", "Piece", 350, 500, 60, 10);
const vChipsSalted150 = addVariant(ptTropicalHeatChips, "TH-SALT-150G", "Tropical Heat Salted 150g", "Packet", 110, 150, 85, 15);
const vCadburyFruit   = addVariant(ptCadburyDairyMilk, "CAD-FN-80G", "Dairy Milk Fruit & Nut 80g", "Bar", 190, 260, 70, 10);
const vGeishaAloe200g  = addVariant(ptGeishaSoap, "GEI-ALOE-200G", "Geisha Aloe Vera 200g", "Bar", 85, 120, 140, 20);
const vColgate120g    = addVariant(ptColgateToothpaste, "COL-MCP-120G", "Colgate Cavity Prot. 120g", "Tube", 175, 230, 90, 12);
const vBroadways400g  = addVariant(ptBroadwaysBread, "BRD-WHT-400G", "Broadways White Bread 400g", "Loaf", 55, 65, 45, 15);
const vFestive400g    = addVariant(ptFestiveBread, "FES-BRN-400G", "Festive Premium Brown 400g", "Loaf", 60, 70, 30, 12);
const vAbaaSugar1k    = addVariant(ptAbaaSugar, "ABAA-SGR-1KG", "Abaa Brown Sugar 1kg", "Packet", 130, 165, 230, 30);
const vJogoo2k        = addVariant(ptJogooFlour, "JOG-MZ-2KG", "Jogoo Maize Meal 2kg", "Packet", 140, 180, 400, 40);
const vDaawat2k       = addVariant(ptDaawatRice, "DW-BAS-2KG", "Daawat Basmati Rice 2kg", "Packet", 390, 520, 85, 12);
const vOmo1k          = addVariant(ptOmoDetergent, "OMO-PWD-1KG", "Omo Hand Wash Powder 1kg", "Packet", 310, 410, 65, 10);
const vHarpic750      = addVariant(ptHarpicCleaner, "HARP-WC-750ML", "Harpic Power Plus 750ml", "Bottle", 340, 450, 50, 8);
const vPampersSize4   = addVariant(ptPampersDiapers, "PAM-DRY-S4", "Pampers Baby Dry Size 4 48pc", "Pack", 1150, 1500, 32, 6);
const vHuggiesWipes64 = addVariant(ptHuggiesWipes, "HUG-WIP-64", "Huggies Pure Care Wipes 64pc", "Pack", 220, 310, 75, 15);
const vTomatoesKg     = addVariant(ptTomatoes, "FRSH-TOM-KG", "Fresh Round Tomatoes", "Kg", 90, 130, 60, 10);
const vOnionsKg       = addVariant(ptOnions, "FRSH-ONN-KG", "Red Bulb Onions Premium", "Kg", 110, 160, 55, 10);
const vBrookside1L    = addVariant(ptBrooksideMilk, "BRK-FRESH-1L", "Brookside Whole Fresh Milk 1L", "Packet", 105, 140, 140, 20);
const vKccButter500   = addVariant(ptKCCButter, "KCC-BTR-500G", "KCC Salted Butter 500g", "Block", 510, 670, 25, 5);

// Quick array references for the engine loop below
const variantsArray = [
  { id: vCoke500, price: 100 }, { id: vKeringet1L, price: 90 }, { id: vNescafe100g, price: 490 },
  { id: vSamsungA15_128, price: 24000 }, { id: vAnker20k, price: 5500 }, { id: vOraimoC, price: 500 },
  { id: vChipsSalted150, price: 150 }, { id: vCadburyFruit, price: 260 }, { id: vGeishaAloe200g, price: 120 },
  { id: vColgate120g, price: 230 }, { id: vBroadways400g, price: 65 }, { id: vFestive400g, price: 70 },
  { id: vAbaaSugar1k, price: 165 }, { id: vJogoo2k, price: 180 }, { id: vDaawat2k, price: 520 },
  { id: vOmo1k, price: 410 }, { id: vHarpic750, price: 450 }, { id: vPampersSize4, price: 1500 },
  { id: vHuggiesWipes64, price: 310 }, { id: vTomatoesKg, price: 130 }, { id: vOnionsKg, price: 160 },
  { id: vBrookside1L, price: 140 }, { id: vKccButter500, price: 670 }
];

// ==========================================
// 5. STAFF DATA
// ==========================================
const profBrian = createId(), profGrace = createId(), profMercy = createId();

export const staffProfiles: StaffProfile[] = [
  { profile_user_id: profBrian, profile_full_name: "Brian Ochieng", profile_phone_number: "+254700000001" },
  { profile_user_id: profGrace, profile_full_name: "Grace Wanjiku", profile_phone_number: "+254700000002" },
  { profile_user_id: profMercy, profile_full_name: "Mercy Chepngetich", profile_phone_number: "+254700000003" },
];

const staffIdBrian = createId(), staffIdGrace = createId(), staffIdMercy = createId();
const staffIds = [staffIdBrian, staffIdGrace, staffIdMercy];

export const staff: Staff[] = [
  { staff_id: staffIdBrian, staff_shop_id: shopId, staff_user_id: profBrian, staff_role_id: 1, staff_is_active: true },
  { staff_id: staffIdGrace, staff_shop_id: shopId, staff_user_id: profGrace, staff_role_id: 2, staff_is_active: true },
  { staff_id: staffIdMercy, staff_shop_id: shopId, staff_user_id: profMercy, staff_role_id: 2, staff_is_active: true },
];

// ==========================================
// 6. TRANSACTION SEED GENERATOR (Exactly 50 Logs, Multi-Day)
// ==========================================
export const saleReceipts: SaleReceipt[] = [];
export const saleItems: SaleItem[] = [];

// Base baseline dates spanning across 5 distinct calendar days
const targetDays = [
  "2026-06-09",
  "2026-06-10",
  "2026-06-11",
  "2026-06-12",
  "2026-06-13"
];

// Seed looping constraint
const TOTAL_EXPECTED_TRANSACTIONS = 50;

for (let i = 0; i < TOTAL_EXPECTED_TRANSACTIONS; i++) {
  const receiptId = `rec-gen-${1000 + i}`;
  
  // Distribute transactions sequentially across the 5 target days
  const activeDay = targetDays[i % targetDays.length];
  
  // Vary hours/minutes logically to look like natural business operations
  const hour = String(8 + (i % 13)).padStart(2, '0'); // Business operational layout: 08:00 to 20:00
  const minute = String((i * 7) % 60).padStart(2, '0');
  const timestampIso = `${activeDay}T${hour}:${minute}:00.000Z`;
  
  // Select rotating variables
  const activeStaffId = staffIds[i % staffIds.length];
  const paymentMethodId = (i % 3) + 1; // Alternates clean values between 1 (Cash), 2 (M-Pesa), and 3 (Card)

  // Determine an adaptive multi-item structure size (1 to 4 unique random line items per customer basket)
  const structuralLineCount = (i % 4) + 1;
  let runningReceiptSum = 0;
  
  // Temporary bucket tracking to prevent item collision errors inside a single receipt
  const chosenIndexSet = new Set<number>();

  for (let j = 0; j < structuralLineCount; j++) {
    // Pick variant line index safely
    let variantIndex = (i + j * 3) % variantsArray.length;
    
    if (chosenIndexSet.has(variantIndex)) {
      variantIndex = (variantIndex + 1) % variantsArray.length;
    }
    chosenIndexSet.add(variantIndex);

    const variantMeta = variantsArray[variantIndex];
    
    // Normalize purchase quantities. High-value tech items get 1, FMCG goods range from 1-5.
    const purchaseQty = (variantMeta.price > 2000) ? 1 : ((j + i) % 4) + 1;
    const itemExtendedTotal = variantMeta.price * purchaseQty;
    
    runningReceiptSum += itemExtendedTotal;

    // Push line calculations out to items array
    saleItems.push({
      sale_item_id: createId(),
      sale_item_receipt_id: receiptId,
      sale_item_variant_id: variantMeta.id,
      sale_item_quantity: purchaseQty,
      sale_item_unit_price: variantMeta.price,
    });
  }

  // Push final aggregate totals to core Receipts array
  saleReceipts.push({
    receipt_id: receiptId,
    receipt_shop_id: shopId,
    receipt_staff_id: activeStaffId,
    receipt_total_amount: runningReceiptSum,
    receipt_payment_method_id: paymentMethodId,
    receipt_created_at: timestampIso,
  });
}