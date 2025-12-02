import { useState, useEffect } from 'react';
// [수정됨] Web3Auth Hooks import 경로 변경
import { useWeb3AuthUser, useWeb3AuthDisconnect } from "@web3auth/modal/react";
import { useAccount, useBalance, useDisconnect, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther } from 'viem';
import { useNavigate } from 'react-router-dom';
import { 
  User, Copy, ExternalLink, Shield, Wallet, LogOut, Check, Loader2, DollarSign, Send, ArrowUpLeft 
} from 'lucide-react';

export default function MyPage() {
  const navigate = useNavigate();
  
  // 1. Web3Auth Hooks
  const { userInfo } = useWeb3AuthUser();
  const { disconnect: disconnectWeb3Auth } = useWeb3AuthDisconnect();
  
  // 2. Wagmi Hooks
  const { address: walletAddress, isConnected } = useAccount();
  const { disconnect: disconnectWagmi } = useDisconnect();
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: walletAddress,
    enabled: isConnected && !!walletAddress
  });
  
  // 3. 송금 Hooks
  const { data: txHash, sendTransaction, isPending: isSending } = useSendTransaction();
  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: !!txHash,
  });

  const [copied, setCopied] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');

  // 송금 처리 핸들러
  const handleSend = () => {
    if (!walletAddress) return alert("지갑 주소를 찾을 수 없습니다.");
    if (!recipient || !sendAmount) return alert("받는 주소와 금액을 입력해주세요.");
    
    try {
        const valueToSend = parseEther(sendAmount);

        sendTransaction({
            to: recipient as `0x${string}`, // 받는 주소
            value: valueToSend, // 송금 금액 (Wei)
        });
        
    } catch (e: any) {
        if (e.message.includes("Invalid value")) {
            alert("유효하지 않은 금액 형식입니다. 숫자를 확인해주세요.");
        }
        console.error("Send transaction error:", e);
    }
  };
  
  // 트랜잭션 성공 시 알림
  useEffect(() => {
    if (isTxSuccess) {
        alert(`송금 성공! Hash: ${txHash}`);
        setRecipient('');
        setSendAmount('');
    }
  }, [isTxSuccess, txHash]);

  // 데이터 로딩 상태 처리
  if (!isConnected || isBalanceLoading) {
    return (
        <div className="h-screen bg-[#121212] flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="animate-spin mb-4 text-[#ff3f3f]" size={40} />
            <h2 className="text-xl font-bold text-white">지갑 정보를 불러오는 중...</h2>
        </div>
    );
  }

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress); 
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await disconnectWeb3Auth();
      disconnectWagmi();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const displayName = userInfo?.name || "Web3 User";
  const displayEmail = userInfo?.email || "이메일 정보 없음";
  const displayAvatar = userInfo?.profileImage;
  const etherscanUrl = `https://sepolia.etherscan.io/address/${walletAddress}`;

  const transactionStatusText = isSending 
    ? '서명 요청 중...' 
    : isTxConfirming 
    ? '트랜잭션 처리 중...' 
    : '송금';

  return (
    <div className="h-full overflow-y-auto bg-[#121212] p-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-8 flex items-center gap-3">
          마이페이지 <span className="text-sm font-normal text-gray-500 mt-2">Account Settings</span>
        </h1>

        <div className="space-y-6">
          
          {/* 1. Profile Card (User Info) */}
          <div className="bg-[#1e1e1e] rounded-xl p-8 border border-white/5 flex flex-col md:flex-row items-center gap-8 shadow-lg">
            <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center border-4 border-[#121212] overflow-hidden shadow-2xl">
              {displayAvatar ? (
                <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">{displayName}</h2>
              <p className="text-gray-400 text-sm mb-4">{displayEmail}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                <Shield size={12} />
                Web3Auth Verified
              </div>
            </div>
          </div>

          {/* 2. Wallet Dashboard (잔액 및 송금) */}
          <div className="bg-[#1e1e1e] rounded-xl p-8 border border-white/5 shadow-lg">
            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
              <div className="p-3 bg-[#ff3f3f]/10 rounded-xl text-[#ff3f3f]">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">지갑 대시보드</h3>
                <p className="text-sm text-gray-500">자산 현황 및 거래 기록을 확인하세요.</p>
              </div>
            </div>

            <div className="bg-[#121212] rounded-xl p-6 border border-white/5 space-y-6">
              
              {/* 잔액 섹션 */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">잔액 (Balance)</label>
                  <div className="text-4xl font-extrabold text-white flex items-end gap-2">
                    {balanceData?.formatted.substring(0, 8) || "0.0000"} 
                    <span className="text-lg text-[#ff3f3f]">{balanceData?.symbol || "ETH"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-gray-500 mb-1 block uppercase tracking-wider">네트워크</span>
                  <div className="text-white font-bold">Sepolia Testnet</div>
                </div>
              </div>

              {/* 주소 및 복사 섹션 */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Wallet Address</label>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-[#1e1e1e] p-4 rounded-lg text-gray-300 font-mono text-sm break-all border border-white/5 select-all">
                    {walletAddress}
                  </code>
                  <button onClick={handleCopy} className="p-4 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors border border-white/5 flex-shrink-0 group" title="주소 복사">
                    {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} className="group-hover:text-white" />}
                  </button>
                </div>
              </div>
              
              {/* ------------------------------------------- */}
              {/* ETH 송금 섹션 */}
              {/* ------------------------------------------- */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><ArrowUpLeft size={16} /> ETH 송금</h4>
                
                {/* 받는 주소 */}
                <input 
                    type="text" 
                    placeholder="받는 주소 (0x...)" 
                    value={recipient} 
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-[#1e1e1e] text-white rounded p-3 text-sm border border-gray-700 focus:border-[#ff3f3f] outline-none"
                />
                
                {/* 송금 금액 */}
                <div className="relative">
                    <input 
                        type="number" 
                        step="0.0001" 
                        placeholder={`금액 (${balanceData?.symbol || 'ETH'})`} 
                        value={sendAmount} 
                        onChange={(e) => setSendAmount(e.target.value)}
                        className="w-full bg-[#1e1e1e] text-white rounded p-3 text-sm border border-gray-700 focus:border-[#ff3f3f] outline-none pr-12"
                    />
                    <span className="absolute right-3 top-3 text-gray-500 text-sm">{balanceData?.symbol || 'ETH'}</span>
                </div>

                {/* 송금 버튼 */}
                <button 
                    onClick={handleSend}
                    disabled={isSending || isTxConfirming || !recipient || !sendAmount}
                    className={`w-full py-3 rounded font-bold text-white flex items-center justify-center gap-2 transition-all 
                        ${(isSending || isTxConfirming) 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-900/30'}`}
                >
                    {(isSending || isTxConfirming) ? (
                        <Loader2 className="animate-spin" size={18} />
                    ) : (
                        <Send size={18} />
                    )}
                    {transactionStatusText}
                </button>
                
                {/* Transaction Hash 표시 (성공 시) */}
                {isTxSuccess && txHash && (
                    <p className="text-xs text-emerald-500 mt-2 break-all">
                        ✅ Transaction Sent: <a href={`${etherscanUrl.split('/address/')[0]}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="underline">{txHash.substring(0, 10)}...</a>
                    </p>
                )}
              </div>
              
              {/* 거래 내역 링크 */}
              <div className="pt-2 border-t border-white/10">
                <h4 className="text-sm font-bold text-white mb-3">거래 내역</h4>
                <a 
                  href={etherscanUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-sm text-gray-400 hover:text-[#ff3f3f] flex items-center gap-2 transition-colors border border-white/10 hover:border-[#ff3f3f]/30 p-3 rounded-lg"
                >
                  <ExternalLink size={14} /> Etherscan에서 전체 트랜잭션 내역 확인
                </a>
              </div>
            </div>
          </div>

          {/* 3. Account Actions */}
          <div className="bg-[#1e1e1e] rounded-xl p-8 border border-white/5 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-6">계정 설정</h3>
            <button 
              onClick={handleLogout}
              className="w-full py-4 border border-white/10 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all flex items-center justify-center gap-2 font-bold"
            >
              <LogOut size={18} /> 계정 로그아웃
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}