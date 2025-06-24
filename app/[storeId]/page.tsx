import { db } from "../firebase-config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import StoreProfileClient from "./StoreProfileClient";
import type { Metadata } from "next";

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

export async function generateMetadata({ params }: { params: { storeId: string } }): Promise<Metadata> {
  // Carga los datos de la tienda desde Firestore
  const storeRef = doc(db, "stores", params.storeId);
  const storeSnap = await getDoc(storeRef);
  if (!storeSnap.exists()) {
    return {
      title: "Catálogo Fuddi",
      description: "Catálogo de tiendas en Fuddi",
      openGraph: {
        images: ["/default-logo.png"],
      },
    };
  }
  const store = storeSnap.data() as Store;
  return {
    title: `${store.name} - Catálogo Fuddi`,
    description: store.description,
    openGraph: {
      title: store.name,
      description: store.description,
      images: [store.imageUrl || store.coverUrl || "/default-logo.png"],
      url: `https://fuddishop.vercel.app/${params.storeId}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: store.name,
      description: store.description,
      images: [store.imageUrl || store.coverUrl || "/default-logo.png"],
    },
  };
}

export default async function StoreProfilePage({ params }: { params: { storeId: string } }) {
  // Carga datos de la tienda y productos en el servidor
  const storeRef = doc(db, "stores", params.storeId);
  const storeSnap = await getDoc(storeRef);
  if (!storeSnap.exists()) return <div>Tienda no encontrada</div>;
  const store = { id: storeSnap.id, ...storeSnap.data() };

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
