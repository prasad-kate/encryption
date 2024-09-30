import { useGetEncryptionKeys } from "../../hooks/useEncryption";

const EncryptionComponent = () => {
  const { encryptedAesKey, privateKey } = useGetEncryptionKeys();

  return (
    <div>
      <h1 className="text-red-300">Encryption Setup</h1>
      {encryptedAesKey && <p>Encrypted AES Key: {encryptedAesKey}</p>}
    </div>
  );
};

export default EncryptionComponent;
