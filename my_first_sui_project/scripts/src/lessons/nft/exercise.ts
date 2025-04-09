import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import { bcs } from '@mysten/bcs';
import keyPairJson from '../../../keypair.json';

// Configuration
const PACKAGE_ID = "0xcf7aa4af593290d9552ccf225c777697c7113c6722b417bcdb1965417a94f550";
const MODULE = "document";
const NETWORK = "devnet";

// Initialize client
const client = new SuiClient({ url: getFullnodeUrl(NETWORK) });

// Helper to get keypair from private key
function getKeypair(): Ed25519Keypair {
  const { secretKey } = decodeSuiPrivateKey(keyPairJson.privateKey);
  return Ed25519Keypair.fromSecretKey(secretKey);
}

// Register a Document
export async function registerDocument(docHash: string, cid: string) {
  const keypair = getKeypair();
  const txb = new Transaction();

  // Convert and serialize using proper BCS methods
  // const docHashBytes = bcs.hex().serialize(docHash);
  const docHashBytes = bcs.string().serialize(docHash);
  const cidBytes = bcs.string().serialize(cid);

  txb.moveCall({
    target: `${PACKAGE_ID}::${MODULE}::register_document`,
    arguments: [
      txb.pure(docHashBytes),
      txb.pure(cidBytes),
    ],
  });

  txb.setGasBudget(50_000_000); // 0.05 SUI

  return client.signAndExecuteTransaction({
    signer: keypair,
    transaction: txb,
    options: { showEvents: true },
  });
}

// Sign a Document
export async function signDocument(docHash: string, signature: string) {
  const keypair = getKeypair();
  const txb = new Transaction();

  // Convert and serialize using proper BCS methods
  // const docHashBytes = bcs.hex().serialize(docHash);
  // const signatureBytes = bcs.hex().serialize(signature);
  // bcs.string().serialize('a').toBytes()
  const docHashBytes = bcs.string().serialize(docHash);
  const signatureBytes = bcs.string().serialize(signature);

  txb.moveCall({
    target: `${PACKAGE_ID}::${MODULE}::sign_document`,
    arguments: [
      txb.pure(docHashBytes),
      txb.pure(signatureBytes),
    ],
  });

  txb.setGasBudget(50_000_000); // 0.05 SUI

  return client.signAndExecuteTransaction({
    signer: keypair,
    transaction: txb,
    options: { showEvents: true },
  });
}

// Query Document Events
export async function getDocumentEvents(docHash?: string) {
  const eventFilter = {
    MoveModule: {
      package: PACKAGE_ID,
      module: MODULE,
    },
  };

  const events = await client.queryEvents({
    query: eventFilter,
    limit: 100,
    order: 'descending',
  });

  if (!docHash) return events.data;

  // For comparison, we'll need the raw bytes
  const hashBytes = Array.from(Buffer.from(docHash, 'hex'));
  return events.data.filter(event => {
    const eventData = event.parsedJson as any;
    return (
      JSON.stringify(eventData?.doc_hash) === JSON.stringify(hashBytes)
    );
  });
}

// Example Usage
(async () => {
  try {
    // Example SHA-256 hash (64 hex chars = 32 bytes)
    const docHash = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
    const cid = "QmXYZ123"; // IPFS CID

    console.log("Registering document...");
    const regResult = await registerDocument(docHash, cid);
    console.log("Registration result:", regResult);

    // In a real app, you'd generate this properly using a crypto library
    const signature = "deadbeef12345678deadbeef12345678deadbeef12345678deadbeef12345678";
    
    console.log("Signing document...");
    const signResult = await signDocument(docHash, signature);
    console.log("Signing result:", signResult);

    console.log("Querying events...");
    const events = await getDocumentEvents(docHash);
    console.log("Document events:", events);
  } catch (error) {
    console.error("Error:", error);
  }
})();