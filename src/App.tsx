import { useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';

const App = () => {
  const { connected, publicKey, wallet, connect } = useWallet();  // Access the connect function
  const [metaplex, setMetaplex] = useState<Metaplex | null>(null);

  useEffect(() => {
    if (connected && wallet) {
      const connection = new Connection(clusterApiUrl('devnet'));

      // Use walletAdapterIdentity for connected wallet
      const metaplexInstance = Metaplex.make(connection).use(
        walletAdapterIdentity(wallet.adapter)
      );
      setMetaplex(metaplexInstance);

      console.log("Wallet connected:", publicKey?.toBase58());
      
      
    } else {
      setMetaplex(null);
    }
  }, [connected, wallet, publicKey]);

  const mintNFT = async () => {
    if (!connected) {
      // If wallet is not connected, explicitly connect it
      try {
        await connect();
      } catch (error) {
        console.error("Error connecting wallet:", error);
        return;
      }
    }

    if (!metaplex || !publicKey) return;

    // Fetch the metadata JSON
    const metadataUri = `${window.location.origin}/metadata.json`;

    try {
      // Mint the NFT
      const { nft } = await metaplex.nfts().create({
        name: "Cat NFT",
        symbol: "LULU",
        uri: metadataUri, // Reference to the metadata file
        sellerFeeBasisPoints: 0, // No seller fee (unsellable)
        creators: [
          {
            address: publicKey, // Use PublicKey object
            share: 100, // Creator gets 100% of the royalties
          },
        ],
        // Ensure the mint account is created and initialized
        isMutable: true, // Allows future updates to metadata
        maxSupply: 1, // Only 1 NFT
      });

      console.log(`NFT Minted: ${nft}`);
    } catch (error) {
      console.error("Error minting NFT:", error);
    }
  };

  return (
    <div>
      <h1>$LULU Solana NFT Drop</h1>
      <WalletMultiButton />
      {connected ? (
        <div>
          <p>Wallet Connected: {publicKey?.toBase58()}</p>
          <button onClick={mintNFT}>Mint NFT</button>
        </div>
      ) : (
        <p>Wallet not connected</p>
      )}
    </div>
  );
};

export default App;
