import { useEffect, useRef, useState } from "react";
import {
  decryptAESKey,
  decryptDataWithAES,
  encryptDataWithAES,
  exportPublicKey,
  generateRSAKeyPair,
} from "../../hooks/useEncryption";
import { requestEncryptedAESKey } from "../../services/encryption.service";

const EncryptionComponent = () => {
  const [encryptedAesKey, setEncryptedAesKey] = useState<string>("");

  // Store privateKey outside of state
  const privateKeyRef = useRef<CryptoKey | null>(null);

  // useEffect to generate keys and request encrypted AES key on component mount
  useEffect(() => {
    (async () => {
      try {
        // Step 1: Generate RSA key pair
        const keyPair = await generateRSAKeyPair();

        const generatedPrivateKey = keyPair.privateKey;
        const generatedPublicKey = await exportPublicKey(keyPair.publicKey);

        // Step 2: Request the encrypted AES key from the backend
        const receivedEncryptedAESKey = await requestEncryptedAESKey(
          generatedPublicKey
        );

        privateKeyRef.current = generatedPrivateKey;
        setEncryptedAesKey(receivedEncryptedAESKey);
      } catch (error) {
        console.error("Error during encryption setup:", error);
      }
    })();

    // Cleanup function to clear privateKey when component unmounts
    return () => {
      privateKeyRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // logic to test encryption and decrytion
  (async () => {
    const aesKey = await decryptAESKey(privateKeyRef.current, encryptedAesKey);

    if (!aesKey) return;

    // Encrypt data
    const { iv, encryptedData } = await encryptDataWithAES(
      aesKey,
      "Hello World!"
    );

    // Decrypt data
    const decryptedData = await decryptDataWithAES(aesKey, iv, encryptedData);
    console.log(decryptedData);
  })();

  return (
    <div>
      <h1>Encryption Setup</h1>
      {encryptedAesKey && <p>Encrypted AES Key: {encryptedAesKey}</p>}
    </div>
  );
};

export default EncryptionComponent;
