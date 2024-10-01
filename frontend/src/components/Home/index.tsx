import { FormEvent, useEffect, useState } from "react";
import {
  decryptAESKey,
  decryptDataWithAES,
  encryptDataWithAES,
  useGetEncryptionKeys,
} from "../../hooks/useEncryption";
import { fetchMessages, sendMessage } from "../../services/encryption.service";
import { messageData } from "../../types";

const EncryptionComponent = () => {
  const [message, setMessage] = useState<string>("");
  const [messageArray, setMessageArray] = useState<messageData[]>([]);
  const [decryptedMessages, setDecryptedMessages] = useState<string[]>([]);

  const { encryptedAesKey, getPrivateKey } = useGetEncryptionKeys();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const privateKey = await getPrivateKey().then((key) => key);
      const aesKey = await decryptAESKey(privateKey, encryptedAesKey);

      if (!message) {
        setMessage("");
        return alert("Enter a valid message.");
      }
      if (!aesKey) {
        setMessage("");
        return alert("Something went wrong. Please try again.");
      }

      // Encrypt data
      const { iv, encryptedData } = await encryptDataWithAES(aesKey, message);

      // send encrypted data to backend
      await sendMessage({
        iv,
        encryptedData,
      });
    } catch (error) {
      console.log(error);
    }

    setMessage("");
  };

  const decryptMessages = async () => {
    const privateKey = await getPrivateKey().then((key) => key);
    const aesKey = await decryptAESKey(privateKey, encryptedAesKey);

    if (!aesKey) return;

    const decryptedArray: string[] = await Promise.all(
      messageArray.map(async ({ iv, encryptedData }) => {
        const decryptedData = await decryptDataWithAES(
          aesKey,
          iv,
          encryptedData
        );

        return decryptedData;
      })
    );

    setDecryptedMessages(decryptedArray);
  };

  useEffect(() => {
    if (messageArray.length) {
      decryptMessages();
    }
  }, [messageArray]);

  return (
    <div className="p-3">
      <h1 className="text-red-300 my-2">Encryption Setup</h1>

      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <input
          type="text"
          name="message"
          className="border p-2 rounded-md"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
        <button
          type="submit"
          className="border bg-gray-100 text-sm py-2 px-3 rounded-md disabled:opacity-50"
          disabled={!message}
        >
          Send
        </button>
        <button
          onClick={async () => {
            const data = await fetchMessages();
            setMessageArray(data);
          }}
          className="border bg-gray-100 text-sm py-2 px-3 rounded-md"
          type="button"
        >
          Get Messages
        </button>
      </form>

      {messageArray?.map(({ encryptedData }, index) => {
        return (
          <p key={index}>
            {encryptedData} {decryptedMessages[index]}
          </p>
        );
      })}
    </div>
  );
};

export default EncryptionComponent;
