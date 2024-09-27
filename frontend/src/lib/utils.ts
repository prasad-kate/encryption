import { EncryptedMessageObj } from "../types";

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

export async function decryptAESKey(
  encryptedAESKey: ArrayBuffer,
  privateKey: CryptoKey
): Promise<CryptoKey> {
  const decryptedAESKey = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedAESKey
  );

  // Convert decrypted AES key back to CryptoKey
  return window.crypto.subtle.importKey(
    "raw",
    decryptedAESKey,
    { name: "AES-GCM" },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

export async function decryptMessage(
  encryptedMessageObj: EncryptedMessageObj,
  aesKey: CryptoKey
): Promise<string> {
  const { iv, encryptedMessage } = encryptedMessageObj;

  const decryptedMessage = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    encryptedMessage
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedMessage); // Return the decrypted message as a string
}

export async function encryptMessage(
  message: string,
  aesKey: CryptoKey
): Promise<EncryptedMessageObj> {
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);

  // Use AES-GCM for encryption
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // Initialization vector
  const encryptedMessage = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    aesKey,
    encodedMessage
  );

  return { iv, encryptedMessage: new Uint8Array(encryptedMessage) }; // Return both IV and encrypted message
}
