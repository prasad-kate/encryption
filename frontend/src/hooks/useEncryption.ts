import { useEffect, useState } from "react";

export default function useEncryptionKeys() {
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    // Generate RSA key pair
    const generateKeyPair = async () => {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      setPublicKey(keyPair.publicKey);
      setPrivateKey(keyPair.privateKey);
    };

    generateKeyPair();
  }, []); // Empty dependency array to run once on load

  return { publicKey, privateKey };
}

export const decryptAESKey = async (
  privateKey: CryptoKey | null,
  encryptedAESKey: string
) => {
  if (!privateKey) return;

  const encryptedKeyBuffer = Uint8Array.from(atob(encryptedAESKey), (c) =>
    c.charCodeAt(0)
  );

  const decryptedAESKey = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedKeyBuffer
  );

  // Convert the decrypted AES key to a hex string
  const decryptedKeyArray = new Uint8Array(decryptedAESKey);
  const hexKey = Array.from(decryptedKeyArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hexKey;
};

export async function generateRSAKeyPair(): Promise<{
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}> {
  const { publicKey, privateKey } = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: "SHA-256" },
    },
    true, // Extractable
    ["encrypt", "decrypt"]
  );

  return { publicKey, privateKey };
}

// Convert a hexadecimal string to a Uint8Array
const hexToUint8Array = (hexString: string): Uint8Array => {
  return new Uint8Array(
    hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
};

// Import the AES key from a hexadecimal string
const importAESKey = async (hexKey: string): Promise<CryptoKey> => {
  const rawKey = hexToUint8Array(hexKey);

  // Import the raw key into the CryptoKey format
  const aesKey = await crypto.subtle.importKey(
    "raw", // The key is raw binary
    rawKey, // The key in Uint8Array format
    "AES-GCM", // Algorithm name
    true, // Extractable (whether the key can be exported)
    ["encrypt", "decrypt"] // Usages
  );

  return aesKey;
};

// Encrypt data using the AES-GCM algorithm with a hex key
export const encryptDataWithAES = async (
  hexKey: string,
  data: string
): Promise<{ iv: Uint8Array; encryptedData: Uint8Array }> => {
  // Import the AES key from the hex string
  const aesKey = await importAESKey(hexKey);

  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encodedData = new TextEncoder().encode(data);

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey, // Imported AES key
    encodedData
  );

  return { iv, encryptedData: new Uint8Array(encryptedData) };
};

// Decrypt data using the AES-GCM algorithm with a hex key
export const decryptDataWithAES = async (
  hexKey: string,
  iv: Uint8Array,
  encryptedData: Uint8Array
): Promise<string> => {
  // Import the AES key from the hex string
  const aesKey = await importAESKey(hexKey);

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey, // Imported AES key
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
};
