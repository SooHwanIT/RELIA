import { ShoppingCart, User, History, ArrowRightLeft } from 'lucide-react';

interface UsedItem {
  id: number;
  tokenId: string;
  price: number;
  seller: string;
  owners: number; // 거래 횟수
  date: string;
}

export default function UsedMarketSection({ originalPrice }: { originalPrice: number }) {
  // Mock Data: 다양한 거래 횟수의 매물들
  const usedItems: UsedItem[] = [
    { id: 1, tokenId: '#1092', price: 34000, seller: 'GamerOne', owners: 0, date: '방금 전' },
    { id: 2, tokenId: '#0042', price: 29000, seller: 'RetroLove', owners: 2, date: '10분 전' },
    { id: 3, tokenId: '#8821', price: 22000, seller: 'FastSeller', owners: 6, date: '1시간 전' },
    { id: 4, tokenId: '#1234', price: 15000, seller: 'PoorMan', owners: 12, date: '5시간 전' },
    { id: 5, tokenId: '#0003', price: 4500, seller: 'ZombiePC', owners: 24, date: '1일 전' },
  ];

  // 거래 횟수에 따른 은은한 스타일 반환 (텍스트/아이콘 색상만 변경)
  const getWearColor = (owners: number) => {
    if (owners === 0) return 'text-emerald-400'; // 신품급
    if (owners < 5) return 'text-blue-400';      // 양호
    if (owners < 10) return 'text-yellow-500';   // 사용감 있음
    return 'text-red-500';                       // 많이 거래됨
  };

  return (
    <div className="mt-16 border-t border-white/5 pt-8">
      <h2 className="text-xl font-bold text-[#e1e1e1] mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-[#ff3f3f] inline-block"></span>
        유저 판매 리스트
      </h2>

      {/* 리스트 헤더 (Table Header) */}
      <div className="grid grid-cols-12 gap-4 text-xs text-gray-500 uppercase font-bold tracking-wider px-4 pb-2 border-b border-white/10">
        <div className="col-span-4 md:col-span-3">판매자</div>
        <div className="col-span-3 md:col-span-2">거래 이력</div>
        <div className="col-span-2 hidden md:block">등록일</div>
        <div className="col-span-3 md:col-span-3 text-right">가격</div>
        <div className="col-span-2 md:col-span-2 text-center">구매</div>
      </div>

      {/* 리스트 바디 */}
      <div className="flex flex-col gap-1">
        {usedItems.map((item) => {
          const discountRate = Math.round(((originalPrice - item.price) / originalPrice) * 100);
          const wearColor = getWearColor(item.owners);
          
          // 거래 횟수가 매우 많으면 전체적으로 약간 투명하게 처리 (Digital Decay)
          const rowOpacity = item.owners > 15 ? 'opacity-60 hover:opacity-100' : 'opacity-100';

          return (
            <div 
              key={item.id} 
              className={`
                group grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-md 
                bg-[#1e1e1e] border border-transparent hover:border-[#ff3f3f]/30 hover:bg-[#252525] 
                transition-all duration-200 ${rowOpacity}
              `}
            >
              
              {/* 1. 판매자 & SN */}
              <div className="col-span-4 md:col-span-3 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-200">
                  <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs">
                    {item.seller[0]}
                  </div>
                  <span className="truncate">{item.seller}</span>
                </div>
                <span className="text-[10px] text-gray-600 font-mono mt-0.5 ml-8">SN: {item.tokenId}</span>
              </div>

              {/* 2. 거래 이력 (은은한 표시) */}
              <div className="col-span-3 md:col-span-2 flex items-center gap-1.5">
                <ArrowRightLeft size={14} className={`${wearColor} opacity-80`} />
                <span className={`text-sm font-medium ${wearColor === 'text-red-500' ? 'text-gray-400' : 'text-gray-300'}`}>
                  {item.owners === 0 ? '미사용' : `${item.owners}회 거래`}
                </span>
              </div>

              {/* 3. 등록일 (모바일 숨김) */}
              <div className="col-span-2 hidden md:block text-xs text-gray-500">
                {item.date}
              </div>

              {/* 4. 가격 */}
              <div className="col-span-3 md:col-span-3 text-right">
                <div className="text-[#e1e1e1] font-bold">
                  ₩{item.price.toLocaleString()}
                </div>
                {discountRate > 0 && (
                  <div className="text-[10px] text-[#ff3f3f]">
                    -{discountRate}%
                  </div>
                )}
              </div>

              {/* 5. 구매 버튼 */}
              <div className="col-span-2 md:col-span-2 flex justify-center">
                <button className="p-2 rounded bg-white/5 hover:bg-[#ff3f3f] text-gray-300 hover:text-white transition-colors">
                  <ShoppingCart size={18} />
                </button>
              </div>

            </div>
          );
        })}
      </div>
      
      {/* 더보기 버튼 */}
      <button className="w-full py-3 mt-4 text-sm text-gray-500 hover:text-[#e1e1e1] hover:bg-white/5 rounded transition-colors">
        매물 더보기 (24개)
      </button>
    </div>
  );
}