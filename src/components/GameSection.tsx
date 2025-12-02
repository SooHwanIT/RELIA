import { Link } from 'react-router-dom';

interface GameProps {
  id: number;
  title: string;
  price: number;
  discount?: number;
  image: string;
  tags: string[];
}

export const GameCard = ({ id, title, price, discount, image, tags }: GameProps) => {
  // 할인율이 있을 경우 최종 가격 계산
  const finalPrice = discount ? price * (1 - discount / 100) : price;

  return (
    <Link to={`/game/${id}`} className="group relative cursor-pointer flex flex-col gap-3">
      {/* Image Area */}
      <div className="relative overflow-hidden rounded-lg aspect-video bg-[#1e1e1e] shadow-lg">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Discount Badge */}
        {discount && (
          <span className="absolute bottom-2 right-2 rounded bg-[#ff3f3f] px-1.5 py-0.5 text-xs font-bold text-white shadow-md">
            -{discount}%
          </span>
        )}
      </div>

      {/* Content Area */}
      <div>
        <h3 className="truncate font-bold text-[#e1e1e1] text-lg group-hover:text-[#ff3f3f] transition-colors">
          {title}
        </h3>
        
        {/* Price Info */}
        <div className="mt-1 flex items-center gap-2">
          {discount && (
            <span className="text-sm text-gray-500 line-through decoration-gray-500">
              ₩{price.toLocaleString()}
            </span>
          )}
          <span className="font-bold text-white text-base">
            ₩{finalPrice.toLocaleString()}
          </span>
        </div>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span 
              key={tag} 
              className="rounded bg-[#1e1e1e] border border-white/10 px-1.5 py-0.5 text-[11px] text-gray-400 group-hover:border-white/30 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export  function GameSection({ title }: { title: string }) {
  // Mock Data 생성 (실제 구현 시 API 연동)
  const games: GameProps[] = Array(4).fill(null).map((_, i) => ({
    id: i + 1, // 라우팅을 위한 고유 ID
    title: i === 0 ? "Lord of the Rings: Return to Moria" : `판타지 어드벤처 ${i + 1}`,
    price: 35000 + (i * 5000),
    discount: i % 2 === 0 ? 20 : undefined, // 짝수 번째 아이템만 할인 적용
    tags: ['RPG', 'Action', 'Indie', 'Co-op'],
    // Unsplash 랜덤 이미지 (고정된 시드값 사용)
    image: `https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=500&auto=format&fit=crop&q=60&sig=${i}`,
  }));

  return (
    <section className="py-8 border-b border-white/5 last:border-0">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Section Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#e1e1e1] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#ff3f3f] rounded-full inline-block"></span>
            {title}
          </h2>
          <a href="#" className="text-sm text-gray-500 hover:text-[#ff3f3f] transition-colors font-medium">
            더보기 &gt;
          </a>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
          {games.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      </div>
    </section>
  );
}