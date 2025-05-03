
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { cn } from '@/lib/utils';

export const WalletConnectionButton = () => {
  const { connected } = useWallet();

  return (
    <div className="flex items-center justify-center">
      <WalletMultiButton
        className={cn(
          "text-sm font-medium relative group flex h-10 w-full items-center justify-center px-4 py-2 rounded-lg",
          "bg-gradient-to-r from-solana-purple to-solana-green text-white shadow-lg transition-all",
          "hover:shadow-xl hover:from-solana-green hover:to-solana-purple",
          !connected && "animate-pulse-slow"
        )}
      />
    </div>
  );
};
