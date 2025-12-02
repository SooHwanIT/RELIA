import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import axios from 'axios';
import { Search, Filter, Loader2 } from 'lucide-react';

import GameCard from '../components/GameCard';
import ContractABI from '../abis/GameMarketplace.json'; 

const rawAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;
const CONTRACT_ADDRESS = rawAddress ? (rawAddress.replace(/["';\s]/g, "") as `0x${string}`) : undefined;
const SERVER_URL = 'http://localhost:3001';

interface GameData {
  id: string; // UUID String
  title: string;
  price: string;
  category: string;
  image: string;
  desc: string;
  supply: number;
}

export default function StorePage() {
  const [activeTab, setActiveTab] = useState("전체");
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(true);

  const publicClient = usePublicClient();
  const categories = ["전체", "액션", "RPG", "전략", "스포츠", "인디", "시뮬레이션", "공포"];

  useEffect(() => {
    if (!CONTRACT_ADDRESS || !publicClient) {
      setLoading(false);
      return;
    }

    const fetchGames = async () => {
      try {
        setLoading(true);
        
        // 1. [Server] 모든 게임 메타데이터(UUID 포함) 가져오기
        const response = await axios.get(`${SERVER_URL}/api/games`);
        const serverGames = response.data; // [{ id: "uuid...", name: "...", ... }]

        if (!Array.isArray(serverGames)) throw new Error("서버 응답 형식 오류");

        const loadedGames: GameData[] = [];

        // 2. [Blockchain] 각 게임의 온체인 데이터 조회 (병렬 처리)
        await Promise.all(serverGames.map(async (meta: any) => {
          try {
            // UUID String -> BigInt 변환 (하이픈 제거 후 16진수로 해석)
            const uuidBigInt = BigInt("0x" + meta.id.replace(/-/g, ""));

            const data: any = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: ContractABI,
              functionName: 'games',
              args: [uuidBigInt]
            });

            // data: [id, originalPrice, maxSupply, currentSupply, royalty, developer, isActive]
            if (!data || !data[6]) return; // 판매 중지됨

            loadedGames.push({
              id: meta.id, // ID는 원본 UUID 유지
              title: meta.name || "Unknown",
              price: formatEther(data[1]),
              category: meta.category || "기타",
              image: meta.image || "https://placehold.co/600x400?text=No+Image",
              desc: meta.description || "",
              supply: Number(data[2]) - Number(data[3])
            });
          } catch (err) {
            console.warn(`Game ${meta.id} on-chain fetch failed:`, err);
          }
        }));
        
        setGames(loadedGames);
      } catch (err) {
        console.error("게임 목록 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [publicClient]);

  const filteredGames = games.filter(game => {
    const categoryMatch = activeTab === "전체" || game.category === activeTab;
    const searchMatch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="px-8 py-8 pb-20 min-h-screen bg-[#121212]">
      {/* 헤더 & 검색 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-extrabold text-white">스토어</h2>
        <div className="flex gap-2">
           <button className="flex items-center gap-2 px-4 py-2 bg-[#1e1e1e] rounded text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors border border-white/5">
             <Filter size={16} /> 필터
           </button>
           <div className="relative group">
             <input 
               type="text" 
               placeholder="게임 검색..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="bg-[#1e1e1e] text-sm text-white px-4 py-2 pl-9 rounded outline-none border border-white/5 focus:border-[#ff3f3f] transition-colors w-64" 
             />
             <Search size={14} className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-[#ff3f3f] transition-colors" />
           </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button 
            key={cat} 
            onClick={() => setActiveTab(cat)}
            className={`
              px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200
              ${activeTab === cat
                ? 'bg-[#ff3f3f] text-white shadow-lg shadow-red-900/20' 
                : 'bg-[#1e1e1e] text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 게임 목록 */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-gray-400 gap-4">
          <Loader2 className="animate-spin text-[#ff3f3f]" size={40} />
          <p>게임 목록을 불러오는 중입니다...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.length > 0 ? (
            filteredGames.map((game) => (
              // @ts-ignore
              <GameCard key={game.id} game={game} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-gray-500">
              표시할 게임이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}