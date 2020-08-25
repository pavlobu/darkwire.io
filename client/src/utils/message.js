import Crypto from './crypto';

const crypto = new Crypto();

export const process = (payload, state) =>
  new Promise(async (resolve, reject) => {
    const privateKeyJson = state.user.privateKey;
    const privateKey = await crypto.importEncryptDecryptKey(privateKeyJson);
    const signature = payload.signature;
    const iv = payload.iv;
    const payloadBuffer = payload.payload;

    let sessionAESKeyUnencrypted;
    let signingHMACKey;

    await new Promise(resolvePayload => {
      payload.keys.forEach(async key => {
        try {
          sessionAESKeyUnencrypted = await crypto.unwrapKey(privateKey, key.sessionKey);
          signingHMACKey = await crypto.unwrapKey(privateKey, key.signingKey);
          resolvePayload();
        } catch (e) {}
      });
    });

    const verified = await crypto.verifyPayload(signature, payloadBuffer, signingHMACKey);

    if (!verified) {
      console.error("recreated signature doesn't match with payload.signature");
      reject();
      return;
    }

    const decryptedPayload = await crypto.decryptMessage(payloadBuffer, sessionAESKeyUnencrypted, iv);

    const payloadJson = JSON.parse(decryptedPayload);
    resolve(payloadJson);
  });

export const prepare = (payload, state) =>
  new Promise(async resolve => {
    const myUsername = state.user.username;
    const myId = state.user.id;
    const jsonToSend = {
      ...payload,
      payload: {
        ...payload.payload,
        sender: myId,
        username: myUsername,
        text: encodeURI(payload.payload.text),
      },
    };
    const payloadBuffer = JSON.stringify(jsonToSend);

    const secretKeyRandomAES = window.forge.random.getBytesSync(16);
    const iv = window.forge.random.getBytesSync(16);
    const encryptedPayloadString = await crypto.encryptMessage(payloadBuffer, secretKeyRandomAES, iv);

    const secretKeyRandomHMAC = window.forge.random.getBytesSync(32);
    const signatureString = await crypto.signMessage(encryptedPayloadString, secretKeyRandomHMAC);

    const encryptedKeys = await Promise.all(
      state.room.members.map(async member => {
        const memberPublicKey = await crypto.importEncryptDecryptKey(member.publicKey);
        const enc = await Promise.all([
          crypto.wrapKeyWithForge(secretKeyRandomAES, memberPublicKey),
          crypto.wrapKeyWithForge(secretKeyRandomHMAC, memberPublicKey),
        ]);

        return {
          sessionKey: enc[0],
          signingKey: enc[1],
        };
      }),
    );

    resolve({
      toSend: {
        payload: encryptedPayloadString,
        signature: signatureString,
        iv: iv,
        keys: encryptedKeys,
      },
      original: jsonToSend,
    });
  });
