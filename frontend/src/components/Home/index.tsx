import { useEffect, useState } from "react";
import { requestEncryptedAESKey } from "../../services/encryption.service";

const EncryptionComponent = () => {
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [encryptedAESKey, setEncryptedAESKey] = useState<string | null>(null);

  // Function to generate RSA key pair
  const generateRSAKeyPair = async (): Promise<CryptoKeyPair> => {
    return await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048, // Key size in bits
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: "SHA-256", // Hashing algorithm
      },
      true, // Whether the key is extractable
      ["encrypt", "decrypt"] // Key usages
    );
  };

  // Function to export public key
  const exportPublicKey = async (key: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey("spki", key);
    return btoa(String.fromCharCode(...new Uint8Array(exported))); // Convert to Base64
  };

  // useEffect to generate keys and request encrypted AES key on component mount
  useEffect(() => {
    const initializeEncryption = async () => {
      try {
        // Step 1: Generate RSA key pair
        const keyPair = await generateRSAKeyPair();
        setPrivateKey(keyPair.privateKey); // Store the private key securely
        const pubKey = await exportPublicKey(keyPair.publicKey);
        setPublicKey(pubKey); // Store the public key

        // Step 2: Request the encrypted AES key from the backend
        const aesKey = await requestEncryptedAESKey(pubKey);
        setEncryptedAESKey(aesKey); // Store the encrypted AES key
        console.log("Encrypted AES Key:", aesKey);
      } catch (error) {
        console.error("Error during encryption setup:", error);
      }
    };

    initializeEncryption();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div>
      <h1>Encryption Setup</h1>
      {publicKey && <p>Public Key: {publicKey}</p>}
      {encryptedAESKey && <p>Encrypted AES Key: {encryptedAESKey}</p>}
    </div>
  );
};

export default EncryptionComponent;
