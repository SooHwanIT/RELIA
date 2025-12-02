import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { usePublicClient } from 'wagmi';
import { formatEther } from 'viem';
import axios from 'axios';
import { Heart, Share2, ShoppingCart, Loader2 } from 'lucide-react';
import PurchaseModal from '../components/modals/PurchaseModal';
import ContractABI from '../abis/GameMarketplace.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const SERVER_URL = 'http://localhost:3001';

interface GameDetailData {
  id: string; // UUID 문자열로 변경
  title: string;
  desc: string;
  priceKrw: number;
  ethPrice: string;
  discount: number;
  developer: string;
  publisher: string;
  releaseDate: string;
  tags: string[];
  rating: string;
  images: string[];
  supply: number;
  active: boolean;
}

export default function GameDetailPage() {
  const { id } = useParams(); // URL 파라미터에서 UUID 가져옴
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [gameData, setGameData] = useState<GameDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  const publicClient = usePublicClient();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id || !publicClient) return;

    const fetchGameData = async () => {
      setLoading(true);
      try {
        // [핵심 수정] UUID String -> BigInt 변환 로직 추가
        // 예: "f092..." -> "0xf092..." (하이픈 제거)
        const gameIdBigInt = BigInt("0x" + id.replace(/-/g, ""));

        // 1. [Blockchain] 온체인 데이터 조회
        const onChainData: any = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: ContractABI,
          functionName: 'games',
          args: [gameIdBigInt], // 변환된 BigInt 전달
        });

        if (!onChainData || !onChainData[6]) { // onChainData[6] = isActive
           // 블록체인에 없거나 비활성 상태면 에러 처리 또는 예외 처리
           console.warn("블록체인 데이터가 없거나 판매 중지된 게임입니다.");
        }

        const ethPrice = onChainData ? formatEther(onChainData[1]) : "0";
        const currentSupply = onChainData ? Number(onChainData[3]) : 0;
        const maxSupply = onChainData ? Number(onChainData[2]) : 0;
        const remainingSupply = maxSupply - currentSupply;

        // 2. [Server] 메타데이터 조회 (UUID 그대로 사용)
        const metaResponse = await axios.get(`${SERVER_URL}/api/token/${id}`);
        const meta = metaResponse.data;

        // 3. 데이터 병합
        setGameData({
          id: id, // 원본 UUID 유지
          title: meta.name || "Unknown Title",
          desc: meta.description || "설명이 없습니다.",
          priceKrw: Number(ethPrice) * 3500000, 
          ethPrice: ethPrice,
          discount: 0,
          developer: "Studio Unknown",
          publisher: "Web3 Publisher",
          releaseDate: "2024.01.01",
          tags: ["RPG", "Web3", "Action"],
          rating: "15세 이용가",
          images: [
            meta.image || "https://placehold.co/800x450?text=No+Image",
            "https://placehold.co/800x450?text=Gameplay"
          ],
          supply: remainingSupply,
          active: onChainData ? onChainData[6] : false
        });

      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [id, publicClient]);

  if (loading) {
    return (
      <div className="h-screen bg-[#121212] flex items-center justify-center text-white gap-3">
        <Loader2 className="animate-spin text-[#ff3f3f]" /> 데이터를 불러오는 중...
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="h-screen bg-[#121212] flex items-center justify-center text-gray-500">
        게임을 찾을 수 없습니다.
      </div>
    );
  }

  const finalPriceKrw = gameData.priceKrw * (1 - gameData.discount / 100);

  return (
    <div className="h-full bg-[#121212] pt-6 pb-20 overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">
          홈 &gt; 스토어 &gt; <span className="text-[#e1e1e1] font-bold">{gameData.title}</span>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden relative group">
              <img src={gameData.images[0]} alt="Main" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 bg-[#ff3f3f]/90 rounded-full flex items-center justify-center shadow-lg shadow-red-900/30">
                  <span className="ml-1 text-white font-bold text-xl">▶</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1e1e1e] p-8 rounded-lg border border-white/5">
              <h2 className="text-2xl font-bold text-[#e1e1e1] mb-6 border-b border-white/10 pb-4">게임 소개</h2>
              <p className="text-gray-300 leading-relaxed mb-6">{gameData.desc}</p>
              {gameData.images[1] && <img src={gameData.images[1]} alt="Content" className="w-full rounded-lg mb-4" />}
            </div>
          </div>

          {/* Right: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 bg-[#1e1e1e] rounded-lg p-6 shadow-xl border border-white/5">
              <div className="mb-6">
                <span className="inline-block px-2 py-1 rounded bg-gray-700 text-[10px] font-bold text-white mb-2">BASE GAME</span>
                <h1 className="text-2xl font-extrabold text-[#e1e1e1] leading-tight mb-2">{gameData.title}</h1>
              </div>

              <div className="mb-6 bg-[#121212] p-4 rounded-lg flex items-center justify-between border border-white/5">
                {gameData.discount > 0 && <span className="bg-[#ff3f3f] text-white text-sm font-bold px-2 py-1 rounded">-{gameData.discount}%</span>}
                <div className="text-right flex-1">
                  <div className="text-gray-500 line-through text-sm">₩{gameData.priceKrw.toLocaleString()}</div>
                  <div className="text-xl font-bold text-white">
                    {gameData.ethPrice} ETH <span className="text-xs text-gray-500">(≈ ₩{finalPriceKrw.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {gameData.active ? (
                  <button 
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="w-full bg-[#ff3f3f] hover:bg-red-700 text-white font-bold py-3.5 rounded-md transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
                  >
                    <ShoppingCart size={20} />
                    구매 옵션 보기
                  </button>
                ) : (
                  <button disabled className="w-full bg-gray-600 text-white font-bold py-3.5 rounded-md cursor-not-allowed">
                    판매 중지됨
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-md font-bold transition-colors flex items-center justify-center gap-2">
                    <Heart size={18} /> 찜하기
                  </button>
                  <button className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-md transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">남은 수량</span>
                  <span className="text-[#e1e1e1]">{gameData.supply} 장</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">개발사</span>
                  <span className="text-[#e1e1e1]">{gameData.developer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">출시일</span>
                  <span className="text-[#e1e1e1]">{gameData.releaseDate}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal 
        isOpen={isPurchaseModalOpen} 
        onClose={() => setIsPurchaseModalOpen(false)}
        gameId={gameData.id} // UUID String 전달
        gameData={{
          title: gameData.title,
          price: finalPriceKrw,
          ethPrice: gameData.ethPrice,
          image: gameData.images[0]
        }}
      />
    </div>
  );
}