import express from "express";
import { randomBytes, publicEncrypt, constants, createPublicKey } from "crypto";

const router = express.Router();

// Endpoint to return an encrypted AES key
router.post("/get-encrypted-aes-key", (req, res) => {
  const { publicKey } = req.body;

  if (!publicKey) {
    return res.status(400).json({ error: "Public key is required." });
  }

  try {
    // Generate a random AES key (256-bit)
    const aesKey = randomBytes(32);

    // Create a KeyObject from the public key in PEM format
    const keyObject = createPublicKey({
      key: `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`,
      format: "pem", // Specify the format as PEM
    });

    // Encrypt the AES key using the public key
    const encryptedAESKey = publicEncrypt(
      {
        key: keyObject,
        padding: constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      aesKey
    );

    // Return the encrypted AES key as a Base64 string
    res.json({ encryptedAESKey: encryptedAESKey.toString("base64") });
  } catch (error) {
    res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
