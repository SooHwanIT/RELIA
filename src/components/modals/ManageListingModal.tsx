import { useState } from 'react';
import { X, RefreshCcw, Trash2, Calculator, AlertCircle, Tag } from 'lucide-react';

interface ManageListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    title: string;
    cover: string;
  };
  currentPrice: number;
  onUpdatePrice: (newPrice: number) => void;
  onCancelListing: () => void;
}

export default function ManageListingModal({ 
  isOpen, onClose, game, currentPrice, onUpdatePrice, onCancelListing 
}: ManageListingModalProps) {
  
  const [price, setPrice] = useState<string>(currentPrice.toString());

  if (!isOpen) return null;

  const inputPrice = Number(price.replace(/[^0-9]/g, ''));
  const platformFee = Math.floor(inputPrice * 0.05);
  const creatorRoyalty = Math.floor(inputPrice * 0.10);
  const netProfit = inputPrice - (platformFee + creatorRoyalty);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value.replace(/[^0-9]/g, ''));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1e1e1e] w-full max-w-md rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="font-bold text-white text-lg">판매 등록 관리</h3>
          <button onClick={onClose}><X className="text-gray-500 hover:text-white" /></button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Game Info */}
          <div className="flex gap-4 items-center bg-[#121212] p-3 rounded-lg border border-white/5">
            <img src={game.cover} className="w-12 h-16 object-cover rounded" />
            <div>
              <div className="text-xs text-[#ff3f3f] font-bold mb-0.5">판매 대기중</div>
              <div className="font-bold text-white text-sm">{game.title}</div>
              <div className="text-xs text-gray-500">현재 등록가: ₩{currentPrice.toLocaleString()}</div>
            </div>
          </div>

          {/* Price Input */}
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">가격 수정</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₩</span>
              <input 
                type="text" 
                value={Number(price).toLocaleString()}
                onChange={handlePriceChange}
                className="w-full bg-[#252525] text-white font-bold pl-8 pr-4 py-3 rounded-lg border border-white/10 focus:border-[#ff3f3f] outline-none"
              />
            </div>
          </div>

          {/* Calc Preview */}
          <div className="text-xs space-y-2 text-gray-500 bg-[#252525]/50 p-4 rounded border border-white/5">
            <div className="flex justify-between"><span>수수료 합계 (15%)</span><span>- ₩{(platformFee + creatorRoyalty).toLocaleString()}</span></div>
            <div className="flex justify-between text-white font-bold border-t border-white/10 pt-2">
              <span>예상 정산금</span><span>₩{netProfit.toLocaleString()}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button 
              onClick={() => { onCancelListing(); onClose(); }}
              className="flex-1 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 size={16} /> 판매 취소
            </button>
            <button 
              onClick={() => { onUpdatePrice(inputPrice); onClose(); }}
              className="flex-1 py-3 bg-white text-black hover:bg-gray-200 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCcw size={16} /> 가격 수정
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}