"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { auth, googleProvider, db, storage } from "../firebase-config";
import { signInWithPopup, User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "./checkout.module.css";

// --- INTERFACES ---
interface Address {
  reference: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
}

interface UserData {
  name: string;
  phone: string;
  email: string;
  addresses?: Address[];
  [key: string]: unknown;
}

interface StoreData {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  coverUrl?: string;
  shippingFee?: number;
  [key: string]: unknown;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

// --- COMPONENT ---
export default function Checkout() {
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");

  // Estados principales tipados
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<string>("delivery");
  const [loading, setLoading] = useState(true);

  // Login con Google
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
    } catch (error) {
      if (error instanceof Error) {
        alert("Error al iniciar sesión: " + error.message);
      }
    }
  };

  // Verifica si el usuario existe en Firestore
  const checkUserExists = async (userId: string) => {
    const userDocRef = doc(db, "users", userId);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) return { exists: true, type: "client", data: userSnap.data() as UserData };
    return { exists: false };
  };

  // Cargar datos iniciales
  useEffect(() => {
    setLoading(true);
    const unsub = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Cargar perfil de usuario
        const userCheck = await checkUserExists(user.uid);
        if (userCheck.exists && userCheck.data) {
          setUserData(userCheck.data);
          setAddresses(
            Array.isArray(userCheck.data.addresses)
              ? userCheck.data.addresses
              : []
          );
        }
      }
      setLoading(false);
    });
    // Cargar datos de tienda
    if (storeId) {
      const fetchStore = async () => {
        const storeDocRef = doc(db, "stores", storeId);
        const storeSnap = await getDoc(storeDocRef);
        if (storeSnap.exists()) setStoreData(storeSnap.data() as StoreData);
      };
      fetchStore();
      // Cargar carrito desde localStorage
      const cartKey = `cart_${storeId}`;
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          if (Array.isArray(parsed)) setCart(parsed as CartItem[]);
          else setCart([]);
        } catch {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
    return () => unsub();
  }, [storeId]);

  // Guardar perfil de usuario
  const saveUserProfile = async (name: string, phone: string) => {
    if (!user) return;
    const newUserData: UserData = { name, phone, createdAt: new Date().toISOString(), email: user.email || "" };
    await setDoc(doc(db, "users", user.uid), newUserData, { merge: true });
    setUserData(newUserData);
  };

  // Guardar dirección
  const saveAddress = async (address: Address) => {
    if (!user) return;
    const newAddresses = [...addresses, address];
    await setDoc(doc(db, "users", user.uid), { addresses: newAddresses }, { merge: true });
    setAddresses(newAddresses);
    setSelectedAddress(address);
  };

  // Confirmar pedido
  const confirmOrder = async () => {
    if (!user || !userData) return alert("Debes iniciar sesión y tener perfil.");
    if (deliveryType === "delivery" && !selectedAddress) return alert("Selecciona una dirección.");
    if (!paymentMethod) return alert("Selecciona un método de pago.");
    let paymentProofUrl: string | null = null;
    if (paymentMethod === "Transferencia" && paymentProof) {
      const storagePath = `payment-proofs/${user.uid}/${Date.now()}_${paymentProof.name}`;
      const storageRef = ref(storage, storagePath);
      const uploadResult = await uploadBytes(storageRef, paymentProof);
      paymentProofUrl = await getDownloadURL(uploadResult.ref);
    }
    // Calcula totales
    const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    const shipping = storeData?.shippingFee || 0;
    const serviceFee = 0.25;
    const total = subtotal + shipping + serviceFee;
    // Guarda la orden
    const orderData = {
      storeId,
      userId: user.uid,
      products: cart,
      total,
      shippingAddress: deliveryType === "delivery" ? selectedAddress : null,
      paymentMethod,
      paymentProofUrl,
      status: "Pendiente",
      createdAt: new Date().toISOString(),
      deliveryType,
      scheduledDate,
      scheduledTime,
      customerName: userData.name,
      customerPhone: userData.phone,
    };
    await addDoc(collection(db, "orders"), orderData);
    alert("¡Pedido confirmado!");
    // Limpia el carrito
    localStorage.removeItem(`cart_${storeId}`);
    setCart([]);
  };

  if (loading) return <div>Cargando...</div>;
  if (!storeData) return <div>Tienda no encontrada</div>;

  return (
    <div className={styles.checkoutContainer}>
      <h2 className={styles.checkoutTitle}>
        <i className="bi bi-bag-check"></i> Checkout de {storeData.name}
      </h2>

      {/* Login */}
      {!user && (
        <button onClick={loginWithGoogle} style={{ marginBottom: 20 }}>
          Iniciar sesión con Google
        </button>
      )}

      {/* Perfil */}
      {user && !userData && (
        <div>
          <h3>Completa tu perfil</h3>
          <ProfileForm onSave={saveUserProfile} />
        </div>
      )}

      {/* Selección de dirección */}
      {user && userData && (
        <div>
          <h3>Dirección de entrega</h3>
          <AddressSelector
            addresses={addresses}
            selected={selectedAddress}
            onSelect={setSelectedAddress}
            onAdd={saveAddress}
          />
        </div>
      )}

      {/* Carrito */}
      {cart.length > 0 && (
        <div>
          <h3>Productos</h3>
          <ul>
            {cart.map((item, idx) => (
              <li key={idx}>
                {item.name} x{item.quantity} - ${item.price * item.quantity}
              </li>
            ))}
          </ul>
          <div>Subtotal: ${cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0).toFixed(2)}</div>
          <div>Envío: ${storeData.shippingFee?.toFixed(2) || "0.00"}</div>
          <div>Servicio: $0.25</div>
          <div>
            <b>
              Total: $
              {(
                cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0) +
                (storeData.shippingFee || 0) +
                0.25
              ).toFixed(2)}
            </b>
          </div>
        </div>
      )}

      {/* Método de pago */}
      {cart.length > 0 && (
        <div>
          <h3>Método de pago</h3>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="">Selecciona...</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
          {paymentMethod === "Transferencia" && (
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
              />
              <small>Adjunta el comprobante de transferencia</small>
            </div>
          )}
        </div>
      )}

      {/* Programar entrega */}
      {cart.length > 0 && (
        <div>
          <h3>Entrega</h3>
          <label>
            <input
              type="radio"
              checked={deliveryType === "delivery"}
              onChange={() => setDeliveryType("delivery")}
            />
            Delivery
          </label>
          <label style={{ marginLeft: 16 }}>
            <input
              type="radio"
              checked={deliveryType === "pickup"}
              onChange={() => setDeliveryType("pickup")}
            />
            Retiro en tienda
          </label>
          <div style={{ marginTop: 8 }}>
            <label>
              Fecha:
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </label>
            <label style={{ marginLeft: 16 }}>
              Hora:
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </label>
          </div>
        </div>
      )}

      {/* Confirmar */}
      {cart.length > 0 && user && userData && (
        <button
          onClick={confirmOrder}
          style={{
            marginTop: 24,
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 0",
            fontWeight: 600,
            fontSize: 16,
            width: "100%",
            cursor: "pointer",
          }}
        >
          Confirmar pedido
        </button>
      )}

      {cart.length === 0 && <div>Tu carrito está vacío.</div>}
    </div>
  );
}

// Formulario de perfil
function ProfileForm({ onSave }: { onSave: (name: string, phone: string) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(name, phone);
      }}
      style={{ marginBottom: 20 }}
    >
      <input
        type="text"
        placeholder="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        style={{ marginRight: 8 }}
      />
      <input
        type="text"
        placeholder="Teléfono"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
        style={{ marginRight: 8 }}
      />
      <button type="submit">Guardar</button>
    </form>
  );
}

// Selector de direcciones
function AddressSelector({
  addresses,
  selected,
  onSelect,
  onAdd,
}: {
  addresses: Address[];
  selected: Address | null;
  onSelect: (addr: Address) => void;
  onAdd: (addr: Address) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [reference, setReference] = useState("");
  return (
    <div>
      {addresses.length > 0 && (
        <ul>
          {addresses.map((addr, idx) => (
            <li key={idx}>
              <label>
                <input
                  type="radio"
                  checked={selected === addr}
                  onChange={() => onSelect(addr)}
                />
                {addr.reference}
              </label>
            </li>
          ))}
        </ul>
      )}
      <button type="button" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancelar" : "Agregar dirección"}
      </button>
      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onAdd({ reference });
            setReference("");
            setShowForm(false);
          }}
        >
          <input
            type="text"
            placeholder="Referencia"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
          />
          <button type="submit">Guardar</button>
        </form>
      )}
    </div>
  );
}