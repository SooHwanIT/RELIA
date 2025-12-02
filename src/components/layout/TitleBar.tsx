import React, { useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Outlet 
} from 'react-router-dom';
import { Minus, Square, X, Home, Library, ShoppingBag, Users, LogOut } from 'lucide-react';


export default function TitleBar() {
  // Electron 환경이 아닌 브라우저 프리뷰에서는 window.close()가 동작하지 않을 수 있으므로
  // 실제 Electron 빌드 시에는 preload.js를 통해 ipcRenderer를 호출해야 합니다.
  const handleClose = () => {
    try {
      window.close();
    } catch (e) {
      console.log("Close button clicked (Works in Electron environment)");
    }
  };

  return (
    <div className="h-8 bg-[#121212] flex items-center justify-between select-none border-b border-white/5 sticky top-0 z-[1000] shrink-0">
      {/* Drag Region */}
      <div 
        className="flex-1 h-full flex items-center px-3 text-xs text-gray-500 font-bold tracking-wider"
        style={{ WebkitAppRegion: 'drag' }} 
      >
        RELIA - ELECTRON LAUNCHER
      </div>

      {/* Window Controls */}
      <div className="flex h-full" style={{ WebkitAppRegion: 'no-drag' }}>
        <button className="h-full px-4 hover:bg-white/10 text-gray-400 hover:text-white transition-colors outline-none">
          <Minus size={14} />
        </button>
        <button className="h-full px-4 hover:bg-white/10 text-gray-400 hover:text-white transition-colors outline-none">
          <Square size={12} />
        </button>
        <button 
          onClick={handleClose}
          className="h-full px-4 hover:bg-[#ff3f3f] text-gray-400 hover:text-white transition-colors outline-none"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}