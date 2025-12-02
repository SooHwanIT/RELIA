import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function FindAccountPage() {
  const [activeTab, setActiveTab] = useState<'id' | 'pw'>('id');
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // 전송 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="h-full w-full flex relative bg-[#121212] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-20"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-[#121212]/50" />
      </div>

      <div className="relative z-10 m-auto w-full max-w-md p-6">
        <div className="bg-[#1e1e1e]/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in-up">
          
          {/* Header & Tabs */}
          <div className="border-b border-white/10">
            <div className="p-4 flex items-center gap-4">
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={24} />
              </Link>
              <h2 className="text-lg font-bold text-white">계정 찾기</h2>
            </div>
            <div className="flex">
              <button 
                onClick={() => { setActiveTab('id'); setIsSent(false); }}
                className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'id' ? 'border-[#ff3f3f] text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                아이디 찾기
              </button>
              <button 
                onClick={() => { setActiveTab('pw'); setIsSent(false); }}
                className={`flex-1 py-4 text-sm font-bold transition-colors border-b-2 ${activeTab === 'pw' ? 'border-[#ff3f3f] text-white bg-white/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                비밀번호 재설정
              </button>
            </div>
          </div>

          <div className="p-8">
            {isSent ? (
              // Success Message
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">이메일 전송 완료</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  입력하신 이메일 <strong>{email}</strong>(으)로<br/>
                  {activeTab === 'id' ? '아이디 정보가' : '비밀번호 재설정 링크가'} 전송되었습니다.
                </p>
                <Link 
                  to="/login"
                  className="inline-block w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white font-bold py-3 rounded-lg transition-colors border border-white/10"
                >
                  로그인으로 돌아가기
                </Link>
              </div>
            ) : (
              // Input Form
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {activeTab === 'id' ? '가입한 이메일을 입력해주세요.' : '비밀번호를 잊으셨나요?'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {activeTab === 'id' 
                      ? '회원정보에 등록된 이메일 주소와 일치해야 합니다.' 
                      : '가입한 이메일로 비밀번호 재설정 링크를 보내드립니다.'}
                  </p>
                </div>

                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-gray-500" />
                  <input 
                    type="email" 
                    required
                    placeholder="이메일 주소 입력" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#121212] text-white pl-11 pr-4 py-3 rounded-lg border border-white/10 focus:border-[#ff3f3f] outline-none transition-colors"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#ff3f3f] hover:bg-red-600 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? '전송 중...' : (
                    <>
                      {activeTab === 'id' ? '아이디 찾기' : '재설정 메일 보내기'}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}