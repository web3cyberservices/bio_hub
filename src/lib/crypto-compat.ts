
/**
 * Утилита для обеспечения совместимости crypto.randomUUID в различных рантаймах.
 */
export const crypto = {
  randomUUID: () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    // Node.js или Edge Runtime fallback
    return require('crypto').randomUUID();
  }
};
