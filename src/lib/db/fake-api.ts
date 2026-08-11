
import {
  productVariants,
  categories,
  saleReceipts,
  saleItems,
} from "./mock-data";

const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export async function getProducts() {
  await wait(400);

  return productVariants;
}

export async function getCategories() {
  await wait(200);

  return categories;
}

export async function getSales() {
  await wait(500);

  return saleReceipts;
}

export async function getSaleItems(receiptId: string) {
  await wait(300);

  return saleItems.filter(
    item => item.sale_item_receipt_id === receiptId
  );
}
