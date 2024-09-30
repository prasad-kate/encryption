import express from "express";
import { randomBytes, publicEncrypt, constants, createPublicKey } from "crypto";
import { messageData } from "../types";

const router = express.Router();

const messages: messageData[] = [];

// Route to return an encrypted AES key
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

// Route to get all messages
router.get("/getMessages", (req, res) => {
  if (messages.length === 0) {
    return res.status(404).json({ error: "No messages found." });
  }

  // Return the list of messages as a JSON response
  res.status(200).json({ messages });
});
// Route to add new message
router.post("/sendMessage", (req, res) => {
  const { iv, encryptedData } = req.body;

  // Validate the request body to ensure iv and encryptedData are present
  if (!iv || !encryptedData) {
    return res.status(400).json({
      error: "Invalid payload. 'iv' and 'encryptedMessage' are required.",
    });
  }

  // Add the message to the messages array
  messages.push(req.body);

  // Send a response back to the client confirming the message was received
  return res
    .status(201)
    .json({ success: true, message: "Message sent successfully!" });
});

export default router;
