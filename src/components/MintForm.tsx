
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getSolPrice, mintSOLUSD, getSOLUSDBalance } from '@/utils/solanaUtils';
import { toast } from 'sonner';
import { CheckIcon, ArrowRightIcon, WalletIcon, SendIcon } from 'lucide-react';

export const MintForm = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [solAmount, setSolAmount] = useState<string>('');
  const [solusdAmount, setSolusdAmount] = useState<number | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [solusdBalance, setSolusdBalance] = useState<number | null>(null);
  const [solBalance, setSolBalance] = useState<number | null>(null);
  
  // Get SOL price and user balances when component mounts or wallet changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const price = await getSolPrice();
        setSolPrice(price);
        
        // Get SOL balance if wallet is connected
        if (publicKey) {
          const solBalanceResponse = await connection.getBalance(publicKey);
          setSolBalance(solBalanceResponse / LAMPORTS_PER_SOL);
          
          // Get SOLUSD balance
          const solusdBal = await getSOLUSDBalance(connection, publicKey);
          setSolusdBalance(solusdBal);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
    
    // Set up interval to refresh balances
    const intervalId = setInterval(fetchData, 10000);
    
    return () => clearInterval(intervalId);
  }, [connection, publicKey]);
  
  // Calculate SOLUSD amount when SOL amount or price changes
  useEffect(() => {
    if (solAmount && solPrice) {
      setSolusdAmount(parseFloat(solAmount) * solPrice);
    } else {
      setSolusdAmount(null);
    }
  }, [solAmount, solPrice]);
  
  const handleMint = async () => {
    if (!publicKey || !solAmount || isNaN(parseFloat(solAmount))) return;
    
    setLoading(true);
    try {
      // Convert SOL amount to lamports
      const lamports = parseFloat(solAmount) * LAMPORTS_PER_SOL;
      
      // Mint SOLUSD tokens
      await mintSOLUSD(connection, publicKey, parseFloat(solAmount));
      
      toast.success('Successfully minted SOLUSD!', {
        description: `${solusdAmount?.toFixed(2)} SOLUSD has been added to your wallet`,
      });
      
      // Refresh balances
      const solBalanceResponse = await connection.getBalance(publicKey);
      setSolBalance(solBalanceResponse / LAMPORTS_PER_SOL);
      
      const solusdBal = await getSOLUSDBalance(connection, publicKey);
      setSolusdBalance(solusdBal);
      
      // Reset input
      setSolAmount('');
    } catch (error) {
      console.error('Error minting SOLUSD:', error);
      toast.error('Failed to mint SOLUSD', {
        description: 'Please try again or check the console for details.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <Card className="w-full max-w-md border-solana-purple border-opacity-50 bg-opacity-10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">Mint SOLUSD</CardTitle>
          <CardDescription className="text-gray-300">
            Connect your wallet to mint SOLUSD tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <WalletIcon className="h-16 w-16 text-solana-purple opacity-60" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-solana-purple border-opacity-50 bg-opacity-10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Mint SOLUSD</CardTitle>
        <CardDescription className="text-gray-300">
          Convert your SOL to SOLUSD stablecoin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5">
          <div className="flex justify-between mb-1">
            <Label htmlFor="solAmount" className="text-gray-200">SOL Amount</Label>
            {solBalance !== null && (
              <span className="text-xs text-gray-400">
                Balance: {solBalance.toFixed(4)} SOL
              </span>
            )}
          </div>
          <Input
            id="solAmount"
            placeholder="Enter SOL amount"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            className="bg-black bg-opacity-50 border-solana-purple text-white"
          />
        </div>
        
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute left-0 right-0 border-t border-gray-700"></div>
          <div className="relative bg-black bg-opacity-60 px-4 py-1 rounded-full">
            <ArrowRightIcon className="h-5 w-5 text-solana-green" />
          </div>
        </div>
        
        <div className="mb-5">
          <div className="flex justify-between mb-1">
            <Label htmlFor="solusdAmount" className="text-gray-200">SOLUSD Amount</Label>
            {solusdBalance !== null && (
              <span className="text-xs text-gray-400">
                Balance: {solusdBalance.toFixed(2)} SOLUSD
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              id="solusdAmount"
              readOnly
              value={solusdAmount ? solusdAmount.toFixed(2) : '0.00'}
              className="bg-black bg-opacity-50 border-solana-green text-white"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-sm text-gray-400">SOLUSD</span>
            </div>
          </div>
        </div>
        
        {solPrice && (
          <div className="mt-2 text-center text-sm text-gray-300">
            Current Exchange Rate: 1 SOL = {solPrice.toFixed(2)} SOLUSD
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleMint}
          disabled={!solAmount || parseFloat(solAmount) <= 0 || loading || !publicKey}
          className="w-full bg-gradient-to-r from-solana-purple to-solana-green hover:from-solana-green hover:to-solana-purple text-white"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center">
              <SendIcon className="mr-2 h-4 w-4" />
              Mint SOLUSD
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
