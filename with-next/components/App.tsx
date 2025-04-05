import {
  ConnectButton,
  useAccountBalance,
  useWallet,
  SuiChainId,
  ErrorCode,
  verifySignedMessage
} from "@suiet/wallet-kit";
import { Transaction } from '@mysten/sui/transactions';

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

// use getFullnodeUrl to define Devnet RPC location
const rpcUrl = getFullnodeUrl('devnet');

const suiClient = new SuiClient({ url: rpcUrl });

const PACKAGE_ADDRESS = "0xc73f26821bdefe260aa3a1e2adbbd182e0dedbef48fcc1f993c7e8e7faa8737a"

function App() {
  const wallet = useWallet();
  const { balance } = useAccountBalance();

  async function handleExecuteMoveCall(target: string | undefined) {
    if (!target) return;

    try {
      const tx = new Transaction();

      // Convert strings to Uint8Array for 'vector<u8>' argument type in Move contract
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
        ],
      });

      // Task 2: Transfer the returned NFT object to your address
      tx.transferObjects([nft], wallet.account?.address as string);

      // Task 3: Sign and execute the transaction
      // try {
        const result = await wallet.signAndExecuteTransaction(
          {transaction: tx }
        )
      await suiClient.waitForTransaction({ digest: result.digest });

      console.log('Transaction Result:', result);
    } catch (e) {
      console.error("executeMoveCall failed", e);
      alert("executeMoveCall failed (see response in the console)");
    }
  }

  async function handleSignMsg() {
    if (!wallet.account) return;
    try {
      const msg = "Hello world!";
      const msgBytes = new TextEncoder().encode(msg);
      const result = await wallet.signPersonalMessage({
        message: msgBytes,
      });
      const verifyResult = await wallet.verifySignedMessage(
        result,
        wallet.account.publicKey
      );
      console.log("verify signedMessage", verifyResult);
      if (!verifyResult) {
        alert(`signMessage succeed, but verify signedMessage failed`);
      } else {
        alert(`signMessage succeed, and verify signedMessage succeed!`);
      }
    } catch (e) {
      console.error("signMessage failed", e);
      alert("signMessage failed (see response in the console)");
    }
  }

  const handleSignTxnAndVerifySignature = async (contractAddress: string) => {
    // const txn = new Transaction();
    // txn.moveCall({
    //   target: contractAddress as any,
    //   arguments: [
    //     txn.pure.string("Suiet NFT"),
    //     txn.pure.string("Suiet Sample NFT"),
    //     txn.pure.string(
    //       "https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4"
    //     ),
    //   ],
    // });
    // txn.setSender(wallet.account?.address as string);

    // try {
    //   const signedTxn = await wallet.signTransaction({
    //     transaction: txn,
    //   });

    //   console.log(`Sign and verify txn:`);
    //   console.log("--wallet: ", wallet.adapter?.name);
    //   console.log("--account: ", wallet.account?.address);
    //   const publicKey = wallet.account?.publicKey;
    //   if (!publicKey) {
    //     console.error("no public key provided by wallet");
    //     return;
    //   }
    //   console.log("-- publicKey: ", publicKey);
    //   const pubKey = new Ed25519PublicKey(publicKey);
    //   console.log("-- signed txnBytes: ", signedTxn.bytes);
    //   console.log("-- signed signature: ", signedTxn.signature);
    //   const txnBytes = new Uint8Array(Buffer.from(signedTxn.bytes, "base64"));
    //   const isValid = await pubKey.verifyTransaction(txnBytes, signedTxn.signature);
    //   console.log("-- use pubKey to verify transaction: ", isValid);
    //   if (!isValid) {
    //     alert(`signTransaction succeed, but verify transaction failed`);
    //   } else {
    //     alert(`signTransaction succeed, and verify transaction succeed!`);
    //   }
    // } catch (e) {
    //   console.error("signTransaction failed", e);
    //   alert("signTransaction failed (see response in the console)");
    // }
  };

  const chainName = (chainId: string | undefined) => {
    switch (chainId) {
      case SuiChainId.MAIN_NET:
        return "Mainnet";
      case SuiChainId.TEST_NET:
        return "Testnet";
      case SuiChainId.DEV_NET:
        return "Devnet";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank" rel={"noreferrer"}>
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a
          href="https://github.com/suiet/wallet-kit"
          target="_blank"
          rel={"noreferrer"}
        >
          <img src={"/suiet-logo.svg"} className="logo" alt="Suiet logo" />
        </a>
      </div>
      <h1>Vite + Suiet Kit</h1>
      <div className="card">
        <ConnectButton
          onConnectError={(error) => {
            if (error.code === ErrorCode.WALLET__CONNECT_ERROR__USER_REJECTED) {
              console.warn(
                "user rejected the connection to " + error.details?.wallet
              );
            } else {
              console.warn("unknown connect error: ", error);
            }
          }}
        />

        {!wallet.connected ? (
          <p>Connect DApp with Suiet wallet from now!</p>
        ) : (
          <div>
            <div>
              <p>current wallet: {wallet.adapter?.name}</p>
              <p>
                wallet status:{" "}
                {wallet.connecting
                  ? "connecting"
                  : wallet.connected
                    ? "connected"
                    : "disconnected"}
              </p>
              <p>wallet address: {wallet.account?.address}</p>
              <p>current network: {wallet.chain?.name}</p>
              <p>wallet balance: {String(balance)} SUI</p>
            </div>
            --{PACKAGE_ADDRESS}--
            <div className={"btn-group"} style={{ margin: "8px 0" }}>
              {PACKAGE_ADDRESS && (
                <button onClick={() => handleExecuteMoveCall(PACKAGE_ADDRESS)}>
                  Mint {chainName(wallet.chain?.id)} NFT
                </button>
              )}
              <button onClick={handleSignMsg}>signMessage</button>
              {PACKAGE_ADDRESS && (
                <button onClick={() => handleSignTxnAndVerifySignature(PACKAGE_ADDRESS)}>
                  Sign & Verify Transaction
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="read-the-docs">
        Click on the Vite and Suiet logos to learn more
      </p>
    </div>
  );
}

export default App;