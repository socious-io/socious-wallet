import SDK from "@atala/prism-wallet-sdk";
import axios from "axios";
export const apollo = new SDK.Apollo();
export const castor = new SDK.Castor(apollo);
// @TODO: config this secret for PROD
const SECRET = 'THIS_IS_SECRET_CHANGE_ME'

export async function createDID(agent: SDK.Agent, services: SDK.Domain.Service[]) {
    const mnemonics = apollo.createRandomMnemonics()

    const seed = apollo.createSeed(mnemonics, SECRET);

    const privateKey = apollo.createPrivateKey({
      type: SDK.Domain.KeyTypes.EC,
      curve: SDK.Domain.Curve.SECP256K1,
      seed: Buffer.from(seed.value).toString("hex"),
    });

    console.log(privateKey.publicKey(), '-----------------------')

    const did = await castor.createPrismDID(privateKey.publicKey(), services);
    // const res = await axios.post(`http://localhost:8000/prism-agent/did-registrar/dids/${did.toString()}/publications`)
    // console.log(res.data, '-------------------')
    return {did, mnemonics}
  }