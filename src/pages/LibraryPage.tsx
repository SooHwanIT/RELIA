import { useState, useMemo, useEffect } from 'react';
import { 
  Play, Download, Clock, HardDrive, Search, 
  Star, Settings, Trophy, ArrowLeft, Filter, 
  LayoutGrid, MoreVertical, History, Coins, RefreshCw, Loader2, Wallet 
} from 'lucide-react';
import axios from 'axios';
import { useAccount, usePublicClient, useSignMessage } from 'wagmi'; 
import { useWeb3AuthUser } from '@web3auth/modal/react'; // Web3Auth Hooks import

// 모달 컴포넌트 import (경로 확인 필요)
import SellModal from '../components/modals/SellModal';
import ManageListingModal from '../components/modals/ManageListingModal';
import ContractABI from '../abis/GameMarketplace.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const SERVER_URL = 'http://localhost:3001';

// ----------------------------------------------------------------------
// 0. ELECTRON API TYPE DEFINITION (유지)
// ----------------------------------------------------------------------

interface ElectronAPI {
    launchGame: (exePath: string, args: string) => Promise<string>;
    // 메인 프로세스에서 { success: boolean, message: string } 객체를 반환한다고 가정
    startDownloadInstall: (gameId: string, downloadUrl: string, installDir: string) => Promise<{ success: boolean; message: string }>;
    // [추가] 설치 상태 확인
    checkInstallationStatus: (gameId: string) => Promise<{ isInstalled: boolean }>;
}

declare global {
    interface Window {
        electronAPI?: ElectronAPI;
    }
}

// ----------------------------------------------------------------------
// 1. TYPES & DATA (유지)
// ----------------------------------------------------------------------

type AchievementStatus = 'LOCKED' | 'LEGACY' | 'UNLOCKED';

interface Achievement {
  id: number;
  title: string;
  desc: string;
  icon: string;
  status: AchievementStatus; 
}

interface Game {
  id: string; // UUID String
  title: string;
  cover: string;
  hero: string;
  logo: string;
  installed: boolean;
  favorite: boolean;
  myPlaytime: number;
  totalPlaytime: number;
  lastPlayed: string;
  size: string;
  exePath: string;     
  downloadUrl: string; 
  achievements: Achievement[];
}

// ----------------------------------------------------------------------
// 2. SUB-COMPONENTS
// ----------------------------------------------------------------------

// 2-1. Achievement Card (도전 과제 카드) (유지)
const AchievementCard = ({ ach }: { ach: Achievement }) => {
  let containerStyle = "border-white/5 opacity-50"; 
  let iconStyle = "bg-black/40 grayscale";
  let statusText = "";
  let statusColor = "text-gray-600";

  if (ach.status === 'UNLOCKED') {
    containerStyle = "border-[#ff3f3f]/50 bg-[#ff3f3f]/5";
    iconStyle = "bg-[#ff3f3f] text-white shadow-lg shadow-red-500/50";
    statusText = "달성 완료";
    statusColor = "text-[#ff3f3f]";
  } else if (ach.status === 'LEGACY') {
    containerStyle = "border-yellow-500/30 bg-yellow-500/5";
    iconStyle = "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30";
    statusText = "Legacy (계승됨)";
    statusColor = "text-yellow-500/70";
  }

  return (
    <div className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${containerStyle}`}>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${iconStyle}`}>
        {ach.icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className={`font-bold text-sm truncate ${ach.status === 'LOCKED' ? 'text-gray-500' : 'text-white'}`}>
            {ach.title}
          </div>
        </div>
        <div className="text-xs text-gray-500 truncate">{ach.desc}</div>
        {ach.status !== 'LOCKED' && (
           <div className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${statusColor}`}>
             {statusText}
           </div>
        )}
        </div>
      </div>
  );
};

// 2-2. Detail View Component (상세 보기/실행/다운로드)
interface DetailViewProps {
  game: Game;
  onBack: () => void;
  listingPrice: number;
  onSellClick: () => void;
  onManageClick: () => void;
  onInstallComplete: (gameId: string) => void;
  // [추가] 실제 사용자 정보 props
  publicClient: ReturnType<typeof usePublicClient>;
  walletAddress: `0x${string}` | undefined;
  userName: string;
  userAuthKey: string; // DRM 인증 키 (임시 토큰)
}

const LibraryDetailView = ({ game, onBack, listingPrice, onSellClick, onManageClick, onInstallComplete, publicClient, walletAddress, userName, userAuthKey }: DetailViewProps) => {
  const { signMessageAsync } = useSignMessage(); 

  const playPercentage = Math.max(5, Math.min(100, (game.myPlaytime / Math.max(game.totalPlaytime, 1)) * 100));
  const isListed = listingPrice > 0;

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // 다운로드 핸들러 (유지)
  const handleDownload = async () => {
    if (!walletAddress) return alert("지갑 연결이 필요합니다.");
    if (isDownloading) return; // 중복 클릭 방지
    
    // 다운로드 폴더 절대 경로
    const installDir = `C:\\electron-game-launcher\\games\\${game.id}`;
    
    try {
      setIsDownloading(true);
      setDownloadProgress(5);

      // 1. [Wagmi] 서명 요청
      const message = `Download Game #${game.id}`;
      const signature = await signMessageAsync({ message }); 

      // 2. [Server] 다운로드 URL 요청 및 서명 전달
      const response = await axios.post(`${SERVER_URL}/api/download`, {
          gameId: game.id,
          userAddress: walletAddress,
          signature 
      });

      if(response.data.downloadUrl) {
          console.log(`✅ S3 URL received: ${response.data.downloadUrl}`);
          
          // 3. Electron API를 통해 다운로드와 로컬 저장을 메인 프로세스에 지시
          if (window.electronAPI && window.electronAPI.startDownloadInstall) {
              
              const installResult = await window.electronAPI.startDownloadInstall(
                game.id, 
                response.data.downloadUrl,
                installDir 
              );

              if (installResult.success) {
                  onInstallComplete(game.id);
                  alert("설치 완료! 이제 게임을 실행할 수 있습니다.");
              } else {
                  throw new Error(installResult.message || "설치 과정 중 알 수 없는 오류");
              }
          } else {
               window.location.href = response.data.downloadUrl;
               alert("웹 브라우저 다운로드가 시작됩니다. (로컬 저장은 Electron 앱에서만 가능)");
          }
      }
    } catch (err: any) {
      console.error("Download authorization failed:", err);
      
      let alertMessage = "다운로드 권한 확인 중 오류 발생. 콘솔을 확인해주세요.";

      if (axios.isAxiosError(err) && err.response) {
          alertMessage = `다운로드 실패 (${err.response.status}): ${err.response.data.error || "서버에서 파일을 찾을 수 없습니다."}`;
      } else if (String(err).includes("User rejected")) {
         alertMessage = "다운로드 서명이 거부되었습니다.";
      } else if (err.message) {
         alertMessage = err.message;
      }
      
      alert(alertMessage);
      
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // 게임 실행 핸들러 (Electron)
  const handlePlay = async () => {
    if (!walletAddress || !publicClient) return alert("지갑 연결 상태를 확인해주세요.");
    
    // -------------------------------------------------------------
    // [핵심 수정] 파라미터 유효성 검증
    // -------------------------------------------------------------
    if (userName === "Web3 User" || userAuthKey.includes("unknown") || walletAddress.length < 42) {
        alert("실행 실패: 유저 정보(지갑/이름/인증키)가 유효하지 않습니다. 다시 로그인해주세요.");
        return;
    }
    
    // 1. [NFT 보유 검증]
    try {
        const uuidBigInt = BigInt("0x" + game.id.replace(/-/g, ""));
        const balance = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: ContractABI,
            functionName: 'balanceOf',
            args: [walletAddress, uuidBigInt]
        }) as bigint;

        if (balance === 0n) {
            alert("경고: 해당 게임의 NFT 소유권을 찾을 수 없습니다. 마켓에서 구매 후 시도해주세요.");
            return;
        }
        console.log("NFT ownership verified: Balance > 0");

    } catch (err) {
        console.error("NFT verification failed:", err);
        alert("NFT 소유권 검증에 실패했습니다. 네트워크 상태를 확인해주세요.");
        return;
    }
    
    // 2. [실행 파라미터 구성] - props로 받은 실제 값 사용
    const launchArgs = [
      `-key "${userAuthKey}"`, // ✅ 실제 인증 키 사용
      `-id "${walletAddress}"`, // ✅ 실제 지갑 주소 사용
      `-name "${userName}"`,     // ✅ 실제 이름 사용
      `-gameId "${game.id}"`
    ].join(' '); 

    const targetPath = game.exePath; 

    if (window.electronAPI) {
      try {
        console.log(`[Electron] Launching: ${targetPath} with args: ${launchArgs}`);
        
        await window.electronAPI.launchGame(targetPath, launchArgs);
        
      } catch (err: any) {
        console.error("Game Launch Error:", err);
        alert(`게임 실행 실패!\n\n1. 실행 파일 경로: ${targetPath}\n2. 해당 경로에 파일이 있는지 확인해주세요.`);
      }
    } else {
      alert(`[웹 시뮬레이션]\n\n실행 파일: ${targetPath}\n실행 인자: ${launchArgs}\n\n*실제 실행은 Electron 앱에서만 가능합니다.*`);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-[#121212] animate-fade-in">
      <div className="absolute top-0 left-0 w-full z-50 p-6 flex items-center justify-between pointer-events-none">
        <button onClick={onBack} className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white font-bold transition-all hover:-translate-x-1 border border-white/10">
          <ArrowLeft size={18} /> 라이브러리
        </button>
      </div>

      <div className="absolute top-0 left-0 w-full h-[60vh] z-0">
        <img src={game.hero} alt="" className="w-full h-full object-cover opacity-60 mask-image-gradient-b" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col overflow-y-auto scrollbar-hide pt-[20vh] px-12 pb-20">
        <div className="mb-12">
          <h1 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-2xl mb-8 uppercase line-clamp-2">
            {game.logo}
          </h1>
          
          <div className="flex items-center gap-4">
            {game.installed ? (
              <button onClick={handlePlay} className="bg-[#ff3f3f] hover:bg-red-600 text-white text-xl font-bold px-16 py-5 rounded-lg shadow-lg shadow-red-900/40 transition-all hover:scale-105 flex items-center gap-3">
                <Play fill="currentColor" size={24} /> 플레이
              </button>
            ) : isDownloading ? (
              <div className="bg-[#2a2a2a] text-white text-xl font-bold px-8 py-5 rounded-lg shadow-lg border border-white/10 min-w-[300px] relative overflow-hidden flex items-center justify-center gap-3">
                <div className="absolute inset-0 bg-white/5" style={{ width: `${downloadProgress}%`, transition: 'width 0.2s ease' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                <Loader2 size={24} className="animate-spin text-[#ff3f3f] relative z-10" />
                <span className="relative z-10">설치 중... {Math.floor(downloadProgress)}%</span>
              </div>
            ) : (
              <button onClick={handleDownload} className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white text-xl font-bold px-16 py-5 rounded-lg shadow-lg border border-white/10 transition-all flex items-center gap-3 hover:border-[#ff3f3f]">
                <Download size={24} /> 설치 ({game.size})
              </button>
            )}
            
            <button className="p-5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"><Settings size={24} /></button>
            <button className="p-5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors">
              <Star size={24} fill={game.favorite ? "currentColor" : "none"} className={game.favorite ? "text-yellow-400" : ""} />
            </button>

            {isListed ? (
              <button onClick={onManageClick} className="p-3 pl-5 pr-5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 transition-colors flex items-center gap-3 font-bold ml-4 animate-pulse-slow">
                <RefreshCw size={24} /> 
                <div className="text-left leading-none">
                  <div className="text-[10px] opacity-70 mb-0.5">LISTED FOR</div>
                  <div className="text-lg">₩{listingPrice.toLocaleString()}</div>
                </div>
              </button>
            ) : (
              <button onClick={onSellClick} className="p-5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition-colors flex items-center gap-2 font-bold ml-4">
                <Coins size={24} /> 판매
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
           <div className="flex-1 bg-[#1e1e1e]/80 backdrop-blur-md border border-white/10 rounded-xl p-5">
             <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2 text-gray-400 text-sm font-bold"><Clock size={16} /> 플레이 타임</div></div>
             <div className="flex items-end gap-2 mb-2"><span className="text-3xl font-bold text-white leading-none">{game.myPlaytime}h</span><span className="text-sm text-gray-500">/ Total {game.totalPlaytime}h</span></div>
             <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden flex">
               <div className="h-full bg-[#ff3f3f]" style={{ width: `${playPercentage}%` }} />
               <div className="h-full bg-white/20 flex-1" /> 
             </div>
           </div>
           {/* ... 기타 통계 UI ... */}
        </div>
      </div>
    </div>
  );
};

// 2-3. Grid View Component (그리드 뷰)
interface GridViewProps {
  games: Game[];
  onSelectGame: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  listings: Record<string, number>;
  onFilterToggle: () => void;
  isFilterActive: boolean;
}

const LibraryGridView = ({ games, onSelectGame, searchTerm, onSearchChange, listings, onFilterToggle, isFilterActive }: GridViewProps) => {
  // ... (GridView 코드 유지) ...
    return (
    <div className="h-full flex flex-col bg-[#121212] px-8 pt-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-white mb-2">내 라이브러리</h2>
          <div className="flex items-center gap-2 text-sm text-gray-500">
             <span className="text-[#ff3f3f] font-bold">{games.length}</span>개의 게임 보유중
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#1e1e1e] p-1.5 rounded-lg border border-white/5">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
             <input type="text" placeholder="게임 검색" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="bg-[#121212] text-sm text-white pl-9 pr-3 py-2 rounded-md border border-transparent focus:border-[#ff3f3f] outline-none w-48 transition-colors" />
           </div>
           <div className="w-px h-6 bg-white/10 mx-1" />
           <button onClick={onFilterToggle} className={`p-2 rounded-md transition-colors ${isFilterActive ? 'bg-[#ff3f3f] text-white' : 'hover:bg-white/10 text-gray-400'}`} title="설치됨만 보기">
             <HardDrive size={18} />
           </button>
           <button className="p-2 rounded-md hover:bg-white/10 text-gray-400 transition-colors"><Filter size={18} /></button>
           <button className="p-2 rounded-md bg-white/10 text-white transition-colors"><LayoutGrid size={18} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {games.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p>보유한 게임이 없습니다.</p>
                <p className="text-sm mt-2">스토어에서 게임을 구매해보세요!</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {games.map((game) => (
                <div key={game.id} onClick={() => onSelectGame(game.id)} className="group cursor-pointer flex flex-col gap-3">
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1e1e1e] shadow-lg transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-xl border border-white/5 group-hover:border-[#ff3f3f]/50">
                    <img src={game.cover} alt={game.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {game.installed ? <Play fill="white" size={48} className="drop-shadow-lg text-white" /> : <Download size={48} className="drop-shadow-lg text-white" />}
                    </div>

                    {listings[game.id] && (
                    <div className="absolute top-0 right-0 z-10 bg-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-bl shadow-md">판매중</div>
                    )}
                    {game.installed && (
                    <div className="absolute bottom-2 right-2 bg-[#121212]/90 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10"><HardDrive size={10} /> 설치됨</div>
                    )}
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm truncate group-hover:text-[#ff3f3f] transition-colors">{game.title}</h3>
                    <div className="text-xs text-gray-500 flex items-center justify-between mt-1">
                    <span>{game.myPlaytime > 0 ? `${game.myPlaytime}시간` : '시작 안함'}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"><MoreVertical size={14}/></button>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// 3. MAIN PAGE (데이터 로딩 로직)
// ----------------------------------------------------------------------

export default function LibraryPage() {
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { userInfo } = useWeb3AuthUser(); 

  const [gamesData, setGamesData] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterInstalled, setFilterInstalled] = useState(false);
  const [activeListings, setActiveListings] = useState<Record<string, number>>({});
  
  // Modals
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [manageModalOpen, setManageModalOpen] = useState(false);

  // [임시] DRM 인증 키 생성 (실제로는 로그인 API에서 발급받아야 함)
  const userAuthKey = useMemo(() => `drn-token-${address?.substring(2, 8) || 'unknown'}`, [address]);

  // [핵심 로직] 내 라이브러리 로딩
  useEffect(() => {
    if (!isConnected || !address || !publicClient) {
        setGamesData([]); // 연결 끊기면 초기화
        return;
    }

    const fetchMyLibrary = async () => {
        setLoading(true);
        try {
            // 1. [Server] 모든 게임 메타데이터 가져오기
            const response = await axios.get(`${SERVER_URL}/api/games`);
            const allGamesMeta = response.data; // [{ id: "uuid", name: "...", ... }]

            const myGames: Game[] = [];

            // 2. [Blockchain] 내가 가진 게임인지 확인 (balanceOf)
            await Promise.all(allGamesMeta.map(async (meta: any) => {
                try {
                    const uuidBigInt = BigInt("0x" + meta.id.replace(/-/g, ""));
                    
                    // balanceOf 호출 (내 지갑 주소, 게임 ID)
                    const balance = await publicClient.readContract({
                        address: CONTRACT_ADDRESS,
                        abi: ContractABI,
                        functionName: 'balanceOf',
                        args: [address, uuidBigInt]
                    }) as bigint;

                    if (balance > 0n) {
                        // 내가 보유한 게임이면 리스트에 추가
                        myGames.push({
                            id: meta.id,
                            title: meta.name || "Unknown",
                            cover: meta.image || "https://placehold.co/600x900?text=No+Cover",
                            hero: meta.image || "https://placehold.co/1600x900?text=No+Hero",
                            logo: (meta.name || "GAME").toUpperCase(),
                            installed: false, // 로컬 상태 (추후 Electron 연동 시 파일 시스템 체크 필요)
                            favorite: false,
                            myPlaytime: 0, // 유저 데이터 DB가 있다면 거기서 가져와야 함
                            totalPlaytime: 0,
                            lastPlayed: '-',
                            size: "80 GB", // 임시 사이즈
                            // [수정] 실행 경로: game.id를 폴더 이름으로 사용
                            exePath: `C:\\electron-game-launcher\\games\\${meta.id}\\game.exe`, 
                            downloadUrl: "", // 상세페이지에서 동적 생성
                            achievements: []
                        });
                    }
                } catch (err) {
                    console.warn(`Failed to check balance for game ${meta.id}`, err);
                }
            }));

            setGamesData(myGames);

        } catch (err) {
            console.error("Library fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    fetchMyLibrary();
  }, [isConnected, address, publicClient]);


  // Derived State
  const selectedGame = useMemo(() => 
    gamesData.find(g => g.id === selectedGameId), 
  [selectedGameId, gamesData]);

  const filteredGames = useMemo(() => 
    gamesData.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesInstall = filterInstalled ? game.installed : true;
      return matchesSearch && matchesInstall;
    }), 
  [searchTerm, filterInstalled, gamesData]);

  const currentListingPrice = selectedGame ? activeListings[selectedGame.id] || 0 : 0;

  const handleInstallComplete = (gameId: string) => {
    // 설치 완료 시, 해당 게임의 exePath를 고정 경로로 업데이트
    setGamesData(prevGames => 
      prevGames.map(game => 
        game.id === gameId ? { 
            ...game, 
            installed: true,
            exePath: `C:\\electron-game-launcher\\games\\${gameId}\\game.exe` // 경로 고정
        } : game
      )
    );
  };

  // Handlers (리스팅 상태 업데이트)
  const handleRegisterListing = (price: number) => {
    if (selectedGame) {
      setActiveListings(prev => ({ ...prev, [selectedGame.id]: price }));
    }
  };

  const handleUpdatePrice = (newPrice: number) => {
    if (selectedGame) {
      setActiveListings(prev => ({ ...prev, [selectedGame.id]: newPrice }));
    }
  };

  const handleCancelListing = () => {
    if (selectedGame) {
      const newList = { ...activeListings };
      delete newList[selectedGame.id];
      setActiveListings(newList);
    }
  };

  // 지갑 미연결 시 UI 처리
  if (!isConnected) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-[#121212] text-gray-400 gap-4">
              <Wallet size={48} className="text-[#ff3f3f] opacity-80" />
              <h2 className="text-xl font-bold text-white">지갑을 연결해주세요</h2>
              <p>내 라이브러리를 확인하려면 지갑 연결이 필요합니다.</p>
          </div>
      );
  }

  if (loading) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-[#121212] text-gray-400 gap-4">
            <Loader2 className="animate-spin text-[#ff3f3f]" size={32} />
            <p>블록체인에서 보유 게임을 확인 중입니다...</p>
        </div>
      );
  }

  return (
    <>
      {selectedGameId !== null && selectedGame ? (
        <LibraryDetailView 
          game={selectedGame}
          onBack={() => setSelectedGameId(null)}
          listingPrice={currentListingPrice}
          onSellClick={() => setSellModalOpen(true)}
          onManageClick={() => setManageModalOpen(true)}
          onInstallComplete={handleInstallComplete}
          // [수정] NFT 검증 및 유저 정보 전달
          publicClient={publicClient}
          walletAddress={address}
          userName={userInfo?.name || "Web3 User"}
          userAuthKey={userAuthKey} // ✅ DRM 인증 키 전달
        />
      ) : (
        <LibraryGridView 
          games={filteredGames}
          onSelectGame={setSelectedGameId}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          listings={activeListings}
          onFilterToggle={() => setFilterInstalled(!filterInstalled)}
          isFilterActive={filterInstalled}
        />
      )}

      {selectedGame && (
        <>
          <SellModal 
            isOpen={sellModalOpen} 
            onClose={() => setSellModalOpen(false)} 
            game={selectedGame}
            onConfirm={handleRegisterListing}
          />
          <ManageListingModal
            isOpen={manageModalOpen}
            onClose={() => setManageModalOpen(false)}
            game={selectedGame}
            currentPrice={currentListingPrice}
            onUpdatePrice={handleUpdatePrice}
            onCancelListing={handleCancelListing}
          />
        </>
      )}
    </>
  );
}