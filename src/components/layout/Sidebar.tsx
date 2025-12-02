import { useState } from 'react';
import { Home, ShoppingBag, Gamepad2, Users, Settings, Download, ChevronLeft, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: <Home size={24} />, label: '홈', path: '/' },
    { icon: <ShoppingBag size={24} />, label: '스토어', path: '/store' },
    { icon: <Gamepad2 size={24} />, label: '라이브러리', path: '/library' },
    { icon: <Users size={24} />, label: '커뮤니티', path: '/community' },
  ];

  return (
    <div 
      className={`
        h-full bg-[#181818] flex flex-col border-r border-white/5 
        transition-[width] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
        ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}
      `}
    >
      {/* 1. Header Area */}
      <div className="h-20 flex items-center px-6 relative">
        {/* Logo Text: width와 opacity로 부드럽게 트랜지션 */}
        <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-full opacity-100'}`}>
          <h1 className="text-2xl font-extrabold text-[#ff3f3f] tracking-tighter whitespace-nowrap">
            RELIA
          </h1>
        </div>
        
        {/* Toggle Button: 위치를 절대값으로 고정하거나 flex로 제어 */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`
            text-gray-400 hover:text-white transition-all duration-300 absolute
            ${isCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-6'}
          `}
        >
          {isCollapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>

      {/* 2. Main Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`
              flex items-center h-12 rounded-md transition-all duration-200 group relative overflow-hidden
              ${isActive(item.path) 
                ? 'bg-[#ff3f3f] text-white shadow-lg shadow-red-900/20' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }
            `}
          >
            {/* Icon Wrapper: 항상 고정된 너비와 중앙 정렬을 유지하여 찌그러짐 방지 */}
            <div className="min-w-[48px] h-full flex items-center justify-center">
              {item.icon}
            </div>
            
            {/* Label Wrapper: 너비와 투명도, 위치 이동(Translate) 애니메이션 적용 */}
            <div 
              className={`
                whitespace-nowrap overflow-hidden flex items-center
                transition-all duration-300 ease-in-out
                ${isCollapsed 
                  ? 'w-0 opacity-0 -translate-x-4' 
                  : 'w-auto opacity-100 translate-x-0'
                }
              `}
            >
              <span className="text-sm font-bold ml-1">{item.label}</span>
            </div>

            {/* Tooltip (Collapsed Only) */}
            {isCollapsed && (
              <div className="absolute left-[70px] bg-[#2a2a2a] text-white text-xs px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border border-white/10 shadow-xl font-bold">
                {item.label}
              </div>
            )}
          </Link>
        ))}
      </nav>

      {/* 3. Bottom Area */}
      <div className="p-4 border-t border-white/5 space-y-2">
        {/* Downloads */}
        <button className="w-full flex items-center h-12 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors group relative overflow-hidden">
          <div className="min-w-[48px] h-full flex items-center justify-center relative">
            <Download size={20} />
            {isCollapsed && <span className="absolute top-3 right-3 w-2 h-2 bg-[#ff3f3f] rounded-full ring-2 ring-[#181818]" />}
          </div>
          
          {/* <div 
            className={`
              flex-1 whitespace-nowrap overflow-hidden text-left pr-4
              transition-all duration-300 ease-in-out
              ${isCollapsed ? 'w-0 opacity-0 -translate-x-4' : 'w-auto opacity-100 translate-x-0'}
            `}
          >
             <div className="flex justify-between text-xs mb-1 font-medium">
               <span>다운로드 중...</span>
               <span className="text-[#ff3f3f]">82%</span>
             </div>
             <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
               <div className="w-[82%] h-full bg-[#ff3f3f]"></div>
             </div>
          </div> */}
          <div 
            className={`
              whitespace-nowrap overflow-hidden
              transition-all duration-300 ease-in-out
              ${isCollapsed ? 'w-0 opacity-0 -translate-x-4' : 'w-auto opacity-100 translate-x-0'}
            `}
          >
            <span className="text-sm font-medium ml-1">다운로드</span>
          </div>
        </button>

        {/* Settings */}
        <button className="w-full flex items-center h-12 rounded-md text-gray-400 hover:text-white hover:bg-white/5 transition-colors overflow-hidden">
          <div className="min-w-[48px] h-full flex items-center justify-center">
            <Settings size={20} />
          </div>
          <div 
            className={`
              whitespace-nowrap overflow-hidden
              transition-all duration-300 ease-in-out
              ${isCollapsed ? 'w-0 opacity-0 -translate-x-4' : 'w-auto opacity-100 translate-x-0'}
            `}
          >
            <span className="text-sm font-medium ml-1">설정</span>
          </div>
        </button>
      </div>
    </div>
  );
}