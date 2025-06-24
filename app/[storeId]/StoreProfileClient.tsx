"use client";

import { useCart } from "../CartContext";
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

export default function StoreProfileClient({
  store,
  products,
}: {
  store: Store;
  products: Product[];
}) {
  // Aquí va tu lógica client-side (useEffect, useState, etc)
  return (
    <div>
      <h1>{store.name}</h1>
      <p>{store.description}</p>
      {/* Renderiza productos aquí */}
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - ${p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}