import { BASE_URL } from "../api";
import { messageData } from "../types";

export const useGetAesKey = () => {
  const getAesKey = async (publicKey: CryptoKey) => {
    const exportedKey = await window.crypto.subtle.exportKey("spki", publicKey);

    // Convert the ArrayBuffer to a base64 string for the API call
    const publicKeyBase64 = btoa(
      String.fromCharCode(...new Uint8Array(exportedKey))
    );

    const response = await fetch("http://localhost:8000/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicKey: publicKeyBase64 }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json();
    return data;
  };

  return {
    getAesKey,
  };
};

export const requestEncryptedAESKey = async (publicKey: string) => {
  const response = await fetch(
    `${BASE_URL}/api/encryption/get-encrypted-aes-key`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicKey }),
    }
  );

  const { encryptedAESKey } = await response.json();
  return encryptedAESKey; // Return the encrypted AES key
};

export const sendMessage = async (payload: {
  encryptedData: string;
  iv: string;
}) => {
  const response = await fetch(`${BASE_URL}/api/encryption/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to send the message.");
  }

  return response.json();
};

// Function to fetch all messages from the backend
export const fetchMessages = async (): Promise<messageData[]> => {
  const response = await fetch(`${BASE_URL}/api/encryption/getMessages`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch messages.");
  }

  const data = await response.json();
  return data.messages;
};

// TODO: approach with tanstack query
// export const useGetAesKey = () => {
//   const { mutateAsync } = useMutation({
//     mutationFn: async (publicKey: CryptoKey) => {
//       const exportedKey = await window.crypto.subtle.exportKey(
//         "spki",
//         publicKey
//       );

//       // Convert the ArrayBuffer to a base64 string or hex string for the API call
//       const publicKeyBase64 = btoa(
//         String.fromCharCode(...new Uint8Array(exportedKey))
//       );

//       const response = await api.post("get-aes-key", {
//         publicKey: publicKeyBase64,
//       });
//       return response?.data;
//     },
//   });

//   return {
//     getAesKey: mutateAsync,
//   };
// };
