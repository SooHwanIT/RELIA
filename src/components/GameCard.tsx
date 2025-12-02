import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';

interface GameCardProps {
  game: {
    id: number;
    title: string;
    image: string;
    price: string;
    category: string;
    supply: number;
  }
}

export default function GameCard({ game }: GameCardProps) {
  const navigate = useNavigate();

  // 상세 페이지로 이동 핸들러
  const handleGoToDetail = () => {
    // GameDetailPage 라우트로 이동 (예: /store/1)
    navigate(`/store/${game.id}`);
  };

  return (
    <div 
      onClick={handleGoToDetail}
      className="bg-[#1e1e1e] rounded-lg overflow-hidden hover:translate-y-[-5px] transition-all duration-300 border border-white/5 hover:border-[#ff3f3f]/50 group cursor-pointer"
    >
      {/* 썸네일 */}
      <div className="aspect-video w-full relative overflow-hidden">
        <img src={game.image} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
          {game.category}
        </div>
      </div>

      {/* 정보 영역 */}
      <div className="p-4">
        <h3 className="text-white font-bold mb-1 truncate group-hover:text-[#ff3f3f] transition-colors">{game.title}</h3>
        <div className="flex justify-between items-center mt-3">
          <div className="text-gray-400 text-xs">남은 수량: {game.supply}</div>
          <div className="text-[#ff3f3f] font-bold">{game.price} ETH</div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭 이벤트 버블링 방지
            handleGoToDetail();
          }}
          className="w-full mt-4 py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors bg-white/10 hover:bg-[#ff3f3f] text-white"
        >
          <Eye size={16} /> 상세 보기
        </button>
      </div>
    </div>
  );
}