import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
  costPrice: number;
  sellingPrice: number;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  totalAmount: number;
  profit: number;
  saleDate: string;
  createdAt: string;
}

const PRODUCTS_COL = "products";
const SALES_COL = "sales";

// --- PRODUCTS FUNCTIONS ---
export async function getProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(collection(db, PRODUCTS_COL));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export async function addProduct(product: Omit<Product, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, PRODUCTS_COL), {
    ...product,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return docRef.id;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const docRef = doc(db, PRODUCTS_COL, id);
  await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COL, id));
}

// --- SALES FUNCTIONS ---
export async function getSales(): Promise<Sale[]> {
  const q = query(collection(db, SALES_COL), orderBy("saleDate", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
}

export async function addSale(sale: Omit<Sale, "id">): Promise<string> {
  // 1. Sale record add karein
  const docRef = await addDoc(collection(db, SALES_COL), {
    ...sale,
    createdAt: new Date().toISOString()
  });

  // 2. Stock update karein
  const products = await getProducts();
  const product = products.find(p => p.id === sale.productId);
  if (product) {
    await updateProduct(sale.productId, { 
      stockQuantity: product.stockQuantity - sale.quantity 
    });
  }
  return docRef.id;
}

export async function deleteSale(id: string): Promise<void> {
  await deleteDoc(doc(db, SALES_COL, id));
}

// Seed function ko empty kar dein taaki har baar dummy data na aaye
export async function seedDemoData() {
  console.log("Using Firestore Cloud Database");
}