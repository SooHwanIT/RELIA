import { Search, Bell, User, LogOut, UserCircle, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccount, useBalance } from "wagmi";
import { useWeb3AuthUser } from "@web3auth/modal/react";

// Props로 onLogout 함수만 받습니다. (나머지 데이터는 Hook으로 조회)
export default function Header({ onLogout }) {
  
  const { address: walletAddress } = useAccount();
  const { userInfo } = useWeb3AuthUser();
  const { data: balanceData } = useBalance({ address: walletAddress, enabled: !!walletAddress });

  // 지갑 주소 포맷팅 함수 (예: 0x1234...5678)
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "Wallet Disconnected";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const displayName = userInfo?.name || "Web3 User";
  const displayAvatar = userInfo?.profileImage;

  return (
    <header className="h-16 px-8 flex items-center justify-between bg-[#121212] sticky top-0 z-40 border-b border-white/5">
      {/* Search Bar */}
      <div className="flex-1 max-w-md relative group">
        <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-[#ff3f3f] transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="게임, 친구, 태그 검색" 
          className="w-full bg-[#1e1e1e] text-sm text-white pl-10 pr-4 py-2.5 rounded-full border border-transparent focus:border-[#ff3f3f] focus:outline-none transition-all placeholder:text-gray-600"
        />
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff3f3f] rounded-full border border-[#121212]"></span>
        </button>
        
        {/* User Profile Section */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10 group relative cursor-pointer">
          <div className="text-right hidden sm:block">
            {/* 이름 표시 */}
            <div className="text-sm font-bold text-white tracking-wide truncate max-w-36">
              {displayName}
            </div>
            {/* 잔액 표시 */}
            <div className="text-xs text-[#ff3f3f] font-medium flex items-center justify-end gap-0.5">
              <DollarSign size={10} />
              {balanceData ? `${balanceData.formatted.substring(0, 6)} ${balanceData.symbol}` : '0.00 ETH'}
            </div>
          </div>
          
          {/* Avatar Area (프로필 이미지 적용) */}
          <div className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center border-2 border-[#1e1e1e] ring-2 ring-gray-800 overflow-hidden shadow-md text-gray-400 group-hover:text-white transition-colors">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={18} />
            )}
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e1e1e] border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 transform origin-top-right">
              <div className="py-1">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-white/5 truncate">
                    {formatAddress(walletAddress)}
                </div>
                <Link 
                  to="/mypage"
                  className="w-full px-4 py-3 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
                >
                  <UserCircle size={16} /> 마이페이지
                </Link>
                
                {/* 로그아웃 버튼 활성화 */}
                <button 
                  onClick={onLogout} 
                  className="w-full px-4 py-3 text-left text-sm text-gray-400 hover:text-[#ff3f3f] hover:bg-white/5 flex items-center gap-2"
                >
                  <LogOut size={16} /> 로그아웃
                </button>
              </div>
          </div>
        </div>
      </div>
    </header>
  );
}