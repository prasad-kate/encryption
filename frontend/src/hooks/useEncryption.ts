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
  privateKey: CryptoKey,
  encryptedAESKey: string
) => {
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

  return new Uint8Array(decryptedAESKey); // This is the decrypted AES key
};

export const encryptDataWithAES = async (aesKey: CryptoKey, data: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encodedData = new TextEncoder().encode(data);

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey, // Now this is the imported CryptoKey
    encodedData
  );

  return { iv, encryptedData: new Uint8Array(encryptedData) };
};

export const decryptDataWithAES = async (
  aesKey: CryptoKey,
  iv: Uint8Array,
  encryptedData: Uint8Array
) => {
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey, // Now this is the imported CryptoKey
    encryptedData
  );

  return new TextDecoder().decode(decryptedData);
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

const decryptAESKeyUtil = async (
  privateKey: CryptoKey,
  encryptedAESKey: string
): Promise<CryptoKey> => {
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

  // Now import the AES key as a CryptoKey object
  return window.crypto.subtle.importKey(
    "raw", // raw format of the key
    new Uint8Array(decryptedAESKey), // the decrypted key
    { name: "AES-GCM" }, // the algorithm the key will be used with
    true, // whether the key is extractable (can be used for exporting later)
    ["encrypt", "decrypt"] // what the key will be used for
  );
};

export const encryptMessage = async (
  privateKey: CryptoKey,
  encryptedAESKey: string,
  message: string
) => {
  // Step 1: Decrypt the AES key
  const aesKey = await decryptAESKeyUtil(privateKey, encryptedAESKey);

  // Step 2: Encrypt the message using the AES key
  const iv = crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encodedData = new TextEncoder().encode(message);

  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey, // Use the decrypted AES key
    encodedData
  );

  return {
    iv: iv, // Return the IV so it can be used during decryption
    encryptedMessage: new Uint8Array(encryptedData), // The encrypted message
  };
};

export const decryptMessage = async (
  privateKey: CryptoKey,
  encryptedAESKey: string,
  iv: Uint8Array,
  encryptedMessage: Uint8Array
) => {
  // Step 1: Decrypt the AES key
  const aesKey = await decryptAESKeyUtil(privateKey, encryptedAESKey);

  // Step 2: Decrypt the message using the AES key
  const decryptedData = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey, // Use the decrypted AES key
    encryptedMessage
  );

  return new TextDecoder().decode(decryptedData); // Return the decrypted message as a string
};
