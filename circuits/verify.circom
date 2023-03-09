pragma circom 2.0.0;

include "../circom-ecdsa/circuits/ecdsa.circom";

template SignatureVerifier(n, k) {
    // recoverable ecdsa signature parts
    signal input r[k];
    signal input s[k];
    // keccak hash of the message
    signal input msghash[k];
    // pubkey input as point x & y
    signal input pubkey[2][k];

    // outputs 1 if signature is valid, 0 otherwise
    signal output out;

    component verifySignature = ECDSAVerifyNoPubkeyCheck(n, k);

    for (var i = 0; i < k; i++) {
        verifySignature.r[i] <== r[i];
        verifySignature.s[i] <== s[i];
        verifySignature.msghash[i] <== msghash[i];

        // copy pubkey point x & y
        verifySignature.pubkey[0][i] <== pubkey[0][i];
        verifySignature.pubkey[1][i] <== pubkey[1][i];
    }

    out <== verifySignature.result;
}

component main { public [r,s,msghash,pubkey]} = SignatureVerifier(64, 4);
