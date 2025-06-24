import { db } from "../firebase-config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import StoreProfileClient from "./StoreProfileClient";

interface Store {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  imageUrl?: string;
  phone?: string;
  owner?: string;
  collectionsOrder?: string[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  imageUrl?: string;
  collection?: string[] | string;
  order?: number;
  hidden?: boolean;
}

// Esta es la firma correcta para Next.js App Router
export default async function Page({
  params,
}: {
  params: { storeId: string };
}) {
  // Carga datos de la tienda y productos aquí
  const storeRef = doc(db, "stores", params.storeId);
  const storeSnap = await getDoc(storeRef);
  if (!storeSnap.exists()) return <div>Tienda no encontrada</div>;
  const store = { id: storeSnap.id, ...storeSnap.data() } as Store;

  // Carga productos
  const productsCol = collection(db, `stores/${params.storeId}/products`);
  const productsSnap = await getDocs(productsCol);
  const products: Product[] = [];
  productsSnap.forEach((doc) => {
    const data = doc.data() as Product;
    if (!data.hidden) {
      products.push({ ...data, id: doc.id });
    }
  });

  return <StoreProfileClient store={store} products={products} />;
}
