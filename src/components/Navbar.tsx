import { Search, Bell, ShoppingCart, Menu } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-stove-bg/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left: Logo & Menu */}
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-stove-accent cursor-pointer">STOVE</h1>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {['홈', '스토어', '커뮤니티', '마이페이지'].map((item) => (
              <a key={item} href="#" className="hover:text-stove-accent transition-colors">
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Center: Search Bar (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="게임 검색..."
              className="w-full rounded-full bg-stove-card py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-stove-accent"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-stove-muted" />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-stove-hover rounded-full transition-colors"><Bell className="h-5 w-5" /></button>
          <button className="p-2 hover:bg-stove-hover rounded-full transition-colors"><ShoppingCart className="h-5 w-5" /></button>
          <button className="hidden sm:block rounded-full bg-stove-accent px-4 py-1.5 text-sm font-bold text-white hover:bg-red-600 transition-colors">
            로그인
          </button>
          <button className="md:hidden p-2"><Menu className="h-6 w-6" /></button>
        </div>
      </div>
    </header>
  );
}