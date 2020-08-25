export default class Crypto {
  constructor() {
    this._crypto = window.forge;
  }

  get crypto() {
    return this._crypto;
  }

  convertStringToArrayBufferView(str) {
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }

    return bytes;
  }

  convertArrayBufferViewToString(buffer) {
    let str = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      str += String.fromCharCode(buffer[i]);
    }

    return str;
  }

  createEncryptDecryptKeys() {
    return new Promise(resolve => {
      const keypair = this.crypto.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
      resolve(keypair);
    });
  }

  encryptMessage(data, secretKey, iv) {
    return new Promise(resolve => {
      const input = window.forge.util.createBuffer(data, 'utf8');
      const cipherAES = window.forge.cipher.createCipher('AES-CBC', secretKey);
      cipherAES.start({ iv: iv });
      cipherAES.update(input);
      cipherAES.finish();
      const cyphertext = cipherAES.output.getBytes();
      resolve(cyphertext);
    });
  }

  decryptMessage(data, secretKey, iv) {
    return new Promise(resolve => {
      const input = window.forge.util.createBuffer(data);
      const decipher = window.forge.cipher.createDecipher('AES-CBC', secretKey);
      decipher.start({ iv: iv });
      decipher.update(input); // input should be a strng here
      decipher.finish();
      const decryptedPayload = decipher.output.toString('utf8');
      resolve(decryptedPayload);
    });
  }

  importEncryptDecryptKey(keyPemString) {
    return new Promise(resolve => {
      if (this._isPublicKeyString(keyPemString)) {
        const publicKeyPem = this.crypto.pki.publicKeyFromPem(keyPemString);
        resolve(publicKeyPem);
      } else {
        const privateKeyPem = this.crypto.pki.privateKeyFromPem(keyPemString);
        resolve(privateKeyPem);
      }
    });
  }

  exportKey(key) {
    return new Promise(resolve => {
      if (this._isPublicKeyObject(key)) {
        const publicKeyPem = this.crypto.pki.publicKeyToPem(key).toString();
        resolve(publicKeyPem);
      } else {
        const privateKeyPem = this.crypto.pki.privateKeyToPem(key).toString();
        resolve(privateKeyPem);
      }
    });
  }

  signMessage(data, keyToSignWith) {
    return new Promise(resolve => {
      const hmac = window.forge.hmac.create();
      const input = window.forge.util.createBuffer(data, 'utf8');
      hmac.start('sha256', keyToSignWith);
      hmac.update(input);
      const signatureString = hmac.digest().getBytes();
      resolve(signatureString);
    });
  }

  verifyPayload(signature, data, secretKey) {
    return new Promise(resolve => {
      const hmac = window.forge.hmac.create();
      let input = window.forge.util.createBuffer(data, 'utf8');
      hmac.start('sha256', secretKey);
      hmac.update(input);
      const recreatedSignature = hmac.digest().getBytes();
      const verified = recreatedSignature === signature;
      resolve(verified);
    });
  }

  wrapKeyWithForge(keyToWrap, publicKeyToWrapWith) {
    return publicKeyToWrapWith.encrypt(keyToWrap, 'RSA-OAEP');
  }

  unwrapKey(privateKey, encryptedAESKey) {
    return privateKey.decrypt(encryptedAESKey, 'RSA-OAEP');
  }

  _isPublicKeyString(key) {
    return key.includes('PUBLIC KEY');
  }

  _isPublicKeyObject(key) {
    return key['encrypt'] !== undefined;
  }
}
