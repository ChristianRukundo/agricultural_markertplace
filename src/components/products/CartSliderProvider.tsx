"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the context data
interface CartContextType {
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

// Create the context with a default value of null
const CartSliderContext = createContext<CartContextType | null>(null);

/**
 * A custom hook for easily accessing the cart slider context.
 * Throws an error if used outside of a CartSliderProvider.
 */
export const useCartSlider = () => {
  const context = useContext(CartSliderContext);
  if (!context) {
    throw new Error("useCartSlider must be used within a CartSliderProvider");
  }
  return context;
};

/**
 * Provides the cart slider state (isOpen, openCart, closeCart) to its children.
 * This component should wrap the entire page that uses the cart slider.
 */
export function CartSliderProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const value = { isOpen, openCart, closeCart };

  return (
    <CartSliderContext.Provider value={value}>
      {children}
    </CartSliderContext.Provider>
  );
}
