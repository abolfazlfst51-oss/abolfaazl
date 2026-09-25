/**
 * Client-Side Web Crypto AES-GCM (256-bit) + PBKDF2 encryption utilities
 * Ensures user data is securely encrypted before cloud backup.
 */

// Derive AES-GCM key from password + salt using PBKDF2
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plaintext string with password
export async function encryptData(plaintext: string, password: string): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    enc.encode(plaintext)
  );

  const ciphertextArray = new Uint8Array(encrypted);
  let binary = '';
  for (let i = 0; i < ciphertextArray.byteLength; i++) {
    binary += String.fromCharCode(ciphertextArray[i]);
  }
  const ciphertext = btoa(binary);

  let ivBinary = '';
  for (let i = 0; i < iv.byteLength; i++) {
    ivBinary += String.fromCharCode(iv[i]);
  }

  let saltBinary = '';
  for (let i = 0; i < salt.byteLength; i++) {
    saltBinary += String.fromCharCode(salt[i]);
  }

  return {
    ciphertext,
    iv: btoa(ivBinary),
    salt: btoa(saltBinary),
  };
}

// Decrypt ciphertext string with password
export async function decryptData(
  ciphertext: string,
  ivBase64: string,
  saltBase64: string,
  password: string
): Promise<string> {
  const binaryCipher = atob(ciphertext);
  const cipherBytes = new Uint8Array(binaryCipher.length);
  for (let i = 0; i < binaryCipher.length; i++) {
    cipherBytes[i] = binaryCipher.charCodeAt(i);
  }

  const binaryIv = atob(ivBase64);
  const ivBytes = new Uint8Array(binaryIv.length);
  for (let i = 0; i < binaryIv.length; i++) {
    ivBytes[i] = binaryIv.charCodeAt(i);
  }

  const binarySalt = atob(saltBase64);
  const saltBytes = new Uint8Array(binarySalt.length);
  for (let i = 0; i < binarySalt.length; i++) {
    saltBytes[i] = binarySalt.charCodeAt(i);
  }

  const key = await deriveKey(password, saltBytes);
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBytes,
    },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
