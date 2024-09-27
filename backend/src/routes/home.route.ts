import express from "express";
import crypto, { KeyObject } from "crypto";

const router = express.Router();

// Generate a random AES key
const generateAESKey = () => {
  return crypto.randomBytes(32); // AES-256 key
};

// Encrypt the AES key using the client's RSA public key
const encryptAESKey = (
  publicKey: string | Buffer | crypto.KeyObject,
  aesKey: Buffer
) => {
  // Check if publicKey is a string (assumed to be base64 without PEM headers)
  if (typeof publicKey === "string") {
    // Format the public key as PEM by adding necessary headers
    publicKey = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
  }

  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING, // PKCS#1 padding
    },
    aesKey
  );
};

router.get("/api", (req, res) => {
  res.send("Home page route response");
});

router.post("/api", (req, res) => {
  try {
    const { publicKey } = req.body;

    const bufferPublicKey = Buffer.from(publicKey, "base64");

    // Generate a random AES key
    const aesKey = generateAESKey();

    // Encrypt the AES key using the provided RSA public key
    const encryptedAESKey = encryptAESKey(bufferPublicKey, aesKey);

    console.log("zz", encryptedAESKey);
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
