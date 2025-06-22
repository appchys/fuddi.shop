"use client";

import Image from "next/image";
import styles from "./page.module.css";
import React, { useEffect, useState } from "react";
import { db } from "./firebase-config";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [stores, setStores] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Cargar tiendas desde Firestore
  useEffect(() => {
    const fetchStores = async () => {
      const storesCol = collection(db, "stores");
      const storeSnapshot = await getDocs(storesCol);
      const storeList = storeSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStores(storeList);
    };
    fetchStores();
  }, []);

  // Cargar productos desde Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      const productsCol = collection(db, "products");
      const productSnapshot = await getDocs(productsCol);
      const productList = productSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    };
    fetchProducts();
  }, []);

  // Función para scroll suave
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Botón hamburguesa (placeholder)
  const toggleControlPanel = () => {
    alert("Abrir panel de control (implementa la lógica en React)");
  };

  return (
    <div className={styles.page}>
      <header>
        <div id="random-cover" className="random-cover"></div>
        <h1 className="site-title">Fuddi</h1>
        <p className="site-slogan">Para cualquier antojo</p>
        <nav>
          <ul>
            <li>
              <button type="button" onClick={() => scrollToSection("stores")}>
                <i className="bi bi-shop"></i>
                Tiendas
              </button>
            </li>
            <li>
              <button type="button" onClick={() => scrollToSection("products")}>
                <i className="bi bi-box-seam"></i>
                Productos
              </button>
            </li>
            <li>
              <button type="button" onClick={() => (window.location.href = "register.html")}>
                <i className="bi bi-person-plus"></i>
                Registrarse
              </button>
            </li>
          </ul>
        </nav>
      </header>
      <main className={styles.main}>
        <section id="stores" className="stores-section">
          <h2>Tiendas Destacadas</h2>
          <div id="stores-container" className="grid">
            {stores.length === 0 && <p>Cargando tiendas...</p>}
            {stores.map((store) => (
              <div key={store.id} className="store">
                {/* Imagen de portada */}
                {store.coverUrl && (
                  <img
                    src={store.coverUrl}
                    alt={`Portada de ${store.name}`}
                    className="store-cover-img"
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px 8px 0 0",
                    }}
                  />
                )}
                {/* Imagen de perfil */}
                {store.imageUrl && (
                  <img
                    src={store.imageUrl}
                    alt={`Perfil de ${store.name}`}
                    className="store-profile-img"
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginTop: "-30px",
                      border: "3px solid #fff",
                      position: "relative",
                      left: "10px",
                      background: "#fff",
                    }}
                  />
                )}
                <h3>{store.name}</h3>
                <p>{store.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="products" className="products-section">
          <h2>Productos Disponibles</h2>
          <div id="products-container" className="products-row">
            {products.length === 0 && <p>Cargando productos...</p>}
            {products.map((product) => (
              <div key={product.id} className="product-card">
                {/* Si tienes campo de imagen en productos, agrégalo aquí */}
                {product.image && (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-img"
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px 8px 0 0",
                    }}
                  />
                )}
                <h4>{product.name}</h4>
                <p>{product.description}</p>
                <span>{product.price ? `$${product.price}` : ""}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Botón tipo hamburguesa flotante */}
        <button
          id="control-panel-toggle"
          className="hamburger-btn"
          type="button"
          onClick={toggleControlPanel}
        >
          <i className="bi bi-list"></i>
        </button>
      </main>

      {/* Sidebar del control panel */}
      <div id="control-panel-container"></div>

      <footer className={styles.footer}>
        <p>© 2025 Allimarket. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
