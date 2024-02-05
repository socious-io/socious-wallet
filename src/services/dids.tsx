import SDK from '@atala/prism-wallet-sdk';
import {config} from 'src/config';

export const apollo = new SDK.Apollo();
export const castor = new SDK.Castor(apollo);


export async function createDID(pluto: SDK.Domain.Pluto, services: SDK.Domain.Service[]) {
  const mnemonics = apollo.createRandomMnemonics();

  const seed = apollo.createSeed(mnemonics, config.SECRET_KEY);

  const privateKey = apollo.createPrivateKey({
    type: SDK.Domain.KeyTypes.EC,
    curve: SDK.Domain.Curve.SECP256K1,
    seed: Buffer.from(seed.value).toString('hex'),
  });

  const did = await castor.createPrismDID(privateKey.publicKey(), services);

  await pluto.storePeerDID(did, [privateKey]);
  return { did, mnemonics };
}
