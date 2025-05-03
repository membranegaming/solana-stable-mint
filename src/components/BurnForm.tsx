
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { getSolPrice, burnSOLUSD, getSOLUSDBalance } from '@/utils/solanaUtils';
import { toast } from 'sonner';
import { ArrowRightIcon, WalletIcon, FlameIcon } from 'lucide-react';

export const BurnForm = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [solusdAmount, setSolusdAmount] = useState<string>('');
  const [solAmount, setSolAmount] = useState<number | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [solusdBalance, setSolusdBalance] = useState<number | null>(null);
  
  // Get SOL price and user balances when component mounts or wallet changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const price = await getSolPrice();
        setSolPrice(price);
        
        // Get SOLUSD balance if wallet is connected
        if (publicKey) {
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
  
  // Calculate SOL amount when SOLUSD amount or price changes
  useEffect(() => {
    if (solusdAmount && solPrice) {
      setSolAmount(parseFloat(solusdAmount) / solPrice);
    } else {
      setSolAmount(null);
    }
  }, [solusdAmount, solPrice]);
  
  const handleBurn = async () => {
    if (!publicKey || !solusdAmount || isNaN(parseFloat(solusdAmount))) return;
    
    setLoading(true);
    try {
      // Burn SOLUSD tokens
      await burnSOLUSD(connection, publicKey, parseFloat(solusdAmount));
      
      toast.success('Successfully burned SOLUSD!', {
        description: `${solusdAmount} SOLUSD has been burned from your wallet`,
      });
      
      // Refresh SOLUSD balance
      const solusdBal = await getSOLUSDBalance(connection, publicKey);
      setSolusdBalance(solusdBal);
      
      // Reset input
      setSolusdAmount('');
    } catch (error) {
      console.error('Error burning SOLUSD:', error);
      toast.error('Failed to burn SOLUSD', {
        description: 'Please try again or check the console for details.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return null;
  }

  return (
    <Card className="w-full max-w-md border-solana-purple border-opacity-50 bg-opacity-10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">Burn SOLUSD</CardTitle>
        <CardDescription className="text-gray-300">
          Convert your SOLUSD back to SOL
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-5">
          <div className="flex justify-between mb-1">
            <Label htmlFor="solusdAmount" className="text-gray-200">SOLUSD Amount</Label>
            {solusdBalance !== null && (
              <span className="text-xs text-gray-400">
                Balance: {solusdBalance.toFixed(2)} SOLUSD
              </span>
            )}
          </div>
          <Input
            id="solusdAmount"
            placeholder="Enter SOLUSD amount"
            value={solusdAmount}
            onChange={(e) => setSolusdAmount(e.target.value)}
            className="bg-black bg-opacity-50 border-solana-green text-white"
          />
        </div>
        
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute left-0 right-0 border-t border-gray-700"></div>
          <div className="relative bg-black bg-opacity-60 px-4 py-1 rounded-full">
            <ArrowRightIcon className="h-5 w-5 text-solana-purple" />
          </div>
        </div>
        
        <div className="mb-5">
          <div className="flex justify-between mb-1">
            <Label htmlFor="solAmount" className="text-gray-200">SOL Amount (Estimated)</Label>
          </div>
          <div className="relative">
            <Input
              id="solAmount"
              readOnly
              value={solAmount ? solAmount.toFixed(6) : '0.000000'}
              className="bg-black bg-opacity-50 border-solana-purple text-white"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-sm text-gray-400">SOL</span>
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
          onClick={handleBurn}
          disabled={!solusdAmount || parseFloat(solusdAmount) <= 0 || loading || !publicKey || (solusdBalance !== null && parseFloat(solusdAmount) > solusdBalance)}
          className="w-full bg-gradient-to-r from-red-500 to-solana-purple hover:from-solana-purple hover:to-red-500 text-white"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center">
              <FlameIcon className="mr-2 h-4 w-4" />
              Burn SOLUSD
            </div>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
