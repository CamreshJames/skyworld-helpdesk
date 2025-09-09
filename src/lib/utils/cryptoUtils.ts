export async function encryptData(data: string, key: string): Promise<string> {
  if (!key || typeof key !== 'string' || key.length < 32) {
    throw new Error('Invalid encryption key: Must be a string of at least 32 characters');
  }

  try {
    // Convert key to CryptoKey (pad to 32 bytes for AES-256)
    const keyBuffer = new TextEncoder().encode(key.padEnd(32, ' ').slice(0, 32));
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Generate a random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
    const dataBuffer = new TextEncoder().encode(data);

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );

    // Combine IV and encrypted data, encode as base64
    const ivAndEncrypted = new Uint8Array([...iv, ...new Uint8Array(encrypted)]);
    return btoa(String.fromCharCode(...ivAndEncrypted));
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

export async function decryptData(encryptedData: string, key: string): Promise<string> {
  if (!key || typeof key !== 'string' || key.length < 32) {
    throw new Error('Invalid decryption key: Must be a string of at least 32 characters');
  }

  try {
    // Convert key to CryptoKey (pad to 32 bytes for AES-256)
    const keyBuffer = new TextEncoder().encode(key.padEnd(32, ' ').slice(0, 32));
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Decode base64 and extract IV
    const ivAndEncrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const iv = ivAndEncrypted.slice(0, 12); // First 12 bytes are IV
    const encrypted = ivAndEncrypted.slice(12);

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}