import { ByteString, PubKey, PubKeyHash, Sig, SmartContract } from 'scrypt-ts';
import { Signature } from 'scrypt-ts-lib';
export declare class Agriblock extends SmartContract {
    static readonly RELEASE_BY_SELLER = 0n;
    static readonly RELEASE_BY_ARBITER = 1n;
    static readonly RETURN_BY_BUYER = 2n;
    static readonly RETURN_BY_ARBITER = 3n;
    seller: PubKeyHash;
    buyer: PubKeyHash;
    arbiter: PubKeyHash;
    escrowNonce: ByteString;
    constructor(seller: PubKeyHash, buyer: PubKeyHash, arbiter: PubKeyHash, escrowNonce: ByteString);
    spend(spenderSig: Sig, spenderPubKey: PubKey, oracleSig: Signature, oraclePubKey: PubKey, action: bigint): void;
}
