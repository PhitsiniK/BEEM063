"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agriblock = void 0;
const scrypt_ts_1 = require("scrypt-ts");
//import { TransactionBuilder } from 'bsv';
const scrypt_ts_lib_1 = require("scrypt-ts-lib");
// Important to keep in mind:
// All public keys must be in uncompressed form. This also affects
// the values of the pub key hashes i.e. addresses.
class Agriblock extends scrypt_ts_1.SmartContract {
    constructor(seller, buyer, arbiter, escrowNonce) {
        super(...arguments);
        this.seller = seller;
        this.buyer = buyer;
        this.arbiter = arbiter;
        this.escrowNonce = escrowNonce;
    }
    spend(spenderSig, spenderPubKey, oracleSig, oraclePubKey, action) {
        let spender = (0, scrypt_ts_1.PubKeyHash)((0, scrypt_ts_1.toByteString)('0000000000000000000000000000000000000000'));
        let oracle = (0, scrypt_ts_1.PubKeyHash)((0, scrypt_ts_1.toByteString)('0000000000000000000000000000000000000000'));
        // Load correct addresses.
        if (action == Agriblock.RELEASE_BY_SELLER) {
            spender = this.buyer;
            oracle = this.seller;
        }
        else if (action == Agriblock.RELEASE_BY_ARBITER) {
            spender = this.buyer;
            oracle = this.arbiter;
        }
        else if (action == Agriblock.RETURN_BY_BUYER) {
            spender = this.seller;
            oracle = this.buyer;
        }
        else if (action == Agriblock.RETURN_BY_ARBITER) {
            spender = this.seller;
            oracle = this.arbiter;
        }
        else {
            // Invalid action
            (0, scrypt_ts_1.exit)(false);
        }
        // Check public keys belong to the specified addresses
        (0, scrypt_ts_1.assert)((0, scrypt_ts_1.hash160)(spenderPubKey) == spender, 'Wrong spender pub key');
        (0, scrypt_ts_1.assert)((0, scrypt_ts_1.hash160)(oraclePubKey) == oracle, 'Wrong oracle pub key');
        // Check oracle signature, i.e. "stamp".
        const oracleMsg = this.escrowNonce + (0, scrypt_ts_1.int2ByteString)(action);
        const hashInt = (0, scrypt_ts_1.byteString2Int)((0, scrypt_ts_1.reverseByteString)((0, scrypt_ts_1.hash256)(oracleMsg), 32n) + (0, scrypt_ts_1.toByteString)('00'));
        (0, scrypt_ts_1.assert)(scrypt_ts_lib_1.SECP256K1.verifySig(hashInt, oracleSig, scrypt_ts_lib_1.SECP256K1.pubKey2Point(oraclePubKey)), 'Oracle sig invalid');
        // Check spender signature.
        (0, scrypt_ts_1.assert)(this.checkSig(spenderSig, spenderPubKey), 'Spender sig invalid');
    }
}
exports.Agriblock = Agriblock;
// 4 possible actions:
// - buyer signs and uses sellers stamp (releaseBySeller)
// - buyer signs and uses arbiters stamp (releaseByArbiter)
// - seller signs and uses buyers stamp (returnByBuyer)
// - seller signs and uses arbiters stamp (returnByArbiter)
Agriblock.RELEASE_BY_SELLER = 0n;
Agriblock.RELEASE_BY_ARBITER = 1n;
Agriblock.RETURN_BY_BUYER = 2n;
Agriblock.RETURN_BY_ARBITER = 3n;
__decorate([
    (0, scrypt_ts_1.prop)()
], Agriblock.prototype, "seller", void 0);
__decorate([
    (0, scrypt_ts_1.prop)()
], Agriblock.prototype, "buyer", void 0);
__decorate([
    (0, scrypt_ts_1.prop)()
], Agriblock.prototype, "arbiter", void 0);
__decorate([
    (0, scrypt_ts_1.prop)()
], Agriblock.prototype, "escrowNonce", void 0);
__decorate([
    (0, scrypt_ts_1.method)()
], Agriblock.prototype, "spend", null);
//# sourceMappingURL=agriblock5.js.map