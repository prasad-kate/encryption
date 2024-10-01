import { openDB } from "idb";

export const useIndexedDB = () => {
  // Initialize IndexedDB
  const initDB = async () => {
    return openDB("encryption-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("keys")) {
          db.createObjectStore("keys");
        }
      },
    });
  };

  // Function to store the key pair
  const storeKeyPair = async (keyPair: CryptoKeyPair) => {
    const db = await initDB();

    // Store the private key
    await db.put("keys", keyPair.privateKey, "privateKey");

    // Store the public key
    await db.put("keys", keyPair.publicKey, "publicKey");

    console.log("Key pair stored in IndexedDB.");
  };

  const removeKeyPair = async () => {
    const db = await initDB();

    // Delete the private key
    await db.delete("keys", "privateKey");

    // Delete the public key
    await db.delete("keys", "publicKey");

    console.log("Key pair removed from IndexedDB.");
  };

  // Function to get the private key from IndexedDB
  const getPrivateKey = async (): Promise<CryptoKey | undefined> => {
    const db = await initDB();
    return db.get("keys", "privateKey");
  };

  // Function to get the public key from IndexedDB
  const getPublicKey = async (): Promise<CryptoKey | undefined> => {
    const db = await initDB();
    return db.get("keys", "publicKey");
  };

  return {
    storeKeyPair,
    removeKeyPair,
    getPrivateKey,
    getPublicKey,
  };
};
