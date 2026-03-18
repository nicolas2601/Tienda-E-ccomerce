'use server'

// Cart is managed client-side with Zustand store.
// See src/store/cart.ts for the actual cart implementation.
// This file exists for compatibility with server-side imports.

export async function retrieveCart() {
  return null
}
