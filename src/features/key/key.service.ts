import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { generateKeyPairSync } from 'node:crypto';
import * as path from 'path';
import * as fs from 'fs';
import { KeyMessages } from './enums/key.enum';
const JSEncrypt = require('node-jsencrypt');
const crypto = require('crypto');
@Injectable()
export class KeyService implements OnApplicationBootstrap {
  private logger = new Logger('KeyService');
  private readonly keysDir = path.join(process.cwd(), 'keys');
  private publicKey: string;
  private privateKey: string;

  constructor() {
    this.ensureKeysDirExists();
  }

  onApplicationBootstrap() {
    this.loadOrGenerateKeys();
  }

  private loadOrGenerateKeys(): void {
    const privateKeyPath = path.join(this.keysDir, 'private.pem');
    const publicKeyPath = path.join(this.keysDir, 'public.pem');

    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
      this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      this.logger.log(KeyMessages.KEYS_LOADED_SUCCESSFULLY);
      return;
    }

    const { publicKey, privateKey } = this.generateKeys();
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.logger.log(KeyMessages.KEYS_GENERATED_SUCCESSFULLY);
  }

  private generateKeys(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });

    fs.writeFileSync(path.join(this.keysDir, 'private.pem'), privateKey);
    fs.writeFileSync(path.join(this.keysDir, 'public.pem'), publicKey);

    return { publicKey, privateKey };
  }

  getPublicKey(): string {
    if (!this.publicKey) {
      return null;
    }
    return this.publicKey;
  }

  getPrivateKey(): string {
    if (!this.privateKey) {
      return null;
    }
    return this.privateKey;
  }

  async desencrytPassword(encryptedPassword: string): Promise<Result<String>> {
    try {
      const privateKey = this.getPrivateKey();
      if (!privateKey) {
        return { data: null, error: KeyMessages.PRIVATE_KEY_NOT_AVAILABLE };
      }

      const decrypt = new JSEncrypt();
      decrypt.setPrivateKey(privateKey);

      const desencrytPassword = decrypt.decrypt(encryptedPassword);

      if (!desencrytPassword) {
        return { data: null, error: KeyMessages.PASSWORD_DECRYPTION_FAILED };
      }

      return { data: desencrytPassword.toString(), error: null };
    } catch (error) {
      console.log('🚀 ~ Error ~ KeyService ~ desencrytPassword:', error);
      return { data: null, error: KeyMessages.PASSWORD_DECRYPTION_FAILED };
    }
  }

  private decryptString(ciphertext: string): string {
    const privateKey = this.getPrivateKey();

    const decrypted = crypto.privateDecrypt(
      {
        key: privateKey,
        passphrase: '',
      },
      Buffer.from(ciphertext, 'base64'),
    );

    return decrypted.toString('utf8');
  }

  private ensureKeysDirExists(): void {
    if (!fs.existsSync(this.keysDir)) {
      fs.mkdirSync(this.keysDir, { recursive: true });
    }
  }
}
