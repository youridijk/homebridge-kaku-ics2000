import {Buffer} from 'buffer';
import crypto from 'crypto';

/**
 * This class contains all methods used for encryption and decryption
 */
export default class Cryptographer {
  /**
   * Encrypt a string data with AES 128 CBC with a 16-bit IV of random bytes and a given key. Returns the data in a HEX string
   * @param data The data you want to encrypt
   * @param aesKey The used for the encryption
   */
  static encrypt(data: string, aesKey: string) {
    const iv = crypto.randomBytes(16);
    // const iv = Buffer.alloc(16);
    const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(aesKey, 'hex'), iv);
    const encrypted = cipher.update(data, 'utf8', 'hex');
    return iv.toString('hex') + encrypted + cipher.final('hex');
  }

  /**
   * Decrypt a hex string with a given key
   * @param encodedData The encoded data in HEX format
   * @param aesKey The key used for decryption
   */
  static decryptHex(encodedData: string, aesKey: string) {
    // First 16 bytes of a hex string returned by the ics-2000 or the server is the IV
    const iv = Buffer.from(encodedData.substring(0, 32), 'hex');
    const data = encodedData.substring(32);
    const cipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(aesKey, 'hex'), iv);
    const decrypted = cipher.update(data, 'hex', 'utf8');
    return decrypted + cipher.final('utf8');
  }

  /**
   * Decrypt a base64 string with a given key
   * @param encodedData The encoded data in base64 format
   * @param aesKey The key used for decryption
   */
  static decryptBase64(encodedData: string, aesKey: string) {
    return this.decryptHex(Buffer.from(encodedData, 'base64').toString('hex'), aesKey);
  }
}
module.exports = Cryptographer;
