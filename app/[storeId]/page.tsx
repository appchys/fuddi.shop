"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "../firebase-config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import Image from "next/image";
import styles from "./store.module.css";
import { useCart } from "../CartContext";
import Head from "next/head";
import Link from "next/link";

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
  const { addToCart } = useCart();

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
      <Head>
        <title>{store ? `${store.name} - Catálogo Fuddi` : "Catálogo Fuddi"}</title>
        <meta property="og:title" content={store.name} />
        <meta property="og:description" content={store.description} />
        <meta property="og:image" content={store.imageUrl || store.coverUrl || "/default-logo.png"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://fuddishop.vercel.app/${store.id}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={store.name} />
        <meta name="twitter:description" content={store.description} />
        <meta name="twitter:image" content={store.imageUrl || store.coverUrl || "/default-logo.png"} />
      </Head>

      {/* Portada */}
      <div
        className={styles.storeCover}
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

      {/* Acciones */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", margin: "10px 0" }}>
        <button className="icon-btn">
          <i className="bi bi-person-plus"></i>
          Seguir
        </button>
        {store.phone && (
          <a
            className="icon-btn"
            href={`https://wa.me/${store.phone.replace(/\D/g, "").replace(/^0/, "593")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-whatsapp"></i>
            Whatsapp
          </a>
        )}
        <button className="icon-btn">
          <i className="bi bi-cart"></i>
          Carrito
        </button>
        <Link href="/store-orders" className="icon-btn">
          <i className="bi bi-receipt"></i>
          Pedidos recibidos
        </Link>
      </div>

      {/* Productos agrupados por colección */}
      <main style={{ padding: 20 }}>
        {collectionsOrder.map((col) => (
          <div key={col} className="collection-container">
            <h2 className={styles.collectionTitle}>{col}</h2>
            {productsByCollection[col].map((product) => (
              <div key={product.id} className={styles.product}>
                <div className={styles.productImageContainer}>
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={90}
                      height={90}
                      className={styles.productImage}
                    />
                  ) : store.imageUrl ? (
                    <Image
                      src={store.imageUrl}
                      alt={store.name}
                      width={90}
                      height={90}
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={styles.placeholderImage}>
                      <span>{product.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productDescription}>{product.description}</p>
                  <p className={styles.productPrice}>${product.price ? product.price.toFixed(2) : "0.00"}</p>
                </div>
                <div className={styles.addToCartContainer}>
                  <button
                    className={styles.addToCartBtn}
                    title="Agregar al carrito"
                    onClick={() =>
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        imageUrl: product.imageUrl || store.imageUrl,
                        quantity: 1,
                      })
                    }
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </main>
    </div>
  );
}
