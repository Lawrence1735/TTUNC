/**
 * TypeScript declaration for React img fetchpriority attribute
 * This is a standard HTML attribute but not yet in React's type definitions
 */

declare namespace React {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
  
  interface LinkHTMLAttributes<T> {
    fetchpriority?: 'high' | 'low' | 'auto';
  }
}

export {};
