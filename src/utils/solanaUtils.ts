
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { 
  createMint, 
  getOrCreateAssociatedTokenAccount, 
  mintTo,
  getMint,
  getAccount,
} from '@solana/spl-token';
import { toast } from 'sonner';

// For testing purposes, we'll use a mock exchange rate
const MOCK_SOL_PRICE_USD = 30; // $30 per SOL for testing
const MINT_DECIMALS = 6; // USDC-like precision

// Create a keypair for the mint authority on devnet (this is just for testing)
// In a real application, this would be a secure keypair, not hardcoded
const mintAuthority = Keypair.generate();

// Save the mint public key once it's created
let mintKeypair: Keypair | null = null;
let mintPubkey: PublicKey | null = null;

export const getSolPrice = async (): Promise<number> => {
  // In a real application, you would fetch this from an oracle
  // For now, we'll use a mock price
  return MOCK_SOL_PRICE_USD;
};

export const createSOLUSDMint = async (connection: Connection): Promise<PublicKey> => {
  try {
    // If we already have a mint, return it
    if (mintPubkey) {
      return mintPubkey;
    }
    
    // For testing, create a new mint keypair
    mintKeypair = Keypair.generate();
    
    // Create the mint
    mintPubkey = await createMint(
      connection,
      mintAuthority, // Payer
      mintAuthority.publicKey, // Mint authority
      mintAuthority.publicKey, // Freeze authority (we use the same key)
      MINT_DECIMALS
    );
    
    console.log(`SOLUSD mint created: ${mintPubkey.toString()}`);
    return mintPubkey;
  } catch (error) {
    console.error('Error creating SOLUSD mint:', error);
    throw error;
  }
};

export const getSOLUSDMint = (): PublicKey | null => {
  return mintPubkey;
};

export const mintSOLUSD = async (
  connection: Connection,
  userPublicKey: PublicKey,
  solAmount: number
): Promise<string> => {
  try {
    // Make sure we have a mint
    if (!mintPubkey || !mintKeypair) {
      mintPubkey = await createSOLUSDMint(connection);
    }

    // Calculate SOLUSD amount based on SOL amount and price
    const solPrice = await getSolPrice();
    const solusdAmount = solAmount * solPrice;
    
    // Create or get the user's token account
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      mintAuthority,  // Payer for the transaction
      mintPubkey,
      userPublicKey
    );
    
    // Mint SOLUSD tokens to the user's token account
    const mintSignature = await mintTo(
      connection,
      mintAuthority,  // Payer for transaction
      mintPubkey,     // Token mint
      tokenAccount.address, // Destination account
      mintAuthority,  // Mint authority
      solusdAmount * Math.pow(10, MINT_DECIMALS) // Amount to mint with decimal precision
    );
    
    console.log(`SOLUSD minted to ${userPublicKey.toString()}: ${solusdAmount}`);
    console.log(`Transaction signature: ${mintSignature}`);
    
    return mintSignature;
  } catch (error) {
    console.error('Error minting SOLUSD:', error);
    toast.error('Error minting SOLUSD. Check console for details.');
    throw error;
  }
};

export const getSOLUSDBalance = async (
  connection: Connection,
  userPublicKey: PublicKey
): Promise<number> => {
  try {
    // If no mint exists yet, return 0
    if (!mintPubkey) {
      return 0;
    }
    
    // Find the user's token account for SOLUSD
    try {
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        mintAuthority, // Payer
        mintPubkey,
        userPublicKey
      );
      
      // Get account info
      const accountInfo = await getAccount(connection, tokenAccount.address);
      
      // Return balance with correct decimal precision
      return Number(accountInfo.amount) / Math.pow(10, MINT_DECIMALS);
    } catch (error) {
      // If the account doesn't exist yet, return 0
      return 0;
    }
  } catch (error) {
    console.error('Error getting SOLUSD balance:', error);
    return 0;
  }
};
