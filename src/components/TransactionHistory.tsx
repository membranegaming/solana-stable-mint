
import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getSOLUSDMint } from '@/utils/solanaUtils';
import { CheckIcon, CoinsIcon } from 'lucide-react';

type Transaction = {
  signature: string;
  blockTime: number;
  amount: string;
  type: 'mint' | 'burn';
};

export const TransactionHistory = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) return;
      
      setLoading(true);
      try {
        // Get the mint public key
        const mintPubkey = getSOLUSDMint();
        if (!mintPubkey) {
          setTransactions([]);
          return;
        }
        
        // Get transaction history
        const signatures = await connection.getSignaturesForAddress(publicKey, {
          limit: 10,
        });
        
        // Create mock transactions for testing purposes
        // In a real app, you would parse the actual transaction data from the blockchain
        const mockTransactions = signatures.map((sig, i) => ({
          signature: sig.signature,
          blockTime: sig.blockTime || Math.floor(Date.now() / 1000) - i * 600,
          amount: (Math.random() * 100 + 50).toFixed(2),
          type: Math.random() > 0.3 ? 'mint' : 'burn' as 'mint' | 'burn',
        }));
        
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [connection, publicKey]);

  if (!publicKey) {
    return null;
  }

  return (
    <Card className="w-full max-w-md border-solana-purple border-opacity-50 bg-opacity-10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white">Transaction History</CardTitle>
        <CardDescription className="text-gray-300">
          Recent minting and burning activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-t-transparent border-solana-purple rounded-full animate-spin"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div 
                key={tx.signature} 
                className="flex items-center justify-between p-3 rounded-lg bg-black bg-opacity-25 border border-gray-800"
              >
                <div className="flex items-center">
                  {tx.type === 'mint' ? (
                    <div className="mr-3 h-8 w-8 rounded-full bg-green-900 bg-opacity-30 flex items-center justify-center">
                      <CoinsIcon className="h-4 w-4 text-solana-green" />
                    </div>
                  ) : (
                    <div className="mr-3 h-8 w-8 rounded-full bg-purple-900 bg-opacity-30 flex items-center justify-center">
                      <CoinsIcon className="h-4 w-4 text-solana-purple" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">
                      {tx.type === 'mint' ? 'Minted' : 'Burned'} {tx.amount} SOLUSD
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.blockTime * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
                <a 
                  href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-solana-green hover:underline"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No transactions found
          </div>
        )}
      </CardContent>
    </Card>
  );
};
