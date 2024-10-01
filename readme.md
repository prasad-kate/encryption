# Full-Stack Application: Vite + React + TypeScript (Frontend) & Node.js + Express + TypeScript (Backend)

This repository contains a full-stack application setup with Vite, React, and TypeScript for the frontend, and Node.js with Express and TypeScript for the backend. It demonstrates a foundational setup for implementing secure encryption processes.

## Key Features

- **RSA Key Pair Generation**: RSA public and private keys are generated in the browser and securely stored in IndexedDB.
- **Retrieving Encrypted AES Key**: The frontend makes an API call to fetch an AES key encrypted with the public RSA key, and this encrypted AES key is also stored in IndexedDB.
- **Encryption/Decryption Process**: Whenever necessary, the AES key is decrypted using the stored private RSA key to securely encrypt and decrypt messages or other payloads.

---

This setup ensures robust security practices, combining RSA and AES encryption to protect sensitive data in transit and at rest.
