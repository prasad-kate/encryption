import crypto, { KeyObject } from "crypto";
import express from "express";
const router = express.Router();

// Generate a random AES key
const generateAESKey = () => {
  return crypto.randomBytes(32); // AES-256 key
};

// Encrypt the AES key using the client's RSA public key
const encryptAESKey = (
  publicKey: string | Buffer | KeyObject,
  aesKey: Buffer
) => {
  return crypto.publicEncrypt(publicKey, aesKey);
};

router.post("/encryption", (req, res) => {
  try {
    const { publicKey } = req.body;
    const bufferPublicKey = Buffer.from(publicKey, "base64");

    // Generate a random AES key
    const aesKey = generateAESKey();

    // Encrypt the AES key using the provided RSA public key
    const encryptedAESKey = encryptAESKey(bufferPublicKey, aesKey);

    // Send the encrypted AES key back as a Base64 string
    res.json({
      encryptedAESKey: encryptedAESKey.toString("base64"),
    });
  } catch (err) {
    console.error("Error encrypting AES key:", err);
    res.status(500).send("Error encrypting AES key");
  }
});

export default router;
