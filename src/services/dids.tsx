import SDK from "@atala/prism-wallet-sdk";

export const apollo = new SDK.Apollo();
export const castor = new SDK.Castor(apollo);
// @TODO: config this secret for PROD
const SECRET = 'THIS_IS_SECRET_CHANGE_ME'

export async function createDID(pluto: SDK.Domain.Pluto, services: SDK.Domain.Service[]) {
    const mnemonics = apollo.createRandomMnemonics()

    const seed = apollo.createSeed(mnemonics, SECRET);

    const privateKey = apollo.createPrivateKey({
      type: SDK.Domain.KeyTypes.EC,
      curve: SDK.Domain.Curve.SECP256K1,
      seed: Buffer.from(seed.value).toString("hex"),
    });

    const did = await castor.createPrismDID(privateKey.publicKey(), services);
    await pluto.storePrismDID(did, 0, privateKey, '')
    return {did, mnemonics}
  }