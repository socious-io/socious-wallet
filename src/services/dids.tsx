import SDK from '@hyperledger/identus-sdk';
import { config } from 'src/config';
import { apollo, castor } from './pluto';

export async function createDID(services: SDK.Domain.DIDDocument.Service[]) {
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

export async function recoverDID(mnemonics: string[], services: SDK.Domain.DIDDocument.Service[]) {
  const seed = apollo.createSeed(mnemonics as SDK.Domain.MnemonicWordList, config.SECRET_KEY);

  const privateKey = apollo.createPrivateKey({
    type: SDK.Domain.KeyTypes.EC,
    curve: SDK.Domain.Curve.SECP256K1,
    seed: Buffer.from(seed.value).toString('hex'),
  });

  const did = await castor.createPrismDID(privateKey.publicKey(), services);

  return { did, mnemonics, privateKey };
}
