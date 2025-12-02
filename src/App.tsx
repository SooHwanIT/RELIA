import React, { useState } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  Outlet 
} from 'react-router-dom';
import { useWeb3AuthConnect, useWeb3AuthDisconnect } from "@web3auth/modal/react";

// 컴포넌트 import
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import WebpageIndex from './webpage/IndexPage';
import WebpageDownload from './webpage/DownloadPage';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import LibraryPage from './pages/LibraryPage';
import CommunityPage from './pages/CommunityPage';
import GameDetailPage from './pages/GameDetailPage';
import LoginPage from './pages/LoginPage';
import MyPage from './pages/MyPage';
import AdminUploadPage from './webpage/AdminUploadPage';
import TitleBar from './components/layout/TitleBar';


// -----------------------------------------------------
// ★ 1. TitleBar를 포함하는 공통 레이아웃 컴포넌트 추가 ★
// -----------------------------------------------------
// 모든 TitleBar 적용 페이지의 부모가 됩니다.
const AppWithTitleBarLayout = () => {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#121212] font-sans select-none text-white">
      {/* TitleBar가 필요한 페이지 그룹에만 적용 */}
      <TitleBar /> 
      {/* Outlet으로 하위 컴포넌트(MainLayout 또는 PublicRoutes)를 렌더링 */}
      <div className="flex-1 overflow-hidden relative w-full">
        <Outlet />
      </div>
    </div>
  );
};

// -----------------------------------------------------
// 2. 로그인 후 메인 앱 레이아웃 컴포넌트 (Sidebar, Header 포함)
// -----------------------------------------------------
const MainLayout = ({ address, handleLogout }) => {
  return (
    // MainLayout은 TitleBar 영역을 제외한 나머지 공간을 차지합니다 (부모의 flex-1 내부에 있음)
    <div className="flex flex-1 overflow-hidden h-full w-full bg-[#121212] text-[#e1e1e1]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212]">
        <Header walletAddress={address} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto scrollbar-hide relative bg-[#121212]">
          {/* Outlet 자리에 하위 페이지(Home, Store 등)가 들어옵니다 */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// 3. 보호된 라우트 (경비원 역할)
// 로그인이 안되어 있으면 로그인 페이지로 보냅니다.
const PrivateRoutes = ({ isAuthenticated }) => {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

// 4. 공개 라우트 (로그인 페이지용)
// 이미 로그인이 되어 있는데 로그인 페이지에 오면 홈으로 보냅니다.
const PublicRoutes = ({ isAuthenticated }) => {
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [address, setAddress] = useState(null);
  
  const { connect: connectWeb3, loading, error } = useWeb3AuthConnect();
  const { disconnect: disconnectWeb3 } = useWeb3AuthDisconnect();

  const handleLogin = async () => {
    try {
      await connectWeb3();
      // 로그인 성공 시 상태 업데이트
      setIsAuthenticated(true);
      // NOTE: TS 에러 방지를 위해 타입 강제
      setAddress("0x71C...MockAddress" as any); 
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await disconnectWeb3();
    setIsAuthenticated(false);
    setAddress(null);
  };

  return (
    <Router>
      <Routes>
        
        {/* ---------------------------------------------------------- */}
        {/* ★ 1. TitleBar가 필요 없는 페이지 그룹 (최상위 레벨) ★ */}
        {/* 이 페이지들은 TitleBar가 없는 전체 화면을 차지합니다. */}
        {/* ---------------------------------------------------------- */}
        <Route path="/webpage" element={<WebpageIndex />} />
        <Route path="/webpage/download" element={<WebpageDownload />} />
        <Route path="/admin" element={<AdminUploadPage />} />

        {/* ---------------------------------------------------------- */}
        {/* ★ 2. TitleBar가 필요한 페이지 그룹 (AppWithTitleBarLayout 내부) ★ */}
        {/* ---------------------------------------------------------- */}
        <Route element={<AppWithTitleBarLayout />}>
          
          {/* CASE A: 로그인이 필요 없는 페이지 (로그인 페이지) */}
          <Route element={<PublicRoutes isAuthenticated={isAuthenticated} />}>
            <Route 
              path="/login" 
              element={
                <LoginPage 
                  onLogin={handleLogin as any} // TS 무시
                  isConnecting={loading} 
                  error={error} 
                />
              } 
            />
          </Route>

          {/* CASE B: 로그인이 필요한 페이지들 (홈, 스토어 등) */}
          <Route element={<PrivateRoutes isAuthenticated={isAuthenticated} />}>
            <Route element={<MainLayout address={address} handleLogout={handleLogout} />}>
              
              {/* Main App Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/store/:id" element={<GameDetailPage />} />
              <Route 
                path="/mypage" 
                element={
                  <MyPage 
                    userInfo={{
                      name: "Gamer",
                      email: "test@email.com",
                      walletAddress: address
                    }}
                    onLogout={handleLogout}
                  />
                } 
              />
              
            </Route>
          </Route>

          {/* 그 외 이상한 주소로 접근하면 무조건 홈으로 보냄 (TitleBar 유지) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;