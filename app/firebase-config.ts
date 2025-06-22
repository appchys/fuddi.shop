import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAAAFDJ_utlimCezUR-_i8Y2yUare9yZ1k",
  authDomain: "multitienda-69778.firebaseapp.com",
  projectId: "multitienda-69778",
  storageBucket: "multitienda-69778.appspot.com",
  messagingSenderId: "939925630795",
  appId: "1:939925630795:web:713aca499392bfa36482ce"
};

// Inicializa Firebase solo si no está inicializado
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Exporta los servicios que usarás
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, googleProvider, db, storage };