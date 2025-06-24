"use client";
import { useEffect, useState } from "react";
import { auth, googleProvider, db } from "./firebase-config";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import styles from "./control-panel.module.css";

export default function ControlPanel() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);

  // Login con Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error: any) {
      alert("Error al iniciar sesión: " + error.message);
    }
  };

  // Logout
  const logout = async () => {
    await auth.signOut();
    setUser(null);
    setClientData(null);
    setStoreData(null);
  };

  // Cargar info de usuario y tienda
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Cliente
        const userDoc = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          setClientData(userSnapshot.data());
        } else {
          setClientData(null);
        }

        // Tienda
        const storeQuery = query(collection(db, "stores"), where("owner", "==", user.uid));
        const storeSnapshot = await getDocs(storeQuery);
        if (!storeSnapshot.empty) {
          setStoreData({ ...storeSnapshot.docs[0].data(), id: storeSnapshot.docs[0].id });
        } else {
          setStoreData(null);
        }
      } else {
        setClientData(null);
        setStoreData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Ocultar panel al hacer clic fuera
  useEffect(() => {
    if (!open) return;
    const handleClick = (event: MouseEvent) => {
      const panel = document.getElementById("controlPanel");
      if (panel && !panel.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        className={styles.panelFloatingBtn}
        aria-label="Abrir panel de control"
      >
        <i className="bi bi-gear"></i>
      </button>

      {/* Sidebar del panel */}
      <div
        id="controlPanel"
        className={`${styles.panelSidebar} ${open ? styles.panelSidebarOpen : styles.panelSidebarClosed}`}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            fontSize: 28,
            cursor: "pointer",
            color: "#888",
          }}
          aria-label="Cerrar panel"
        >
          ×
        </button>
        <h2 style={{ marginTop: 0 }}>Panel de Control</h2>
        <div id="userInfo" className={styles.userInfo}>
          {user ? (
            <>
              {/* Tienda */}
              {storeData ? (
                <div className={styles.storeInfo}>
                  <h3>Tienda</h3>
                  <div className={styles.profileHeader}>
                    {storeData.imageUrl ? (
                      <img src={storeData.imageUrl} alt="Foto de tienda" />
                    ) : (
                      <div className={styles.defaultAvatar}></div>
                    )}
                    <span className={styles.name}>{storeData.name || "Sin nombre"}</span>
                  </div>
                  <ul className={styles.sectionLinks}>
                    <li>
                      <a href="/store-orders">Pedidos recibidos</a>
                    </li>
                    <li>
                      <a href={`/store-products?storeId=${storeData.id}`}>Mis productos</a>
                    </li>
                    <li>
                      <a href={`/store-edit?storeId=${storeData.id}`}>Editar tienda</a>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className={styles.storeInfo}>
                  <h3>Tienda</h3>
                  <button className={styles.createBtn} onClick={() => (window.location.href = "/register")}>
                    Crear Tienda
                  </button>
                </div>
              )}

              {/* Cliente */}
              {clientData ? (
                <div className={styles.clientInfo}>
                  <h3>Perfil</h3>
                  <div className={styles.profileHeader}>
                    {clientData.profilePic ? (
                      <img src={clientData.profilePic} alt="Foto de perfil" />
                    ) : (
                      <div className={styles.defaultAvatar}></div>
                    )}
                    <span className={styles.name}>{clientData.name || "Sin nombre"}</span>
                  </div>
                  <ul className={styles.sectionLinks}>
                    <li>
                      <a href="/my-orders">Mis pedidos</a>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className={styles.clientInfo}>
                  <h3>Perfil</h3>
                  <button className={styles.createBtn} onClick={() => (window.location.href = "/register")}>
                    Crear Perfil
                  </button>
                </div>
              )}

              <button
                className={styles.logoutBtn}
                onClick={logout}
                title="Cerrar sesión"
              >
                <i className="bi bi-power"></i> Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button
                className={styles.googleLoginBtn}
                onClick={loginWithGoogle}
              >
                <i className="bi bi-google" style={{ marginRight: 8 }}></i>
                Iniciar sesión con Google
              </button>
              <p>No has iniciado sesión</p>
            </>
          )}
        </div>
      </div>
      {/* Fondo oscuro al abrir */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.15)",
            zIndex: 150,
          }}
        />
      )}
    </>
  );
}