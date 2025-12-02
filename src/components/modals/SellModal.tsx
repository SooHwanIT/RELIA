import { useState, useMemo, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { useWeb3AuthUser } from '@web3auth/modal/react'; // [추가] Web3Auth Hooks import
import { parseEther } from 'viem';
import { X, Coins, Calculator, TrendingUp, Tag, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import ContractABI from '../../abis/GameMarketplace.json';
import axios from 'axios'; 

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const SERVER_URL = 'http://localhost:3001';

interface SellModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: string; // UUID String
    title: string;
    cover: string;
    totalPlaytime: number;
  };
  onConfirm: (price: number) => void; 
}

export default function SellModal({ isOpen, onClose, game, onConfirm }: SellModalProps) {
  const { address } = useAccount();
  const { userInfo } = useWeb3AuthUser(); // [추가] Web3Auth 사용자 정보
  const publicClient = usePublicClient();
  
  // 1. Wagmi Hooks 
  const { data: hash, isPending, writeContract, reset, error: writeError } = useWriteContract();
  
  // 2. 트랜잭션 상태 관리
  const [priceKrw, setPriceKrw] = useState<string>('');
  const [ethRate] = useState(0.000000285);
  const [isServerUpdating, setIsServerUpdating] = useState(false); 

  const [isApproved, setIsApproved] = useState(false);
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>(undefined);
  
  // 리스팅 트랜잭션 확인
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
    enabled: !!hash // hash가 있을 때만 실행
  });
  
  // 승인 트랜잭션 확인
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ 
    hash: approvalHash,
    enabled: !!approvalHash
  });

  const [successHandled, setSuccessHandled] = useState(false);


  // --- Derived State 및 계산 ---
  const inputPriceKrw = Number(priceKrw.replace(/[^0-9]/g, ''));
  const inputPriceEth = (inputPriceKrw * ethRate).toFixed(6); 
  const platformFeeKrw = Math.floor(inputPriceKrw * 0.025); 
  const creatorRoyaltyKrw = Math.floor(inputPriceKrw * 0.05); 
  const netProfitKrw = inputPriceKrw - (platformFeeKrw + creatorRoyaltyKrw);

  // --- 핸들러 ---
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceKrw(e.target.value.replace(/[^0-9]/g, ''));
  };
  
  // [수정] 서버에 리스팅 정보 전달 (사용자 이름 인자 추가)
  const sendListingToServer = async (gameId: string, priceEth: string, sellerAddress: string, sellerName: string) => {
      setIsServerUpdating(true);
      try {
          await axios.post(`${SERVER_URL}/api/list-item`, {
              gameId: gameId,
              priceEth: priceEth,
              sellerAddress: sellerAddress,
              sellerName: sellerName, // ✅ 실제 사용자 이름 전송
          });
          console.log("Listing successfully sent to server indexer.");
      } catch (e) {
          console.error("Failed to notify server about listing:", e);
          alert("경고: 리스팅은 되었으나 서버 목록 업데이트에 실패했습니다. (마켓에 표시 안 될 수 있음)");
      } finally {
          setIsServerUpdating(false);
      }
  };


  // 1. 컨트랙트 승인 상태 확인 (기존 유지)
  const checkApproval = async () => {
    if (!address || !publicClient) return;
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: ContractABI,
        functionName: 'isApprovedForAll',
        args: [address, CONTRACT_ADDRESS], 
      }) as boolean;
      setIsApproved(result);
    } catch (e) {
      console.error("Approval check failed:", e);
      setIsApproved(false);
    }
  };

  // 2. 컨트랙트 승인 요청 (Approval) (기존 유지)
  const handleApprove = () => {
    if (!address || !CONTRACT_ADDRESS) return;
    setApprovalHash(undefined); 
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ContractABI,
      functionName: 'setApprovalForAll',
      args: [CONTRACT_ADDRESS, true],
    });
  };

  // 3. 리스팅 등록 (List) (기존 유지)
  const handleListGame = () => {
    if (!address || !CONTRACT_ADDRESS || !isApproved || inputPriceKrw <= 0) return;

    try {
      const gameIdBigInt = BigInt("0x" + game.id.replace(/-/g, ""));
      const priceEthWei = parseEther(inputPriceEth);
      
      setApprovalHash(undefined);
      reset(); // 이전 트랜잭션 상태 리셋
      
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ContractABI,
        functionName: 'listGame',
        args: [gameIdBigInt, priceEthWei],
      });
      
    } catch (e: any) {
      alert("리스팅 실패: " + (e.message || "오류 발생"));
      console.error("List Transaction error:", e);
    }
  };

  // 모달 열릴 때마다 Wagmi 상태 리셋 및 플래그 초기화 (기존 유지)
  useEffect(() => {
    if (isOpen) {
      reset(); 
      setApprovalHash(undefined);
      setSuccessHandled(false); 
      checkApproval();
    }
  }, [isOpen]); 

  // 승인 트랜잭션 해시 설정 및 완료 후 상태 업데이트 (기존 유지)
  useEffect(() => {
    if (hash && isPending && !approvalHash) {
        setApprovalHash(hash);
    }
    if (isApprovalSuccess && !isApprovalConfirming) {
        setIsApproved(true);
        setApprovalHash(undefined);
        alert("마켓플레이스 권한 승인 완료! 이제 리스팅 트랜잭션을 전송하세요.");
    }
  }, [hash, isPending, isApprovalSuccess, isApprovalConfirming]);
  

  // 🚨 리스팅 최종 완료 처리 (무한 루프 방지)
  useEffect(() => {
    if (isConfirmed && hash && !isApprovalConfirming && !successHandled && address) { 
      
      // 1. 플래그를 즉시 설정
      setSuccessHandled(true); 

      // 2. 서버 업데이트 (실제 사용자 이름 사용)
      const sellerName = userInfo?.name || address.substring(0, 6); // 이름 없으면 주소 일부 사용
      sendListingToServer(game.id, inputPriceEth, address, sellerName);
      
      onConfirm(inputPriceKrw);
      alert(`[리스팅 완료] 게임이 중고 마켓에 등록되었습니다.`);
      
      // 3. Wagmi 상태 초기화 후 모달 닫기
      reset(); 
      onClose();
    }
  }, [isConfirmed, hash, onClose, onConfirm, inputPriceKrw, address, successHandled, isApprovalConfirming, userInfo?.name]); // userInfo.name 의존성 추가

  // --- UI 상태 조건 ---
  const isTransactionInProgress = isPending || isConfirming || isApprovalConfirming || isServerUpdating;
  const isApprovedAndConfirmed = isApproved && !isApprovalConfirming;
  const currentStep = isApprovedAndConfirmed ? (isTransactionInProgress ? 3 : 2) : 1;

  // 최종 버튼 클릭 핸들러
  const handleSubmitClick = () => {
    if (!isApproved) {
      handleApprove();
    } else {
      handleListGame();
    }
  };

  if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#1e1e1e] w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl flex border border-white/10">
        
        {/* LEFT: Game Info (생략) */}
        <div className="w-1/3 bg-[#181818] p-8 flex flex-col border-r border-white/5 relative overflow-hidden">
          <div className="relative z-10 flex flex-col h-full">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Tag size={20} className="text-[#ff3f3f]" /> 판매할 자산
            </h3>
            <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl mb-6 border border-white/10">
              <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg text-white leading-tight mb-4">{game.title}</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-400"><span>누적 플레이</span><span className="text-white font-mono">{game.totalPlaytime}시간</span></div>
                <div className="flex justify-between text-gray-400"><span>NFT ID</span><span className="text-white font-mono">{game.id.substring(0, 8)}...</span></div>
                <div className="flex justify-between text-gray-400"><span>예상 등급</span><span className="text-yellow-500 font-bold">Used (B)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Input & Checkout */}
        <div className="flex-1 p-8 bg-[#1e1e1e] flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl font-bold text-white">판매 가격 설정 및 리스팅</h2>
            <button onClick={onClose}><X size={24} className="text-gray-500 hover:text-white" /></button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 mb-2">판매 희망가 (KRW)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₩</span>
              <input 
                type="text" 
                value={Number(priceKrw).toLocaleString()}
                onChange={handlePriceChange}
                placeholder="0"
                className="w-full bg-[#121212] text-white text-2xl font-bold pl-10 pr-4 py-4 rounded-lg border border-white/10 focus:border-[#ff3f3f] outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">≈ **{inputPriceEth} ETH** (현재 환율 기준)</p>
          </div>

          {/* 판매 단계 표시 */}
          <div className="space-y-2 mb-6">
              <h3 className="text-sm font-bold text-gray-400 flex items-center gap-2"><TrendingUp size={16} /> 리스팅 단계</h3>
              <div className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${currentStep === 1 ? 'bg-[#ff3f3f]/10 border-[#ff3f3f] text-white' : 'bg-gray-700/20 border-white/10 text-gray-400'}`}>
                  <span>1. 마켓플레이스 권한 승인 (Approval)</span>
                  {isApproved ? <CheckCircle size={16} className="text-emerald-500" /> : isApprovalConfirming ? <Loader2 size={16} className="animate-spin" /> : null}
              </div>
              <div className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${currentStep === 2 ? 'bg-[#ff3f3f]/10 border-[#ff3f3f] text-white' : 'bg-gray-700/20 border-white/10 text-gray-400'}`}>
                  <span>2. 판매 가격으로 리스팅 등록</span>
                  {isConfirmed ? <CheckCircle size={16} className="text-emerald-500" /> : isConfirming ? <Loader2 size={16} className="animate-spin" /> : null}
              </div>
          </div>


          {/* 정산 예상 */}
          <div className="bg-[#121212] rounded-lg p-6 border border-white/5 space-y-3 mb-8">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2"><Calculator size={16} /> 정산 예상 (KRW)</h3>
            <div className="flex justify-between text-sm"><span className="text-gray-500">플랫폼 수수료 (2.5%)</span><span className="text-gray-400">- ₩{platformFeeKrw.toLocaleString()}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">개발사 로열티 (10%)</span><span className="text-gray-400">- ₩{creatorRoyaltyKrw.toLocaleString()}</span></div>
            <div className="border-t border-white/10 pt-3 flex justify-between font-bold"><span className="text-gray-300">최종 정산 금액</span><span className="text-xl text-[#ff3f3f]">₩{netProfitKrw.toLocaleString()}</span></div>
          </div>

          {/* 등록 버튼 */}
          <button 
            onClick={handleSubmitClick}
            className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all 
              ${!address 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : inputPriceKrw <= 0 || isTransactionInProgress
                ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                : isApproved ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/30' 
                : 'bg-[#ff3f3f] hover:bg-red-600 text-white shadow-lg shadow-red-900/30'}`}
            disabled={inputPriceKrw <= 0 || isTransactionInProgress || !address}
          >
            {isTransactionInProgress ? (
                <>
                    <Loader2 size={20} className="animate-spin" /> 
                    {isServerUpdating ? '서버 목록 업데이트 중...' : isApprovalConfirming ? '권한 확인 중...' : '리스팅 트랜잭션 처리 중...'}
                </>
            ) : isApproved ? (
                <>
                    <Coins size={20} /> 리스팅 등록 트랜잭션 전송
                </>
            ) : (
                <>
                    <Coins size={20} /> 마켓 권한 승인 (Step 1)
                </>
            )}
          </button>
          
          <p className="text-[10px] text-gray-600 text-center mt-3 flex items-center justify-center gap-1">
             <AlertTriangle size={12} className='text-yellow-500'/> 등록 버튼 클릭 시 지갑 서명 창이 나타납니다.
          </p>
        </div>
      </div>
    </div>
  );
}