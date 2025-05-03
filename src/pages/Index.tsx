
import { WalletContextProvider } from '@/context/WalletContextProvider';
import { WalletConnectionButton } from '@/components/WalletConnectionButton';
import { MintForm } from '@/components/MintForm';
import { BurnForm } from '@/components/BurnForm';
import { TransactionHistory } from '@/components/TransactionHistory';
import { TokenInfo } from '@/components/TokenInfo';
import { useWallet } from '@solana/wallet-adapter-react';

const AppContent = () => {
  const { publicKey } = useWallet();
  
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <header className="py-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-solana-purple to-solana-green text-transparent bg-clip-text mr-2">
            SOLUSD
          </h1>
          <span className="bg-gray-800 text-xs px-2 py-1 rounded-full text-gray-300">
            Devnet
          </span>
        </div>
        <div className="w-44">
          <WalletConnectionButton />
        </div>
      </header>
      
      <main className="mt-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Solana Stablecoin</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            A decentralized, SOL-backed stablecoin for testing on Solana devnet
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <TokenInfo />
          {publicKey ? (
            <div className="flex flex-col gap-8">
              <MintForm />
              <BurnForm />
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-black bg-opacity-20 rounded-lg border border-gray-800 p-6">
              <p className="text-center text-gray-400">
                Connect your wallet to mint and burn SOLUSD tokens
              </p>
            </div>
          )}
        </div>
        
        {publicKey && (
          <div className="mt-8">
            <TransactionHistory />
          </div>
        )}
      </main>
      
      <footer className="mt-16 mb-8 text-center text-sm text-gray-500">
        <p>This is a testing application running on Solana Devnet</p>
        <p className="mt-2">© {new Date().getFullYear()} SOLUSD - Decentralized Stablecoin</p>
      </footer>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-solana-purple/20 to-transparent pointer-events-none"></div>
      <WalletContextProvider>
        <AppContent />
      </WalletContextProvider>
    </div>
  );
};

export default Index;
