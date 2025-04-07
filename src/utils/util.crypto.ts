import { createCipheriv, createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';

export class Encryption {
  private readonly algorithm = process.env.ALGORITHM_CRYPTO;
  private readonly password = process.env.PASS_CRYPTO;
  private readonly iv = process.env.IV_CRYPTO;

  private async getKey() {
    return (await promisify(scrypt)(this.password, 'salt', 32)) as Buffer;
  }

  public async cipheriv(textToEncrypt: string) {
    try {
      const key = await this.getKey();
      const bufferIv = Buffer.from(this.iv, 'hex');
      const cipher = createCipheriv(this.algorithm, key, bufferIv);

      const encryptedText = Buffer.concat([
        cipher.update(textToEncrypt),
        cipher.final(),
      ]);

      console.log(encryptedText.toString('hex'));
      return encryptedText.toString('hex');
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  public async decipheriv(encryptedText: string) {
    try {
      const key = await this.getKey();
      const bufferIv = Buffer.from(this.iv, 'hex');
      const bufferEncryptedText = Buffer.from(encryptedText, 'hex');

      const decipher = createDecipheriv(this.algorithm, key, bufferIv);
      const decryptedText = Buffer.concat([
        decipher.update(bufferEncryptedText),
        decipher.final(),
      ]);

      return decryptedText.toString();
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}
