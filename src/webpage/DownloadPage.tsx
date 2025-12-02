import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function WebpageDownload(): JSX.Element {
  const downloads = [
    { id: 'windows', label: 'Windows', size: '120 MB', href: '/downloads/stove-app-1.0.0-windows.exe.txt', filename: 'stove-app-1.0.0-windows.exe.txt' },
    { id: 'mac', label: 'macOS', size: '115 MB', href: '/downloads/stove-app-1.0.0-macos.dmg.txt', filename: 'stove-app-1.0.0-macos.dmg.txt' },
    { id: 'linux', label: 'Linux', size: '110 MB', href: '/downloads/stove-app-1.0.0-linux.AppImage.txt', filename: 'stove-app-1.0.0-linux.AppImage.txt' },
  ];

  const handleDownload = (href: string, filename: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#e1e1e1]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="space-y-6">
          <h1 className="text-3xl font-extrabold text-[#e1e1e1]">앱 다운로드</h1>
          <p className="text-sm text-gray-400">운영체제에 맞는 설치 파일을 선택하여 다운로드하세요. 모든 빌드는 테스트용이며 설치 후 문제가 발생하면 이슈를 남겨주세요.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloads.map((d) => (
              <div key={d.id} className="bg-[#1e1e1e] rounded-lg p-6 flex flex-col justify-between transition-shadow hover:shadow-lg">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#e1e1e1]">{d.label}</h3>
                    <span className="text-xs text-gray-400">{d.size}</span>
                  </div>

                  <p className="mt-3 text-xs text-gray-400">권장: 최신 운영체제에서 실행하세요. 설치 중 관리자 권한이 필요할 수 있습니다.</p>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => handleDownload(d.href, d.filename)}
                    className="flex-1 rounded-full bg-[#ff3f3f] px-4 py-3 text-sm font-bold text-white text-center transition-transform transform hover:scale-105"
                    aria-label={`Download ${d.label}`}
                  >
                    다운로드
                  </button>

                 </div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-[#1e1e1e] rounded-lg p-4 text-sm text-gray-400">
            <p>버전: 1.0.0 (테스트 빌드)</p>
            <p className="mt-1">릴리즈 노트: 초기 베타 릴리즈 — 기본적인 라이브러리 및 스토어 기능 포함</p>
          </div>

          <div className="mt-4">
            <Link to="/webpage" className="text-sm text-[#ff3f3f] hover:underline">소개 페이지로 돌아가기</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
