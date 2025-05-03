
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getTokenInfo, getSolPrice } from '@/utils/solanaUtils';
import { CoinsIcon, LayersIcon, PercentIcon } from 'lucide-react';

export const TokenInfo = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokenInfo, setTokenInfo] = useState<{
    address: string | null;
    decimals: number;
    supply: number;
    created: boolean;
  } | null>(null);
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const info = await getTokenInfo(connection);
        setTokenInfo(info);
        
        const price = await getSolPrice();
        setSolPrice(price);
      } catch (error) {
        console.error('Error fetching token info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchData, 30000);
    
    return () => clearInterval(intervalId);
  }, [connection]);

  if (loading) {
    return (
      <Card className="w-full max-w-md border-solana-purple border-opacity-50 bg-opacity-10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-white">SOLUSD Info</CardTitle>
          <CardDescription className="text-gray-300">Loading token information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-t-transparent border-solana-purple rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-solana-purple border-opacity-50 bg-opacity-10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">SOLUSD Info</CardTitle>
        <CardDescription className="text-gray-300">
          Stablecoin token information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-black bg-opacity-25 border border-gray-800">
            <div className="flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-green-900 bg-opacity-30 flex items-center justify-center">
                <CoinsIcon className="h-4 w-4 text-solana-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Current Supply</p>
              </div>
            </div>
            <p className="text-md font-semibold text-solana-green">
              {tokenInfo?.supply.toLocaleString() || "0"} SOLUSD
            </p>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-black bg-opacity-25 border border-gray-800">
            <div className="flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-purple-900 bg-opacity-30 flex items-center justify-center">
                <PercentIcon className="h-4 w-4 text-solana-purple" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Exchange Rate</p>
              </div>
            </div>
            <p className="text-md font-semibold text-solana-purple">
              1 SOL = {solPrice?.toLocaleString() || "30"} SOLUSD
            </p>
          </div>
          
          <div className="flex items-center justify-between p-3 rounded-lg bg-black bg-opacity-25 border border-gray-800">
            <div className="flex items-center">
              <div className="mr-3 h-8 w-8 rounded-full bg-blue-900 bg-opacity-30 flex items-center justify-center">
                <LayersIcon className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Token Address</p>
              </div>
            </div>
            <div className="max-w-[180px] truncate">
              {tokenInfo?.address ? (
                <a 
                  href={`https://explorer.solana.com/address/${tokenInfo.address}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-solana-green hover:underline truncate"
                >
                  {tokenInfo.address}
                </a>
              ) : (
                <span className="text-xs text-gray-400">Not created yet</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-400">
          <p>This is a devnet token for testing purposes only</p>
          <p className="mt-1">100% collateralized by devnet SOL</p>
        </div>
      </CardContent>
    </Card>
  );
};
