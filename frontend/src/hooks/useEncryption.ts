import {
  decryptAESKey,
  decryptMessage,
  encryptMessage,
  generateRSAKeyPair,
} from "../lib/utils";
import { EncryptedMessageObj } from "../types";

import { useEffect, useState } from "react";
import { useGetAesKey } from "../services/encryption.service";

export const useCrypto = () => {
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
  const [aesKey, setAesKey] = useState<CryptoKey | null>(null);
  const { getAesKey } = useGetAesKey();

  useEffect(() => {
    const generateKeys = async () => {
      const { publicKey, privateKey } = await generateRSAKeyPair();
      setPrivateKey(privateKey);
      setPublicKey(publicKey);

      if (publicKey && privateKey) {
        const encryptedAESKey = await getAesKey(publicKey);
        if (encryptedAESKey) {
          const decryptedAESKey = await decryptAESKey(
            encryptedAESKey,
            privateKey
          );
          setAesKey(decryptedAESKey);
        }
      }
    };

    generateKeys();
  }, []);

  const sendMessage = async (message: string) => {
    if (!aesKey) return; // TODO: proper error handling
    const encryptedMessage = await encryptMessage(message, aesKey);
    console.log("Encrypted message:", encryptedMessage);
    // Send the encrypted message to the server
  };

  const receiveMessage = async (encryptedMessage: EncryptedMessageObj) => {
    if (!aesKey) return; // TODO: proper error handling
    const decryptedMessage = await decryptMessage(encryptedMessage, aesKey);
    console.log("Decrypted message:", decryptedMessage);
    // Display the decrypted message in the chat
  };

  return {
    sendMessage,
    receiveMessage,
  };
};
