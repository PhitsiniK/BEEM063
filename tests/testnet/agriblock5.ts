import { expect, use } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
    bsv,
    ByteString,
    findSig,
    hash160,
    hash256,
    int2ByteString,
    MethodCallOptions,
    PubKey,
    PubKeyHash,
    toByteString,
    assert,
} from 'scrypt-ts'
import { Signature, SECP256K1 } from 'scrypt-ts-lib'
import { Agriblock } from '../../src/contracts/agriblock5'
import { getDummySigner, getDummyUTXO } from '../utils/txHelper'

use(chaiAsPromised)

describe('Heavy: Test SmartContract `BlindEscrow`', () => {
    let seller: bsv.PrivateKey
    let buyer: bsv.PrivateKey
    let arbiter: bsv.PrivateKey

    // Make sure compressed flag is false
    let sellerPubKey: bsv.PublicKey
    let buyerPubKey: bsv.PublicKey
    let arbiterPubKey: bsv.PublicKey

    let sellerPKH: PubKeyHash
    let buyerPKH: PubKeyHash
    let arbiterPKH: PubKeyHash

    let escrowNonce: ByteString

    let agriblock: Agriblock

    before(async () => {
        seller = bsv.PrivateKey.fromRandom(bsv.Networks.testnet)
        buyer = bsv.PrivateKey.fromRandom(bsv.Networks.testnet)
        arbiter = bsv.PrivateKey.fromRandom(bsv.Networks.testnet)

        sellerPubKey = new bsv.PublicKey(seller.publicKey.point, {
            compressed: false,
        })
        buyerPubKey = new bsv.PublicKey(buyer.publicKey.point, {
            compressed: false,
        })
        arbiterPubKey = new bsv.PublicKey(arbiter.publicKey.point, {
            compressed: false,
        })

        sellerPKH = hash160(sellerPubKey.toHex())
        buyerPKH = hash160(buyerPubKey.toHex())
        arbiterPKH = hash160(arbiterPubKey.toHex())

        escrowNonce = toByteString('001122334455aabbcc') // TODO

        await Agriblock.compile()

        agriblock = new Agriblock(
            sellerPKH,
            buyerPKH,
            arbiterPKH,
            escrowNonce
        )
        return;
    })

    it('should pass release by seller', async () => {
        //// Sig by buyer, stamp by seller.

        // Create "stamp", i.e. seller signature of the escrowNonce.
        const oracleMsg: ByteString =
            escrowNonce + int2ByteString(Agriblock.RELEASE_BY_SELLER)
        const hashBuff = Buffer.from(hash256(oracleMsg), 'hex')
        const oracleSigObj = bsv.crypto.ECDSA.sign(hashBuff, seller)
        const oracleSig: Signature = {
            r: BigInt(oracleSigObj['r'].toString()),
            s: BigInt(oracleSigObj['s'].toString()),
        }

        await agriblock.connect(getDummySigner(buyer))
        const { tx: callTx, atInputIndex } = await agriblock.methods.spend(
            (sigResps) => findSig(sigResps, buyer.publicKey),
            PubKey(buyerPubKey.toHex()),
            oracleSig,
            PubKey(sellerPubKey.toHex()),
            Agriblock.RELEASE_BY_SELLER,
            {
                fromUTXO: getDummyUTXO(),
                pubKeyOrAddrToSign: buyer.publicKey,
            } as MethodCallOptions<Agriblock>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
        return;
    })


    it('should pass release by arbiter', async () => {
        //// Sig by buyer, stamp by arbiter.

        const oracleMsg: ByteString =
            escrowNonce + int2ByteString(Agriblock.RELEASE_BY_ARBITER)
        const hashBuff = Buffer.from(hash256(oracleMsg), 'hex')
        const oracleSigObj = bsv.crypto.ECDSA.sign(hashBuff, arbiter)
        const oracleSig: Signature = {
            r: BigInt(oracleSigObj['r'].toString()),
            s: BigInt(oracleSigObj['s'].toString()),
        }

        await agriblock.connect(getDummySigner(buyer))
        const { tx: callTx, atInputIndex } = await agriblock.methods.spend(
            (sigResps) => findSig(sigResps, buyer.publicKey),
            PubKey(buyerPubKey.toHex()),
            oracleSig,
            PubKey(arbiterPubKey.toHex()),
            Agriblock.RELEASE_BY_ARBITER,
            {
                fromUTXO: getDummyUTXO(),
                pubKeyOrAddrToSign: buyer.publicKey,
            } as MethodCallOptions<Agriblock>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
        return;
    }).timeout(10000);

    it('should pass return by buyer', async () => {
        //// Sig by seller, stamp by buyer.

        const oracleMsg: ByteString =
            escrowNonce + int2ByteString(Agriblock.RETURN_BY_BUYER)
        const hashBuff = Buffer.from(hash256(oracleMsg), 'hex')
        const oracleSigObj = bsv.crypto.ECDSA.sign(hashBuff, buyer)
        const oracleSig: Signature = {
            r: BigInt(oracleSigObj['r'].toString()),
            s: BigInt(oracleSigObj['s'].toString()),
        }

        await agriblock.connect(getDummySigner(seller))
        const { tx: callTx, atInputIndex } = await agriblock.methods.spend(
            (sigResps) => findSig(sigResps, seller.publicKey),
            PubKey(sellerPubKey.toHex()),
            oracleSig,
            PubKey(buyerPubKey.toHex()),
            Agriblock.RETURN_BY_BUYER,
            {
                fromUTXO: getDummyUTXO(),
                pubKeyOrAddrToSign: seller.publicKey,
            } as MethodCallOptions<Agriblock>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
        return;
    }).timeout(10000);

    it('should pass return by arbiter', async () => {
        //// Sig by seller, stamp by arbiter.

        const oracleMsg: ByteString =
            escrowNonce + int2ByteString(Agriblock.RETURN_BY_ARBITER)
        const hashBuff = Buffer.from(hash256(oracleMsg), 'hex')
        const oracleSigObj = bsv.crypto.ECDSA.sign(hashBuff, arbiter)
        const oracleSig: Signature = {
            r: BigInt(oracleSigObj['r'].toString()),
            s: BigInt(oracleSigObj['s'].toString()),
        }

        await agriblock.connect(getDummySigner(seller))
        const { tx: callTx, atInputIndex } = await agriblock.methods.spend(
            (sigResps) => findSig(sigResps, seller.publicKey),
            PubKey(sellerPubKey.toHex()),
            oracleSig,
            PubKey(arbiterPubKey.toHex()),
            Agriblock.RETURN_BY_ARBITER,
            {
                fromUTXO: getDummyUTXO(),
                pubKeyOrAddrToSign: seller.publicKey,
            } as MethodCallOptions<Agriblock>
        )

        const result = callTx.verifyScript(atInputIndex)
        expect(result.success, result.error).to.eq(true)
        return;
    }).timeout(10000);
})
