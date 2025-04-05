import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography';
import keyPairJson from '../../../keypair.json';

/**
 * Global variables
 */
const { secretKey } = decodeSuiPrivateKey(keyPairJson.privateKey);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);

const PACKAGE_ADDRESS = '0xd248529875b87491c2d1cabd8ab1813afa3e97f8e44ff174f466f350ecbcee3f';

const rpcUrl = getFullnodeUrl('devnet');
const suiClient = new SuiClient({ url: rpcUrl });

const main = async () => {
  // Task 1: Create a new Transaction instance
  const tx = new Transaction();

  const nameBytes = new TextEncoder().encode("Suiet NFT");
  const descriptionBytes = new TextEncoder().encode("Suiet Sample NFT");
  const urlBytes = new TextEncoder().encode(
    "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
  );

  console.log("nameBytes", nameBytes);
  console.log("descriptionBytes", descriptionBytes);
  console.log("urlBytes", urlBytes);
  const nft = tx.moveCall({
    target: `${PACKAGE_ADDRESS}::NFTModule::new`,
    arguments: [
      // tx.pure(nameBytes),         // Name for the NFT (converted to Uint8Array)
      // tx.pure(descriptionBytes),  // Description for the NFT (converted to Uint8Array)
      // tx.pure(urlBytes),          // URL (converted to Uint8Array)
    ],
  });

  // Task 2: Transfer the returned NFT object to your address
  tx.transferObjects([nft], keypair.getPublicKey().toSuiAddress());

  // Task 3: Sign and execute the transaction
  try {
    const result = await suiClient.signAndExecuteTransaction(
      { signer: keypair, transaction: tx }
    )
    await suiClient.waitForTransaction({ digest: result.digest });
    
    console.log('Transaction Result:', result);
  } catch (error) {
    console.error('Error executing transaction:', error);
  }
};

main();
