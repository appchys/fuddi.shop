"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../firebase-config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Image from "next/image";

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

export default function StoreProfile() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [store, setStore] = useState<Store | null>(null);
  const [productsByCollection, setProductsByCollection] = useState<Record<string, Product[]>>({});
  const [collectionsOrder, setCollectionsOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreAndProducts = async () => {
      setLoading(true);
      // 1. Cargar datos de la tienda
      const storeRef = doc(db, "stores", storeId);
      const storeSnap = await getDoc(storeRef);
      if (!storeSnap.exists()) {
        setStore(null);
        setLoading(false);
        return;
      }
      const storeData = { id: storeSnap.id, ...storeSnap.data() } as Store;
      setStore(storeData);

      // 2. Cargar productos
      const productsCol = collection(db, `stores/${storeId}/products`);
      const productsSnap = await getDocs(productsCol);
      const products: Product[] = [];
      productsSnap.forEach((doc) => {
        const data = doc.data() as Product;
        if (!data.hidden) {
          products.push({ ...data, id: doc.id });
        }
      });

      // 3. Agrupar productos por colección
      const grouped: Record<string, Product[]> = {};
      products.forEach((product) => {
        let cols: string[] = [];
        if (Array.isArray(product.collection)) cols = product.collection;
        else if (typeof product.collection === "string") cols = [product.collection];
        else cols = ["Sin colección"];
        cols.forEach((col) => {
          if (!grouped[col]) grouped[col] = [];
          grouped[col].push(product);
        });
      });

      // 4. Ordenar colecciones
      let order: string[] = storeData.collectionsOrder || [];
      const allCollectionNames = Object.keys(grouped);
      order = order.filter((col) => allCollectionNames.includes(col));
      allCollectionNames.forEach((col) => {
        if (!order.includes(col)) order.push(col);
      });
      setCollectionsOrder(order);
      setProductsByCollection(grouped);
      setLoading(false);
    };

    fetchStoreAndProducts();
  }, [storeId]);

  if (loading) return <p>Cargando tienda...</p>;
  if (!store) return <p>Tienda no encontrada.</p>;

  return (
    <div>
      {/* Portada */}
      <div
        className="store-cover"
        style={{
          width: "100%",
          height: "200px",
          background: "#e0e0e0",
          backgroundImage: store.coverUrl ? `url(${store.coverUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>

      {/* Perfil, nombre, descripción */}
      <div className="store-header-content" style={{ textAlign: "center", marginTop: "-60px" }}>
        {store.imageUrl && (
          <Image
            src={store.imageUrl}
            alt={`Foto de perfil de ${store.name}`}
            width={120}
            height={120}
            className="store-profile"
            style={{
              borderRadius: "50%",
              border: "4px solid #fff",
              background: "#e0e0e0",
              margin: "0 auto",
              display: "block",
              position: "relative",
            }}
          />
        )}
        <h1 id="store-name">{store.name}</h1>
        <p id="store-description">{store.description}</p>
      </div>

      {/* Acciones (solo estructura visual, lógica de autenticación pendiente) */}
      <div className="store-actions" style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "10px 0" }}>
        <button className="btn"><i className="bi bi-person-plus"></i> Seguir</button>
        {store.phone && (
          <a
            className="btn"
            href={`https://wa.me/${store.phone.replace(/\D/g, "").replace(/^0/, "593")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-whatsapp"></i> Whatsapp
          </a>
        )}
        <button className="btn"><i className="bi bi-cart"></i> Carrito</button>
      </div>

      {/* Productos agrupados por colección */}
      <main style={{ padding: 20 }}>
        {collectionsOrder.map((col) => (
          <div key={col} className="collection-container">
            <h2 className="collection-title">{col}</h2>
            {productsByCollection[col].map((product) => (
              <div key={product.id} className="product" style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 18px" }}>
                <div className="product-image-container" style={{ width: 90, height: 90, borderRadius: 8, overflow: "hidden", background: "#f5f5f5" }}>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={90}
                      height={90}
                      className="product-image"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="placeholder-image" style={{ width: "100%", height: "100%", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "#666" }}>
                      <span>{product.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="product-info" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <p className="product-price">${product.price ? product.price.toFixed(2) : "0.00"}</p>
                </div>
                {/* Aquí puedes agregar botones de acción para el producto */}
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}