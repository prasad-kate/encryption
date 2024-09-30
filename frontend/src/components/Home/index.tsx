import { FormEvent, useState } from "react";
import {
  decryptAESKey,
  encryptDataWithAES,
  useGetEncryptionKeys,
} from "../../hooks/useEncryption";
import { sendMessage } from "../../services/encryption.service";

const EncryptionComponent = () => {
  const [message, setMessage] = useState<string>("");
  const { encryptedAesKey, privateKey } = useGetEncryptionKeys();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
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
      const response = await sendMessage({
        iv,
        encryptedData,
      });

      console.log(response);
    } catch (error) {
      console.log(error);
    }

    setMessage("");
  };

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
        <button className="border bg-gray-100 text-sm py-2 px-3 rounded-md">
          Send
        </button>
      </form>
    </div>
  );
};

export default EncryptionComponent;
