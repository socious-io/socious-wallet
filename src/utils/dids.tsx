import SDK from '@atala/prism-wallet-sdk';
import { config } from '@/config';

export const apollo = new SDK.Apollo();
export const castor = new SDK.Castor(apollo);

export async function createDID(services: SDK.Domain.Service[]) {
  const mnemonics = apollo.createRandomMnemonics();

  const seed = apollo.createSeed(mnemonics, config.SECRET_KEY);

  const privateKey = apollo.createPrivateKey({
    type: SDK.Domain.KeyTypes.EC,
    curve: SDK.Domain.Curve.SECP256K1,
    seed: Buffer.from(seed.value).toString('hex'),
  });

  const did = await castor.createPrismDID(privateKey.publicKey(), services);

  return { did, mnemonics, privateKey };
}

export async function recoverDID(mnemonics: string[], services: SDK.Domain.Service[]) {
  const seed = apollo.createSeed(mnemonics as SDK.Domain.MnemonicWordList, config.SECRET_KEY);

  const privateKey = apollo.createPrivateKey({
    type: SDK.Domain.KeyTypes.EC,
    curve: SDK.Domain.Curve.SECP256K1,
    seed: Buffer.from(seed.value).toString('hex'),
  });

  const did = await castor.createPrismDID(privateKey.publicKey(), services);

  return { did, mnemonics, privateKey };
}
