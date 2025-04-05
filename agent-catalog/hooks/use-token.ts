import { useState, useEffect } from "react";
import { ethers, BigNumberish, EventLog, Log } from "ethers";
import { ERC721_ABI } from "@/utils/abi/erc721";
import { ERC20_ABI } from "@/utils/abi/erc20";
import { UNIPAIR_ABI } from "@/utils/abi/uniswapPair";

// Define Types
interface TokenStats {
  marketCap: number;
  tvl: number;
  price: number;
  volume: number;
  holders: number;
  change24h: number;
}

interface SwapEvent {
  args: { amount0In: BigNumberish; amount1In: BigNumberish };
  blockTimestamp: number;
}

interface TransferEvent {
  args: { to: string };
}

// Ensure environment variables are defined
const INFURA_URL = process.env.NEXT_PUBLIC_INFURA_RPC;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

if (!INFURA_URL || !CONTRACT_ADDRESS) {
  console.error("Missing environment variables: NEXT_PUBLIC_INFURA_URL or NEXT_PUBLIC_CONTRACT_ADDRESS");
  throw new Error("Environment variables not defined.");
}

// Define provider safely to prevent SSR issues
const provider = new ethers.JsonRpcProvider(INFURA_URL);

export function useTokens(tokenId: number) {
  const [stats, setStats] = useState<TokenStats | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [priceHistory, setPriceHistory] = useState<{ x: string; y: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchTokenStats() {
      try {
        if (!CONTRACT_ADDRESS) {
          throw new Error("Contract address is undefined.");
        }

        const nftContract = new ethers.Contract(CONTRACT_ADDRESS, ERC721_ABI, provider);

        // Fetch token data
        let erc20Token, totalSupply, reserve0, reserve1, pairAddress;
        try {
          [erc20Token, totalSupply, reserve0, reserve1, pairAddress] = await nftContract.getTokenData(tokenId);
        } catch (err) {
          throw new Error(`Error fetching token data: ${(err as Error).message}`);
        }

        setTokenAddress(erc20Token);

        if (!erc20Token || !pairAddress) {
          throw new Error("Invalid token data received.");
        }

        const pairContract = new ethers.Contract(pairAddress, UNIPAIR_ABI, provider);
        const tokenContract = new ethers.Contract(erc20Token, ERC20_ABI, provider);

        // Fetch pair contract data
        let token0;
        try {
          token0 = await pairContract.token0();
        } catch (err) {
          throw new Error(`Error fetching token0 from pair contract: ${(err as Error).message}`);
        }

        const aiusReserve = token0 === erc20Token ? reserve1 : reserve0;
        const tokenReserve = token0 === erc20Token ? reserve0 : reserve1;

        if (!aiusReserve || !tokenReserve) {
          throw new Error("Invalid reserve data.");
        }

        // Convert values
        const price = parseFloat(ethers.formatUnits(aiusReserve, 18)) / parseFloat(ethers.formatUnits(tokenReserve, 18));
        const marketCap = price * parseFloat(ethers.formatUnits(totalSupply, 18));
        const tvl = 2 * parseFloat(ethers.formatUnits(aiusReserve, 18));

        // Fetch Swap Events
        let swapEvents: SwapEvent[] = [];
        try {
          const rawSwapEvents = await pairContract.queryFilter(pairContract.filters.Swap(), "latest");
          swapEvents = rawSwapEvents
            .map((event: Log | EventLog) => {
              if (!("args" in event)) return null;
              return {
                args: {
                  amount0In: event.args.amount0In as BigNumberish,
                  amount1In: event.args.amount1In as BigNumberish,
                },
                blockTimestamp: event.blockNumber, // Approximate timestamp
              };
            })
            .filter((e): e is SwapEvent => e !== null);
        } catch (err) {
          console.error("Error fetching swap events:", err);
        }

        // Calculate volume
        const last24hEvents = swapEvents.filter((e) => Date.now() / 1000 - e.blockTimestamp <= 86400);
        const volume = last24hEvents.reduce(
          (sum, e) =>
            sum +
            parseFloat(ethers.formatUnits(e.args.amount0In, 18)) +
            parseFloat(ethers.formatUnits(e.args.amount1In, 18)),
          0
        );

        // Fetch Transfer Events
        let transferEvents: TransferEvent[] = [];
        try {
          const rawTransferEvents = await tokenContract.queryFilter(tokenContract.filters.Transfer(), "latest");
          transferEvents = rawTransferEvents
            .map((event: Log | EventLog) => {
              if (!("args" in event)) return null;
              return { args: { to: event.args.to as string } };
            })
            .filter((e): e is TransferEvent => e !== null);
        } catch (err) {
          console.error("Error fetching transfer events:", err);
        }

        // Count unique holders
        const holders = new Set(transferEvents.map((e) => e.args.to)).size;

        // Fetch price 24h ago
        const timestamp24hAgo = Math.floor(Date.now() / 1000) - 86400;
        const pastSwapEvents = swapEvents.filter((e) => e.blockTimestamp <= timestamp24hAgo);
        const pastPrice = pastSwapEvents.length > 0 ? price : price; // Default to current price if no past price found
        const change24h = pastPrice ? ((price - pastPrice) / pastPrice) * 100 : 0;

        // Extract historical price data
        const sortedSwaps = swapEvents
          .map((e) => ({
            x: new Date(e.blockTimestamp * 1000).toISOString(),
            y:
              parseFloat(ethers.formatUnits(e.args.amount0In, 18)) /
              parseFloat(ethers.formatUnits(e.args.amount1In, 18)),
          }))
          .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime())

        if (isMounted) {
          setStats({ marketCap, tvl, price, volume, holders, change24h })
          setPriceHistory(sortedSwaps) // Set price history
        }
      } catch (err) {
        console.error("Error in fetchTokenStats:", err);
        if (isMounted) {
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTokenStats();

    return () => {
      isMounted = false;
    };
  }, [tokenId]);

  return { stats, priceHistory, tokenAddress, loading, error };
}
