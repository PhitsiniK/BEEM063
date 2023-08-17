import { Agriblock } from '../../src/contracts/agriblock5'
import {
    bsv,
    TestWallet,
    DefaultProvider,
    toByteString,
    PubKeyHash,
} from 'scrypt-ts'

import * as dotenv from 'dotenv'

// Load the .env file
dotenv.config()

// Read the private key from the .env file.
// The default private key inside the .env file is meant to be used for the Bitcoin testnet.
// See https://scrypt.io/docs/bitcoin-basics/bsv/#private-keys
const privateKey = bsv.PrivateKey.fromWIF(process.env.PRIVATE_KEY || 'cVznzHyFNP2JnD3TyjeqL3P9uGB95egsywEt3oR47SaUbba557mR')

// Prepare signer.
// See https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#prepare-a-signer-and-provider
const signer = new TestWallet(
    privateKey,
    new DefaultProvider({
        network: bsv.Networks.testnet,
    })
)

async function main() {
    await Agriblock.compile()

    // TODO: Adjust the amount of satoshis locked in the smart contract:
    const amount = 1
    const seller = PubKeyHash(toByteString('0000000000000000000000000000000000000000')) 
    const buyer = PubKeyHash(toByteString('0000000000000000000000000000000000000000')) 
    const arbiter = PubKeyHash(toByteString('0000000000000000000000000000000000000000')) 
    const escrowNonce = toByteString('001122334455aabbcc')

    const instance = new Agriblock(seller, buyer, arbiter, escrowNonce)

    // Connect to a signer.
    await instance.connect(signer)

    // Contract deployment.
    const deployTx = await instance.deploy(amount)
    console.log('Agriblock3 contract deployed:', deployTx.id)

}

main()
