import { useState, useMemo, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import axios from 'axios';
import { X, ShoppingCart, ArrowRightLeft, CheckCircle2, Sparkles, Filter, Loader2, AlertCircle, Wallet } from 'lucide-react';
import ContractABI from '../../abis/GameMarketplace.json';
import { useNavigate } from 'react-router-dom';

// 환경 변수에서 컨트랙트 주소 및 서버 URL 가져오기
const rawAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;
const CONTRACT_ADDRESS = rawAddress ? (rawAddress.replace(/["';\s]/g, "") as `0x${string}`) : undefined;
const SERVER_URL = 'http://localhost:3001';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string; // UUID String
  gameData: {
    title: string;
    price: number; // 원화 (표시용)
    ethPrice: string; // ETH (결제용)
    image: string;
  };
}

// 매물 데이터 타입
type MarketItem = {
  id: string; 
  type: 'new' | 'used';
  priceEth: string;
  priceKrw: number;
  seller: string;
  sellerAddress?: string;
  owners: number;
  tokenId?: string;
  date?: string;
};

export default function PurchaseModal({ isOpen, onClose, gameId, gameData }: PurchaseModalProps) {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  // Wagmi V2: 트랜잭션 쓰기 훅
  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract();
  
  // 트랜잭션 완료 대기 훅 (블록 확정 기다림)
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash 
  });

  const [sortBy, setSortBy] = useState('price_asc');
  const [usedList, setUsedList] = useState<MarketItem[]>([]);
  const [isLoadingUsed, setIsLoadingUsed] = useState(false);

  // 현재 선택된 매물 (기본값: 신품)
  const [selectedItem, setSelectedItem] = useState<MarketItem>({
    id: 'new',
    type: 'new',
    priceEth: gameData.ethPrice,
    priceKrw: gameData.price,
    seller: 'Official Store',
    owners: 0
  });

  // 모달 열릴 때 초기화 및 중고 매물 로딩
  useEffect(() => {
    if (isOpen) {
      setSelectedItem({
        id: 'new',
        type: 'new',
        priceEth: gameData.ethPrice,
        priceKrw: gameData.price,
        seller: 'Official Store',
        owners: 0
      });
      fetchUsedListings();
    }
  }, [isOpen, gameData]);

  // 구매 성공 시 알림 및 닫기
  useEffect(() => {
    if (isConfirmed) {
      alert(`구매가 완료되었습니다!\nTransaction Hash: ${hash}`);
      onClose();
      // 여기서 페이지를 새로고침하거나 라이브러리 데이터를 갱신하는 로직을 추가할 수 있습니다.
      // window.location.reload(); 
      navigate('/library');
    }
  }, [isConfirmed, hash, onClose]);

  // 에러 발생 시 알림
  useEffect(() => {
    if (writeError) {
      console.error("Transaction failed:", writeError);
      // 사용자가 거부한 경우 등 에러 메시지 처리
      if (!writeError.message.includes("User rejected")) {
        alert("거래 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
      }
    }
  }, [writeError]);

  // 중고 매물 가져오기 (API)
  const fetchUsedListings = async () => {
    setIsLoadingUsed(true);
    try {
      const response = await axios.get(`${SERVER_URL}/api/listings`, {
        params: { gameId }
      });
      
      const listings = response.data.map((item: any) => ({
        id: item._id || item.id,
        type: 'used',
        priceEth: item.priceEth,
        priceKrw: Number(item.priceEth) * 3500000, 
        seller: item.sellerName || 'Unknown',
        sellerAddress: item.sellerAddress,
        owners: item.owners || 1,
        tokenId: `#${item.tokenId}`,
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '최근'
      }));
      
      setUsedList(listings);
    } catch (error) {
      console.warn("중고 매물 로딩 실패:", error);
      setUsedList([]); 
    } finally {
      setIsLoadingUsed(false);
    }
  };

  const sortedUsedList = useMemo(() => {
    let sorted = [...usedList];
    if (sortBy === 'price_asc') sorted.sort((a, b) => Number(a.priceEth) - Number(b.priceEth));
    return sorted;
  }, [sortBy, usedList]);

  // [핵심] 결제 진행 핸들러
  const handlePurchase = () => {
    if (!isConnected) return alert("지갑 연결이 필요합니다. 로그인해주세요.");
    if (!CONTRACT_ADDRESS) return alert("컨트랙트 주소 설정 오류");

    try {
      // UUID String -> BigInt 변환 (0x + 하이픈 제거)
      // 예: "550e8400-..." -> 0x550e8400...
      const gameIdBigInt = BigInt("0x" + gameId.replace(/-/g, ""));

      if (selectedItem.type === 'new') {
        // 1. 신품 구매 (Mint)
        console.log(`Minting Game UUID: ${gameId} (${gameIdBigInt})`);
        
        writeContract({
          address: CONTRACT_ADDRESS,
          abi: ContractABI,
          functionName: 'buyNewGame',
          args: [gameIdBigInt],
          value: parseEther(selectedItem.priceEth), // ETH 전송
        });

      } else {
        // 2. 중고 구매 (Trade)
        if (!selectedItem.sellerAddress) return alert("판매자 주소가 유효하지 않습니다.");
        
        console.log(`Buying Used Game from: ${selectedItem.sellerAddress}`);

        writeContract({
          address: CONTRACT_ADDRESS,
          abi: ContractABI,
          functionName: 'buyUsedGame',
          args: [gameIdBigInt, selectedItem.sellerAddress as `0x${string}`],
          value: parseEther(selectedItem.priceEth),
        });
      }
    } catch (err: any) {
      console.error("Purchase Prep Error:", err);
      alert("구매 준비 중 오류가 발생했습니다: " + err.message);
    }
  };

  if (!isOpen) return null;

  const getWearColor = (owners: number) => {
    if (owners === 0) return 'text-emerald-400';
    if (owners < 5) return 'text-blue-400';
    if (owners < 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1e1e1e] w-full max-w-5xl h-[80vh] rounded-xl overflow-hidden shadow-2xl flex border border-white/10">
        
        {/* LEFT: 매물 목록 */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">구매 옵션 선택</h2>
            <div className="text-sm text-gray-400">
              <span className="text-[#ff3f3f] font-bold">{usedList.length + 1}</span>개의 매물 발견됨
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {/* 신품 (Developer) 옵션 */}
            <div 
              onClick={() => setSelectedItem({ id: 'new', type: 'new', priceEth: gameData.ethPrice, priceKrw: gameData.price, seller: 'Official Store', owners: 0 })}
              className={`relative p-5 rounded-lg border-2 cursor-pointer transition-all group ${selectedItem.id === 'new' ? 'bg-[#252525] border-[#ff3f3f]' : 'bg-[#121212] border-white/5 hover:border-white/20'}`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded bg-emerald-500/20 flex items-center justify-center">
                    <Sparkles className="text-emerald-400" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">공식 스토어 신품</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">MINT</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">개발자가 직접 배포하는 미개봉 NFT입니다.</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{gameData.ethPrice} ETH</div>
                  <div className="text-xs text-gray-500">₩{gameData.price.toLocaleString()}</div>
                </div>
              </div>
              {selectedItem.id === 'new' && <div className="absolute top-3 right-3 text-[#ff3f3f]"><CheckCircle2 size={20} fill="currentColor" className="text-white"/></div>}
            </div>

            {/* 중고 옵션 리스트 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Used Market</h3>
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-gray-500" />
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-[#121212] text-xs text-gray-300 border border-white/10 rounded px-2 py-1 outline-none focus:border-[#ff3f3f]">
                    <option value="price_asc">가격 낮은순</option>
                  </select>
                </div>
              </div>

              {isLoadingUsed ? (
                <div className="text-center py-10 text-gray-500"><Loader2 className="animate-spin inline mr-2"/>매물 불러오는 중...</div>
              ) : usedList.length === 0 ? (
                <div className="text-center py-10 text-gray-600 border border-dashed border-gray-700 rounded-lg">등록된 중고 매물이 없습니다.</div>
              ) : (
                <div className="space-y-2">
                  {sortedUsedList.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`relative flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${selectedItem.id === item.id ? 'bg-[#252525] border-[#ff3f3f]' : 'bg-[#121212] border-transparent hover:border-white/10'}`}
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400">{item.seller[0]}</div>
                         <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-200">
                              {item.seller} <span className="text-[10px] text-gray-600 font-mono font-normal">SN: {item.tokenId}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <ArrowRightLeft size={12} className={getWearColor(item.owners)} />
                              <span className={`text-xs ${getWearColor(item.owners)}`}>{item.owners}회 거래됨</span>
                              <span className="text-[10px] text-gray-600 ml-2">{item.date}</span>
                            </div>
                         </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-200">{item.priceEth} ETH</div>
                        <div className="text-xs text-gray-500">₩{item.priceKrw.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: 결제 패널 */}
        <div className="w-[320px] bg-[#121212] border-l border-white/5 flex flex-col p-6">
          <div className="flex justify-between items-start mb-6">
            <h3 className="font-bold text-lg text-white">결제 정보</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
          </div>

          <div className="flex-1">
             <div className="aspect-video rounded-lg overflow-hidden mb-4 border border-white/10 relative">
               <img src={gameData.image} alt="" className="w-full h-full object-cover" />
               {selectedItem.type === 'new' && <div className="absolute inset-0 bg-emerald-500/10 mix-blend-overlay" />}
             </div>

             <div className="space-y-4">
               <div>
                 <div className="text-xs text-gray-500 mb-1">선택된 상품</div>
                 <div className="text-lg font-bold text-white leading-tight mb-1">{gameData.title}</div>
                 <div className="flex items-center gap-2">
                   {selectedItem.type === 'new' ? (
                     <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">신품 (Mint)</span>
                   ) : (
                     <span className={`text-xs font-bold px-2 py-0.5 rounded bg-white/5 ${getWearColor(selectedItem.owners)}`}>
                       중고 (Used) · 거래 {selectedItem.owners}회
                     </span>
                   )}
                 </div>
               </div>
               
               <div className="bg-[#1e1e1e] rounded p-4 border border-white/5 space-y-2 text-sm">
                 <div className="flex justify-between text-gray-400">
                   <span>판매자</span>
                   <span className="text-white">{selectedItem.seller}</span>
                 </div>
                 <div className="border-t border-white/10 my-2 pt-2 flex justify-between items-center">
                   <span>결제 금액</span>
                   <div className="text-right">
                     <span className="block text-xl font-bold text-[#ff3f3f]">{selectedItem.priceEth} ETH</span>
                     <span className="text-xs text-gray-500">≈ ₩{selectedItem.priceKrw.toLocaleString()}</span>
                   </div>
                 </div>
               </div>
             </div>
          </div>

          <div className="mt-6">
            {!isConnected ? (
                <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20 mb-3">
                    <p className="text-red-400 text-sm mb-2">지갑 연결이 필요합니다</p>
                    <Wallet className="mx-auto text-red-400 mb-1" />
                </div>
            ) : null}

            <button 
              onClick={handlePurchase}
              disabled={isPending || isConfirming || !isConnected}
              className={`
                w-full font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg
                ${(isPending || isConfirming || !isConnected)
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#ff3f3f] hover:bg-red-600 text-white shadow-red-900/20 active:scale-95'}
              `}
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {isPending ? "서명 대기 중..." : "트랜잭션 처리 중..."}
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  {selectedItem.type === 'new' ? '신품 구매하기' : '중고 구매하기'}
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-600 text-center mt-3 flex items-center justify-center gap-1">
              <AlertCircle size={10} /> 구매 시 NFT 소유권이 지갑으로 전송됩니다.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}