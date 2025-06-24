"use client";
import { useCart } from "./CartContext";
import styles from "./[storeId]/store.module.css";
import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";

export default function CartSidebar() {
  const { cart, removeFromCart, clearCart, incrementQuantity } = useCart();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const storeId = params.storeId as string;

  // Puedes abrir el sidebar desde cualquier parte llamando setOpen(true)
  // Aquí lo mostramos con un botón fijo abajo a la derecha
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 100,
          background: "#fff",
          border: "1px solid #e0e0e0",
          borderRadius: "50%",
          width: 56,
          height: 56,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          cursor: "pointer",
        }}
        aria-label="Ver carrito"
      >
        <i className="bi bi-cart"></i>
        {cart.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "#ff6f91",
              color: "#fff",
              borderRadius: "50%",
              fontSize: 12,
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {cart.length}
          </span>
        )}
      </button>
      <div
        style={{
          position: "fixed",
          top: 0,
          right: open ? 0 : "-350px",
          width: 350,
          height: "100%",
          background: "#fff",
          boxShadow: "-2px 0 8px rgba(0,0,0,0.08)",
          zIndex: 200,
          transition: "right 0.3s",
          padding: 24,
          display: "flex",
          flexDirection: "column",
        }}
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
          aria-label="Cerrar carrito"
        >
          ×
        </button>
        <h2 style={{ marginTop: 0 }}>Carrito</h2>
        {cart.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, flex: 1, overflowY: "auto" }}>
            {cart.map((item) => (
              <li key={item.id} style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  width={48}
                  height={48}
                  style={{ borderRadius: 8, objectFit: "cover", marginRight: 12 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ fontSize: 14, color: "#888" }}>
                    {item.price ? `Subtotal: $${(item.price * item.quantity).toFixed(2)}` : ""}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 15 }}>Cantidad: {item.quantity}</span>
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#888",
                        fontSize: 18,
                        cursor: "pointer",
                        borderRadius: "50%",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background 0.2s",
                      }}
                      aria-label="Sumar una unidad"
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ff6f91",
                    fontSize: 20,
                    cursor: "pointer",
                    marginLeft: 8,
                  }}
                  aria-label="Quitar del carrito"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </li>
            ))}
          </ul>
        )}
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            style={{
              background: "#ff6f91",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              fontWeight: 600,
              fontSize: 16,
              marginTop: 12,
              cursor: "pointer",
            }}
          >
            Vaciar carrito
          </button>
        )}
        {cart.length > 0 && (
          <button
            onClick={() => {
              setOpen(false);
              router.push(`/checkout?storeId=${storeId}`);
            }}
            style={{
              background: "#4caf50",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              fontWeight: 600,
              fontSize: 16,
              marginTop: 12,
              cursor: "pointer",
            }}
          >
            Confirmar
          </button>
        )}
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

export function CheckoutPage() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");

  // ...usa storeId para buscar la tienda...
}