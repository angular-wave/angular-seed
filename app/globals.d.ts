export {};

declare global {
  interface Window {
    pwaReady?: Promise<boolean>;
  }
}
