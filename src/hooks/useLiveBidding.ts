// src/hooks/useLiveBidding.ts
import { useEffect, useState } from 'react';
import type { Bid } from '@/types/auction';

export const useLiveBidding = (auctionId: string) => {
  const [currentBid, setCurrentBid] = useState(0);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [connection, setConnection] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/auctions/${auctionId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_BID') {
        setCurrentBid(data.amount);
        setBidHistory(prev => [data.bid, ...prev.slice(0, 9)]);
      }
    };
    
    setConnection(ws);
    
    return () => {
      ws.close();
    };
  }, [auctionId]);
  
  const placeBid = (amount: number) => {
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({
        type: 'PLACE_BID',
        amount
      }));
    }
  };
  
  return { currentBid, bidHistory, placeBid };
};
