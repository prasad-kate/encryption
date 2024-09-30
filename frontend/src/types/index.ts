export type EncryptedMessageObj = {
  iv: Uint8Array;
  encryptedMessage: Uint8Array;
};

export interface messageData {
  encryptedData: string;
  iv: string;
}
