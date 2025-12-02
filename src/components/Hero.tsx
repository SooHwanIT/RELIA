export default function Hero() {
  return (
    <section className="relative h-[400px] w-full overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="absolute inset-0 bg-black/40" /> {/* Overlay */}
      <div className="container mx-auto flex h-full items-center px-4 relative z-10">
        <div className="max-w-2xl space-y-4">
          <span className="inline-block rounded bg-stove-accent px-2 py-1 text-xs font-bold text-white">
            추천작
          </span>
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Lord of the Rings: <br /> Return to Moria
          </h2>
          <p className="text-lg text-gray-300">
            난쟁이들의 고향을 되찾기 위한 여정을 지금 시작하세요.
          </p>
          <div className="flex gap-3 pt-4">
            <button className="rounded bg-white px-6 py-3 font-bold text-black hover:bg-gray-200 transition">
              지금 구매하기
            </button>
            <button className="rounded border border-white/30 bg-black/20 px-6 py-3 font-bold text-white hover:bg-white/10 transition">
              찜하기
            </button>
          </div>
        </div>
      </div>
      {/* Background Image Placeholder */}
      <img 
        src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
        alt="Hero BG" 
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-60"
      />
    </section>
  );
}