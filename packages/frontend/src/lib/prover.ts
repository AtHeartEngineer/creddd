import {
  MembershipProver,
  MembershipVerifier,
  Poseidon,
  Tree,
  defaultPubkeyMembershipPConfig,
  defaultPubkeyMembershipVConfig,
} from '@personaelabs/spartan-ecdsa';
import { hashPersonalMessage } from '@ethereumjs/util';

const prover = async () => {
  // Init the Poseidon hash
  const poseidon = new Poseidon();
  await poseidon.initWasm();

  const treeDepth = 20; // Provided circuits have tree depth = 20
  const tree = new Tree(treeDepth, poseidon);

  const proverPubKey = Buffer.from('...');
  // Get the prover public key hash
  const proverPubkeyHash = poseidon.hashPubKey(proverPubKey);

  // Insert prover public key hash into the tree
  tree.insert(proverPubkeyHash);

  // Insert other members into the tree
  for (const member of ['🕵️', '🥷', '👩‍🔬']) {
    tree.insert(poseidon.hashPubKey(Buffer.from(''.padStart(16, member), 'utf16le')));
  }

  // Compute the merkle proof
  const index = tree.indexOf(proverPubkeyHash);
  const merkleProof = tree.createProof(index);

  // Init the prover
  const prover = new MembershipProver(defaultPubkeyMembershipPConfig);
  await prover.initWasm();

  const sig = '0x...';
  const msgHash = hashPersonalMessage(Buffer.from('harry potter'));
  // Prove membership
  const { proof, publicInput } = await prover.prove(sig, msgHash, merkleProof);

  // Init verifier
  const verifier = new MembershipVerifier(defaultPubkeyMembershipVConfig);
  await verifier.initWasm();

  // Verify proof
  await verifier.verify(proof, publicInput.serialize());
};
