import React from 'react';
import { ArrowRight, Gamepad2, AlertCircle } from 'lucide-react';

// App.js에서 props로 내려주는 기능들을 받아옵니다.
export default function LoginPage({ onLogin, isConnecting, error }) {
  
  // 내부 로직 제거: 이제 부모 컴포넌트(App.js)의 함수를 실행합니다.
  const handleConnect = () => {
    if (onLogin) {
      onLogin();
    }
  };

  return (
    <div className="h-screen w-full flex relative bg-[#121212] overflow-hidden font-sans text-white">
      
      {/* 1. Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-30"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/80 to-[#121212]/40" />
      </div>

      {/* 2. Login Container */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
        
        <div className="w-full max-w-[420px] bg-[#1e1e1e]/60 backdrop-blur-xl p-10 rounded-2xl border border-white/10 shadow-2xl space-y-10 animate-fade-in-up">
          
          {/* Brand Logo & Title */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#ff3f3f] to-[#d62828] rounded-3xl flex items-center justify-center shadow-lg shadow-red-900/30 rotate-3 transition-transform hover:rotate-0">
                <Gamepad2 size={40} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white mb-2">
                RELIA
              </h1>
              <p className="text-gray-400 font-medium">
                게이머를 위한 차세대 플랫폼
              </p>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={18} />
              <span>{error.message || "로그인 중 오류가 발생했습니다."}</span>
            </div>
          )}

          {/* Main Action */}
          <div className="space-y-4">
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="group w-full bg-[#ff3f3f] hover:bg-red-600 text-white font-bold py-5 rounded-xl transition-all shadow-[0_0_20px_rgba(255,63,63,0.2)] hover:shadow-[0_0_30px_rgba(255,63,63,0.4)] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span className="tracking-wide">로그인 중..</span>
                </div>
              ) : (
                <>
                  <span className="text-lg tracking-wide">로그인</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} strokeWidth={3} />
                </>
              )}
            </button>
            
            <p className="text-center text-[11px] text-gray-500">
              계속 진행하면 <span className="underline cursor-pointer hover:text-gray-300">이용약관</span> 및 <span className="underline cursor-pointer hover:text-gray-300">개인정보처리방침</span>에 동의하게 됩니다.
            </p>
          </div>

        </div>

        {/* Footer Info */}
        <div className="absolute bottom-8 text-[10px] text-gray-600 font-mono">
          v2.4.0-stable | Region: Korea
        </div>

      </div>
    </div>
  );
}