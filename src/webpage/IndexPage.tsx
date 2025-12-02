import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

export default function WebpageIndex(): JSX.Element {
  return (
    <div className="min-h-screen bg-[#121212] text-[#e1e1e1]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Hero Text */}
          <div className="space-y-6">
            <span className="inline-block rounded-md bg-[#ff3f3f] px-3 py-1 text-xs font-medium text-white">앱 소개</span>
            <h1 className="text-5xl font-extrabold leading-tight text-[#e1e1e1]">몰입형 게이밍 경험 — STOVE Quick Start</h1>
            <p className="text-sm text-gray-400 max-w-xl">
              게임 콘텐츠를 중심으로 디자인된 다크 테마 UI로, 아트워크가 돋보이도록 배경을 어둡게 유지합니다. 계정 연동,
              라이브러리 관리, 스토어 구매 플로우를 빠르게 체험할 수 있습니다.
            </p>

            <div className="flex items-center gap-4">
              <Link
                to="/webpage/download"
                className="rounded-full bg-[#ff3f3f] px-6 py-3 text-sm font-bold text-white transform transition-transform duration-150 hover:scale-105"
                aria-label="다운로드 페이지 이동"
              >
                다운로드
              </Link>

              <Link
                to="/"
                className="rounded-md border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-white/5 transition"
                aria-label="앱 둘러보기"
              >
                앱 둘러보기
              </Link>
            </div>
          </div>

          {/* Right: Visual / Card */}
          <div className="animate-[fade-in_600ms_ease-out]">
            <div className="bg-[#1e1e1e] rounded-lg overflow-hidden shadow-lg">
              <div className="relative aspect-video">
                <img
                  src="data:image/jpeg;base64,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"
                  alt="App visual"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded bg-[#ff3f3f] px-2 py-1 text-xs font-medium text-white">추천</span>
                <span className="absolute right-3 bottom-3 rounded bg-black/60 px-2 py-1 text-xs text-gray-200">데모 영상</span>
              </div>

              <div className="p-5">
                <h3 className="text-base font-bold text-[#e1e1e1] truncate">Featured Demo: Return to Moria</h3>
                <p className="mt-2 text-sm text-gray-400">심도 있는 게임 플레이와 몰입형 비주얼을 경험해보세요. 다운로드 후 오프라인 설치가 가능합니다.</p>

                <div className="mt-4 flex items-center gap-3">
                  <button className="rounded-full bg-[#ff3f3f] px-4 py-2 text-sm font-bold text-white hover:brightness-95 transition">바로 다운로드</button>
                  <button className="rounded-md border border-white/20 bg-transparent px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition">상세 정보</button>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#1e1e1e] rounded-lg p-4">
                <h4 className="text-sm font-bold text-[#e1e1e1]">핵심 기능</h4>
                <ul className="mt-3 text-xs text-gray-400 space-y-2 list-disc list-inside">
                  <li>웹3 지갑 연동</li>
                  <li>게임 라이브러리 관리</li>
                  <li>스토어 & 커뮤니티 통합</li>
                </ul>
              </div>

              <div className="bg-[#1e1e1e] rounded-lg p-4">
                <h4 className="text-sm font-bold text-[#e1e1e1]">시스템 요구사항</h4>
                <p className="mt-2 text-xs text-gray-400">Windows 10 이상 / macOS 11 이상 / 8GB RAM 권장</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="rounded-lg bg-[#1e1e1e] p-6">
            <h2 className="text-2xl font-bold text-[#e1e1e1]">다운로드 안내</h2>
            <p className="mt-2 text-sm text-gray-400">데스크탑용 설치 파일은 다운로드 페이지에서 운영체제별로 제공합니다.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
