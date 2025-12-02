import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Check, ArrowLeft, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (!formData.email || !formData.nickname || !formData.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreed) {
      setError('이용약관에 동의해주세요.');
      return;
    }

    setIsLoading(true);

    // 가입 시뮬레이션
    setTimeout(() => {
      setIsLoading(false);
      alert('회원가입이 완료되었습니다! 로그인 해주세요.');
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="h-full w-full flex relative bg-[#121212] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=2070&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-20"
          alt="Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-[#121212]/50" />
      </div>

      <div className="relative z-10 m-auto w-full max-w-md p-6">
        <div className="bg-[#1e1e1e]/80 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl animate-fade-in-up">
          
          <div className="flex items-center gap-4 mb-8">
            <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <h2 className="text-2xl font-bold text-white">회원가입</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-3.5 text-gray-500" />
              <input 
                name="email"
                type="email" 
                placeholder="이메일 주소" 
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#121212] text-white pl-11 pr-4 py-3 rounded-lg border border-white/10 focus:border-[#ff3f3f] outline-none transition-colors"
              />
            </div>

            {/* Nickname */}
            <div className="relative">
              <User size={18} className="absolute left-4 top-3.5 text-gray-500" />
              <input 
                name="nickname"
                type="text" 
                placeholder="닉네임" 
                value={formData.nickname}
                onChange={handleChange}
                className="w-full bg-[#121212] text-white pl-11 pr-4 py-3 rounded-lg border border-white/10 focus:border-[#ff3f3f] outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-3.5 text-gray-500" />
              <input 
                name="password"
                type="password" 
                placeholder="비밀번호" 
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#121212] text-white pl-11 pr-4 py-3 rounded-lg border border-white/10 focus:border-[#ff3f3f] outline-none transition-colors"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Check size={18} className={`absolute left-4 top-3.5 transition-colors ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'text-[#ff3f3f]' : 'text-gray-500'}`} />
              <input 
                name="confirmPassword"
                type="password" 
                placeholder="비밀번호 확인" 
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full bg-[#121212] text-white pl-11 pr-4 py-3 rounded-lg border border-white/10 focus:border-[#ff3f3f] outline-none transition-colors"
              />
            </div>

            {/* Agreement */}
            <div className="flex items-center gap-3 pt-2">
              <div 
                onClick={() => setAgreed(!agreed)}
                className={`w-5 h-5 rounded border cursor-pointer flex items-center justify-center transition-colors ${agreed ? 'bg-[#ff3f3f] border-[#ff3f3f]' : 'border-gray-500'}`}
              >
                {agreed && <Check size={14} className="text-white" />}
              </div>
              <span className="text-xs text-gray-400">
                <span className="text-white font-bold cursor-pointer hover:underline">서비스 이용약관</span> 및 <span className="text-white font-bold cursor-pointer hover:underline">개인정보 처리방침</span>에 동의합니다.
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[#ff3f3f] text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff3f3f] hover:bg-red-600 text-white font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-red-900/20 mt-4 disabled:opacity-50"
            >
              {isLoading ? '가입 처리 중...' : '계정 생성하기'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            이미 계정이 있으신가요? <Link to="/login" className="text-[#ff3f3f] font-bold hover:underline ml-1">로그인</Link>
          </div>

        </div>
      </div>
    </div>
  );
}