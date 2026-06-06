/**
 * Encrypted value container used for fields that must be stored encrypted.
 *
 * This is a pure type contract — no runtime encryption logic lives in this
 * library. Microservices are responsible for encrypting before persisting and
 * decrypting after retrieval.
 */
export interface EncryptedValue {
  /** Base64-encoded ciphertext produced by the encrypting microservice. */
  encryptedData: string;

  /**
   * Logical name of the encryption key used.
   * Examples: `client_pii_key`, `bank_data_key`, `notification_body_key`.
   * The actual key material is resolved from environment variables at runtime.
   */
  keyName: string;

  /**
   * Cryptographic algorithm identifier.
   * Default and recommended value: `AES-256-GCM`.
   */
  algorithm?: string;

  /**
   * Key version for future rotation support.
   * Incremented when data is re-encrypted with a new key.
   */
  version?: number;
}
