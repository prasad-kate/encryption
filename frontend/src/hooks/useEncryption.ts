import { useEffect } from "react";
import { requestEncryptedAESKey } from "../services/encryption.service";
import { useIndexedDB } from "./useIndexedDB";

export const useGetEncryptionKeys = () => {
  const {
    storeKeyPair,
    storeEncryptedAesKey,
    removeKeys,
    getPrivateKey,
    getEncryptedAesKey,
  } = useIndexedDB();

  // useEffect to generate keys and request encrypted AES key on component mount
  useEffect(() => {
    (async () => {
      try {
        // Step 1: Generate RSA key pair
        const keyPair = await generateRSAKeyPair();

        const generatedPublicKey = await exportPublicKey(keyPair.publicKey);

        // Step 2: Request the encrypted AES key from the backend
        const receivedEncryptedAESKey = await requestEncryptedAESKey(
          generatedPublicKey
        );

        // store keypairs into indexedDB
        storeKeyPair(keyPair);
        storeEncryptedAesKey(receivedEncryptedAESKey);
      } catch (error) {
        console.error("Error during encryption setup:", error);
      }
    })();

    // Cleanup function to clear privateKey when component unmounts
    return () => {
      removeKeys();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return { getEncryptedAesKey, getPrivateKey };
};

export const decryptAESKey = async (
  privateKey: CryptoKey | undefined,
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

// Function to generate RSA key pair
export const generateRSAKeyPair = async (): Promise<CryptoKeyPair> => {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048, // Key size in bits
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: "SHA-256", // Hashing algorithm
    },
    false, // Whether the key is extractable
    ["encrypt", "decrypt"] // Key usages
  );
};

// Function to export public key
export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported))); // Convert to Base64
};

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
// Convert a Uint8Array to a Base64 string
const arrayBufferToBase64 = (buffer: Uint8Array): string => {
  return btoa(String.fromCharCode(...buffer));
};

// Convert a Base64 string to a Uint8Array
const base64ToArrayBuffer = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Encrypt data using the AES-GCM algorithm with a hex key, returning Base64 encoded result
export const encryptDataWithAES = async (
  hexKey: string,
  data: string
): Promise<{ iv: string; encryptedData: string }> => {
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

  // Return both the IV and the encrypted data as Base64 encoded strings
  return {
    iv: arrayBufferToBase64(iv),
    encryptedData: arrayBufferToBase64(new Uint8Array(encryptedData)),
  };
};

// Decrypt data using the AES-GCM algorithm with a hex key, taking Base64 input
export const decryptDataWithAES = async (
  hexKey: string,
  iv: string,
  encryptedData: string
): Promise<string> => {
  // Import the AES key from the hex string
  const aesKey = await importAESKey(hexKey);

  // Convert the Base64-encoded IV and encrypted data back to Uint8Array
  const ivBuffer = base64ToArrayBuffer(iv);
  const encryptedDataBuffer = base64ToArrayBuffer(encryptedData);

  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer,
    },
    aesKey, // Imported AES key
    encryptedDataBuffer
  );

  return new TextDecoder().decode(decryptedData);
};

// // logic to test encryption and decrytion
// (async () => {
//   const aesKey = await decryptAESKey(privateKeyRef.current, encryptedAesKey);

//   if (!aesKey) return;

//   // Encrypt data
//   const { iv, encryptedData } = await encryptDataWithAES(
//     aesKey,
//     "Hello World!"
//   );

//   // Decrypt data
//   const decryptedData = await decryptDataWithAES(aesKey, iv, encryptedData);
//   console.log(decryptedData);
// })();
