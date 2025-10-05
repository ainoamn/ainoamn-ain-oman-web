// src/hooks/useRecommendations.ts
export const useRecommendations = (auctionId: string, userId?: string) => {
  const [recommendations, setRecommendations] = useState<Property[]>([]);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // استدعاء API الذكاء الاصطناعي للحصول على توصيات
        const response = await fetch(`/api/ai/recommendations/${auctionId}?userId=${userId}`);
        const data = await response.json();
        setRecommendations(data.recommendations);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
      }
    };
    
    fetchRecommendations();
  }, [auctionId, userId]);
  
  return recommendations;
};