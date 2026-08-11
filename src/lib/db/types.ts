export interface Shop {
  shop_id: string;
  shop_name: string;
  shop_business_email?: string;
  shop_phone_number?: string;
  shop_location_city?: string;
  shop_location_country?: string;
  shop_logo_url?: string;
  shop_created_at: string;
  shop_is_active: boolean;
}

export interface Category {
  category_id: string;
  category_shop_id: string;
  category_name: string;
  category_description?: string;
}

export interface ProductType {
  product_type_id: string;
  product_type_shop_id: string;
  product_type_category_id: string;
  product_type_name: string;
  product_type_brand?: string;
  product_type_image_url?: string;
  product_type_created_at: string;
}

export interface ProductVariant {
  variant_id: string;
  variant_product_type_id: string;
  variant_shop_id: string;
  variant_sku: string;
  variant_name: string;
  variant_unit_measure: string;
  variant_buying_price: number;
  variant_selling_price: number;
  variant_current_stock: number;
  variant_min_stock_level: number;
  variant_is_active: boolean;
}

export interface StaffProfile {
  profile_user_id: string;
  profile_full_name: string;
  profile_phone_number?: string;
}

export interface Staff {
  staff_id: string;
  staff_shop_id: string;
  staff_user_id: string;
  staff_role_id: number;
  staff_is_active: boolean;
}

export interface SaleReceipt {
  receipt_id: string;
  receipt_shop_id: string;
  receipt_staff_id: string;
  receipt_total_amount: number;
  receipt_payment_method_id: number;
  receipt_created_at: string;
}

export interface SaleItem {
  sale_item_id: string;
  sale_item_receipt_id: string;
  sale_item_variant_id: string;
  sale_item_quantity: number;
  sale_item_unit_price: number;
}
