const crypto = require("crypto");

const algorithm = "aes-256-cbc";

const SECRET_KEY = process.env.CRYPTO_SECRET;
const IV = process.env.CRYPTO_IV;

// 🔐 ENCRYPT
exports.encrypt = (text) => {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(SECRET_KEY),
    Buffer.from(IV)
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};

// 🔓 DECRYPT
exports.decrypt = (encryptedText) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(SECRET_KEY),
    Buffer.from(IV)
  );

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};