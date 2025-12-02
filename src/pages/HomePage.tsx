import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Gift, Flame, Tag, Timer, PlayCircle } from 'lucide-react';

// ----------------------------------------------------------------------
// 1. TYPES (타입 정의)
// ----------------------------------------------------------------------

interface GameCardProps {
  id?: number;
  title: string;
  price?: number;
  discount?: number;
  image: string;
  tags?: string[];
  isLarge?: boolean; // 큰 카드 모드
  className?: string; // 추가 스타일링을 위한 클래스
}

interface SlideData {
  id: number;
  title: string;
  desc: string;
  image: string;
  price: string;
}

// ----------------------------------------------------------------------
// 2. SHARED COMPONENTS (검증 및 개선된 공통 컴포넌트)
// ----------------------------------------------------------------------

// 2-1. Section Header
const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-[#ff3f3f]/10 rounded-lg">
        <Icon size={20} className="text-[#ff3f3f]" />
      </div>
      <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>
    </div>
    <button className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-1 transition-colors group">
      모두 보기 <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

// 2-2. Game Card (높이 채움 및 비율 문제 해결)
const GameCard = ({ id = 1, title, price = 0, discount, image, tags = [], isLarge = false, className = '' }: GameCardProps) => {
  const finalPrice = price * (1 - (discount || 0) / 100);

  return (
    <Link 
      to={`/game/${id}`} 
      className={`group block relative w-full ${isLarge ? 'h-full' : ''} ${className}`}
    >
      <div className="relative overflow-hidden rounded-xl bg-[#1e1e1e] border border-white/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#ff3f3f]/50 h-full flex flex-col">
        
        {/* Image Area: Large일 때는 높이를 유연하게, 아닐 때는 16:9 고정 */}
        <div className={`relative w-full overflow-hidden bg-gray-800 ${isLarge ? 'flex-1 min-h-[250px]' : 'aspect-video'}`}>
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          {/* Hover Play Button Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
             <PlayCircle size={48} className="text-white drop-shadow-lg transform scale-90 group-hover:scale-100 transition-transform" />
          </div>
        </div>
        
        {/* Discount Badge */}
        {discount && (
          <span className="absolute top-3 right-3 z-20 bg-[#ff3f3f] text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
            -{discount}%
          </span>
        )}

        {/* Info Area */}
        <div className="p-4 flex flex-col justify-between">
          <div>
            <h3 className={`font-bold text-white mb-1 truncate group-hover:text-[#ff3f3f] transition-colors ${isLarge ? 'text-2xl' : 'text-base'}`}>
              {title}
            </h3>
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.slice(0, 2).map((tag) => (
                <span key={tag} className="text-[10px] text-gray-500 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-end justify-end mt-3">
             <div className="text-right">
                {discount && <div className="text-xs text-gray-500 line-through mb-0.5">₩{price.toLocaleString()}</div>}
                <div className="text-sm font-bold text-white">₩{finalPrice.toLocaleString()}</div>
             </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ----------------------------------------------------------------------
// 3. SECTION COMPONENTS
// ----------------------------------------------------------------------

// 3-1. Hero Carousel (반응형 높이 수정)
const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides: SlideData[] = [
    {
      id: 1,
      title: "Lord of the Rings: Return to Moria",
      desc: "드워프들의 고향을 되찾기 위한 여정이 시작됩니다. 친구들과 함께 전설적인 광산을 탐험하세요.",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
      price: "₩35,000"
    },
    {
      id: 2,
      title: "Cyberpunk 2077: Phantom Liberty",
      desc: "나이트 시티의 가장 어두운 구역, 도그타운으로 잠입하여 대통령을 구출하십시오.",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=1600&auto=format&fit=crop",
      price: "₩34,000"
    },
    {
      id: 3,
      title: "Lies of P",
      desc: "벨에포크 시대를 배경으로 한 잔혹동화 액션 RPG. 제페토를 찾아 도시의 비밀을 밝혀내세요.",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop",
      price: "₩64,800"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    // min-h-[500px]로 변경하여 큰 화면에서도 비율 유지
    <div className="relative w-full h-[50vh] min-h-[500px] overflow-hidden group bg-black">
      {slides.map((slide, index) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-80" />
          {/* 가독성을 위한 그라데이션 강화 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center px-8 md:px-16">
        <div className="max-w-2xl space-y-6">
          <div className={`transition-all duration-700 delay-100 ${slides[currentSlide] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="inline-block px-3 py-1 bg-[#ff3f3f] text-white text-xs font-bold rounded mb-4">HIGHLIGHT</div>
            <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-2xl mb-4">
              {slides[currentSlide].title}
            </h2>
            <p className="text-lg text-gray-300 line-clamp-2 drop-shadow-md mb-8 max-w-xl">
              {slides[currentSlide].desc}
            </p>
            <div className="flex items-center gap-4">
              <Link 
                to={`/game/${slides[currentSlide].id}`}
                className="px-8 py-4 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                지금 구매하기 <span className="text-sm font-normal text-gray-600">| {slides[currentSlide].price}</span>
              </Link>
              <button className="p-4 bg-white/10 text-white rounded hover:bg-white/20 backdrop-blur-sm transition-colors border border-white/10">
                <Plus size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-12 flex gap-3 z-10">
        {slides.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-12 h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'bg-[#ff3f3f]' : 'bg-white/20 hover:bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
};

// 3-2. Featured Section (레이아웃 깨짐 수정 - Flex Height 동기화)
const FeaturedSection = () => (
  <section>
    <SectionHeader title="주목할만한 할인" icon={Tag} />
    {/* Grid 설정 수정: 높이 동기화를 위해 items-stretch 적용 */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-fr">
      
      {/* 왼쪽: 큰 카드 (높이 100% 차지) */}
      <div className="lg:col-span-2 min-h-[300px]">
         <GameCard 
            title="Elden Ring: Shadow of the Erdtree"
            price={49800}
            discount={10}
            image="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUTExIVFhUVFRUVFRUXFxUVFxUVFRUXFxUVFRUYHSggGB0lHRUWITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGhAQGy0eHx0tLS0tLS0tLS0tKy0tLS0tLS8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8tLS0tLS0tK//AABEIAKgBKwMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAACAwABBAUGB//EADoQAAEEAQMCAwYEBAYCAwAAAAEAAgMRIQQSMUFRBSJhBhMycYGRFKGx8CNCweEHUmKS0dIk8XJzov/EABkBAAMBAQEAAAAAAAAAAAAAAAABAgMEBf/EACgRAAICAgIBAQgDAAAAAAAAAAABAhEDEiExQQQTIlFhcYGR8KGx0f/aAAwDAQACEQMRAD8A+LkqWrcFKUkEtWqpWgCWpalKUmIlqWrpSkgKV2rpSkAQKFXS6Gj8D1Mzd0UL5B3ZTq+dHH1Q2kuQSb6Obalrpz+zurY1z3aeRrWtLnOIAAaBdk36LmJKSfQ2muyx80WwoQnRSV+8H5p8iFbSr2n1W6GWMnzsx3aaI+hsfkulFpdO4gNmLb6yMqvqwm/sFnKevaLjDbpnn9hVEFfS9B/hrPMz3kU2me0/DTzn5+XC4/ivsn7hxbLPCC0Ami94N9G03P5LJeqxt0maP080eMAKvYV3ZdLA3iR7/k0MH5ucT9gudqnt/lFfmVrGd9GbjXZjLT6oSjLkK0Isq1LRxxlxDWgucTQaASSewAySum72Z1oFnR6iv/qkJHzaBY+qTaXbBJvo5NqJj4i3DgQexBHBIPPqCPmD2Q0qoVg2qtEqISoYNqWrVIAqyqtWpSBlWqJVqiEAVaYw4S0bOExhOCpMc1DtTomwVYV7Ve1KhFK1Yai2J0Kxauke1XsRQWAArR7VA1OhWCAvYf4dtcfxjGtvfpyKvO+nhlDryR05Xkwxex9htI9sWreWODZIWxMJaQ17pN4ABODyP9yx9Rxjd/vJrg5meef4BqtPG+V8Tomhm0k7fMJCIy2gb4ff070tviZaPD9IQyMPldqBI8Rxh7mxPDWDeBfX69Vm0ns7qhuuCSJm3+LI9hY1rGkPJJdW6iwGhyQO60avUad+k00HvnB0Jmc4+6cQffO3EA3eKA46lD5a88+Pp9y10/HHn6gey4BbqmuZG7ZpJpmb42PLZGFlFpc0nrxwtfsxHDrX/hZ4mNe9jzDPExsTxI1t7ZGsAa9tA8i8c5sV4BPo4fxAfK+pdLJpmkROJ3SFpMxbflA2gBt2fRI8K1kOjcZY3maba5sR2OjjjLhRkdv8ziBdNAA9UpK7a78BF1VtV5Nuq0E50mlfFBG57/ftmcINO4kslDGWXNwcOyKtZvAdY1uomM0MT2NZI97BHGQ0xlrSYrHl60AQD+YLxGbSy6XSQe/cHacTB7jC9wcZnh5IyDYIr1Wbw58DXajdK6nwPiY4xuJe9+0l7hflFtPUnhCXuv8Az5g2rXP8/I9L7Pe+0epjDJDJpZ3sLHjzNex0gZTm1TXDdnA4vGQPMa/xQvZZ+Lbd7WtAzY2sGAPSqyV6T/DVsz3SRBhlgZtmcyr2OY9tSRkkUepHUDvg+GAJaAewz/VRDGnN34KnkqCryfRNbo3/AIzTVpYTpHQwP1DnaaJsIDmkzudNsG1wGRTgbpeY9lGxu8SjjDI5IHzvAbK1rmuhG8tve1xvZx1Jrqt+u9pI26mOSL+JD+Gi0+ohcwtErW2HjacdbaeQR2Jvn+H6vT6XXRzwPe6Fj9w3MPvGte17S0i6cWh3N5/JOKkou14E3FyXPkX7P65v4wvkhilj2zudE6GOtscUkjQ1u2mHyAWK9U/xjwxsM0epgIk0c727XuYxwbud/EhkYRQIyOBgeiw+HGFk7nOlOzbM0OEbiT76J8Y8uKrfZz0wp4N4l7guif8AxNPI5vvWDrtIIkYDw4V15GD0IqUXdx+H79yYyVU/ieg/EHSaXU6mEbJNTKYIZWNYz3UQkka9sYbmMlkfNDnmxjyPhuokhlZPHu3xvDw4XZINkFw75B7gler8P8a08mj1OhnO0OldLpZtpDQ4ybmteD8ANnJwA91mwLP2M0M2j1sUss0UUA375BqYDE9pjeGmmyee3baFXxwpXuxla5/tFS96Sp8HjJyS5xIoucXEcfEb6/NLWzxNxdNK4v33I87928OBcaId1FUswYuhLg52+RZCqkZCqkBYFKkZCqkh2BSpM2odqKHYFKqTdiragLF7UxjcK6TGjCAsnVE1qWSmMcrRDCLEstymWrGSUybBa1Na1QBGAmkS2DsCrYmUqLUxWL92mMjVtRtcgG2VsQuivkWng2ja1BGzRjdpx2ViJbtgV0ih7sxNYjES0iFPZpwRd54pJuhp2c4QrbpPCXvIoUOS48AZs+vBXf8AAtBGA6adoMTPJRD/ADSOBLQ3bWRVnIoetLn62V76AwxpO0CgAecNGLvrS53kbdR/J1QxpK5fg9r7D6ODTy6gR6on/wAWVsjhG4BlOFuBJ857CuuO68o72cileG6WZsh83kNscA0F107nyjp/c9f2K0Urm6k7HCP8JMRyNzgLa4C/MfKR2yV5efTvYQ1zC0mi0nG4duxyD8jYPpzQjLeVS5OqTjouDN4t4RJp5DHKxzHjlrhR9CO49QsGxd86sysEcxLg3DHEm4/l/p/0/wBcrlz6fa4tJGOoyF2Qb6l2cM15j0Y3NVsiWh8FIS0LUysF0WFmMY7LSXoGxEoBOgBHhA5tLWxtIHMRQJmbap7tP92qLUqHsIMar3aeWoSEUOxRYh2pxCEhKh2KIVUmEKkqHYFI2jCqkxowih2Y6ymtCApkfISQ2M2c/NRoRk/rajQrM7LZJXKYM8KtqAhMkYQoEyOj81RjTFZXKIRoKpNilQFfAbHGmltIo3A8BW75IsigQ1CmBym1S2UkWyWk/Tvs8c9Er3N8L0Hs34Y33kZeL3ObTeLskDJ7kUFjlyKMWzoxYnKVHed7Pn3DNxeIWsEshDS4gvA27GN5NHPmoBuawvN+JxPYNrY/dxuyLA304mg99X/Lx6L1v+Ifir9zGRucyMNGxrD5do2mw4Yd5h6jyjPIHg4GPkfgmybuzzd2T3srlwRdbM7clXqj1XsHpngan4mk6V9uog0Mgj1phF8/quKNPqQdkQl89DbRp4sVg4Lb+i+hew3iWyOSJzjIWRSSOt9taG15WHp5XGyDQrC8f7VyCV7ZIXPEb2i2uJ8hs2Cbs+bdntSjHNvK78lzh7i+Qp3hcc264jDPRcyOOyyXZtttOsRHLv5sVwMA83xXRuOlhl2UQXxPwRRjqrBHZze/04WbTTvjcCxxaR/MCQbGRn6BfSh4nFrdCGShoe55aH7RfvdrckNyQ7cLPXcT0paZJSxtPtGUYKaaPjb7SqXd8Y8JdDIWkf8ABHcHqFzHRUuuORSVo5HiadMTDDZyjeUQNYTh4e4+nf09FWxLgIaLS5mEdFtEbWcZPFrNK8lUmQ1QprFRCOj1VBpOALRYhZagLVpihs54Qvb2TJsz7ELgn0kvPZA0xJKraiKoFI0IGpreEu0xnCBGMhEAoQiAUotsY1ElsTyFaM2QFQqNRFiYgGqWmwR8qixAXyVyra1W1qa1nqkOxsA7crXET1S4GjmvqMrVs4rqpbBKyhpbqv7pz4KfQGDx3RRHacrqsaxzQbo+vf1WE8lG8MOxPDPCC942gm+Md+hH5LdrWlupidtaXtLD7sANAqtgIB6iu1Wt/gTqd8OS1wr+UktIBPYA0VxZ9KRI4uNbTknBu+K78/Yrk2cpuzuWPWKoQXOnY2zZjFdSdhcTgfzUXHree3GWIlrS4Chw3nzHFgEdQHfn8l05WGGX4S09+7T0ezhw+31wuvpPBo9U0Na9sb7e4NcfI97qLiDyymtbijho45NuaivkwUNvqjm+zGrDXajNA6eZtd7oV69/osOh1PneDZZINrhZGSPK7HUGjWeq9d4X7IPBlAG/+HI3ewggvoEAG+PLVn+yw6L2Vka8Ok2R3W0PcDkEAjbnN5rqsvaQuTNHB8I8xrPDnNfs204eUjGXdc8f0wtbNWWwyxxhzmj3R3XjfYD6FDBNV1poK9h7QQRwyeR212wBxbe8W3I3EVeckd6XmRbIZAwBpe5rQ7F4skbzxggY6HPKccu65Q/ZKLtAxk6oESUJGNANg4DRQLqB4AzixV91wJdK8NINAfESe11u9bIwvX+wuicHyXYa+J7augTWLHWjx60k+NaVrGh7jefK2sB3r6NFY79kQya5HFBPHtC2eM0OjcXYx5bs+uMduTn0WjVyBrQxuaGT6rfNJtYO7srkuYTxQ+f/AAu1O+Tgmq4EhuLtUB6ZWz3G0c2kSxkHjnqVqnZzSVCY4Q4+i0+7AFAV/VRjmtCU/UWaVIzZThSQ9MkdYWZyogN0bdp4vvf6LG4BNcUh6CooByGlHOUdwpNCbUxgws9prZCkOhBcjYUhG1SmW0aGJ7Ss7Ea0Rk0agAjFLGCU+F3ROzNobagYijeEdpiA29kG3lNYFT0hpjtJNsxV+i7ulIcNwGSBY5XmtKfN9PsuvpZ6IWc42jSLpm10Z3bqscZF4K6Gi0vvGECg5p4qsVgqtHOD8+60SyO3B7fiArHUdL7rlmmzuxySN3gwdG4fCWm25o36Uc9ls8Z8DcXX8NgGiKAvJoDjhJ0HiDJMPb5uhGOB1Xp9FIyWMRONUKbJRdn/AFWcD5LzskpRnfR6MdXH4nk5dAHMABt8YO7/AFR427Wk8gl1gd77punNRuDfiDeAM7Th1Hp6+l+q7eq8HeDtc3NW1wF8dnDpgrLp/DyxwcGndY20L/8Az1H7+Y8yaplLH5Rl8HnLDI48GN9iziyAD9yD/wC1PAmB8nmprG+Z7v8AKGi7rrxX1XsdL7PMlaXDktoiqp1g461hcXxPwuKNpia71fVlzjWAQcAA9lmsifLXYKm6T5R5rxSVxcfXzD/4ng+mKWB7C6mNNj9SeT+g+i9CfDC5u2sc4Gb6Z6/JbvC/Zp7SHPFDBN4xjotFmjGP0CULfI/wfS7IXO/mIEbM0a4P5jn0Xl/HNPnHmLBxeB3P5D5r13i3iAYzyDvgcAfb90F4zxGdu+w6wRZ6Y7FZen2ctisjWvJwJ4iXC82Lx0rosrx5i2s2urqZB7wbbAAIzznss8jGB13ntz9SvZx2+zx80kujN+Fc4A/ukvWt9Rjsmama8A2O/Cw6mesBdCRxSlZnLlRYhBSy+1RIxxHdJkclSZKpMdFuCW4Kyj24OUD6MrghITHoCpNEAUTeEKY1IZmpQK7USosYx1LUFjamNcqTM5I0YTGSgccrNuV9E7IcS2SUbXRYVySt+kP9kIU0Pc5A7hMcEiV/QKiEHpub/JaxOAuaJSFqiiLspDZtj1eOV09Hr6FHI6HsvP8AuiFt0zicKZRTKhNo9Jo/EGBwdkEdV6LTeJt+IPGOQTX1XiYmLdGAG55wuTJhjI7cWeSPpHh3jm4DaXDqB1zRrH6LbL4gSCARZ7V15/uvnvhs5Y5pDiAfiXd0/iAJOfuvNy+kp8Hfjzprk9L4fqnt3HddtIFng4ogqabV5uWnkf5hf6riR60gHg3hL/FAi3GvyWXsGae2gzvjxtlnbtG0mwGgC6zx++VyfFfHnPGTQsZJ5XmptaQTXBNkfMpE+raaLgMfoumPo7fJg/UpdI1eJeLCShZwOxH3XH1Ejbsfmhk1LTZaB8v+FzZpl3YsCjwjiy+pbC1errpnv/Vc78RWeT1VTuJSZBQsrrjFI4ZTbKfMSbSy9EyBxF0aR+4HfgZVEmZ5Q+6cOh/fZaJZG80Pssz5yUFoElCQoM57IpDhIZTWWkPcnN4Sw20wQurVPYncJDpMnslwUrAVtQvKtvCk0QlwVIiVAlRRYKYK7oAiCZLDpCXK0JCBFm0/TyUUhoKawIQmuDY+XCSzJQZKdAKOVZnVItrAef33W2F9UP3QWE8rQOOP3df1QSzoijlMDOywiXoFuilxdgd0Mmh8dhbon7uVjhfn9UxwkGWFvI5+GvU8/ZZSRrBnZgivhbBCRnH1XlXe0T4zThEK589j7fF9gfmseu9qdR3awHimjjobdePUVys9LN1JnuZNVigPssOr1JoC1zPDPE7cBI8Fr2kscBlpaSCJQPh/logdRyutqNOHWRdg0fnQP9QkopMTkzjzTE91mc5x5XRkhCD8KTwtLRm2zD7qvkudr5STQwPVdbVMc280ByVz9TsLSbs+vKuJnJnGkk6Ek1f98p+n1ZdjrWOPqss7DakUZVDpUaX6190TfTohExJylOiUBQFIbIszk0uS3FA0ACQjfwllyIuQNltCUTlWXnulEoBIjglphCAtSaLQLlbeEJRN4SKQq0QQlQuSsY3cOyprlnL1bXfolYamxhBwmNaFi3lNilIVKRDizVG2zXZNZER0tYnPO7cOVpj1Z6p2iGmuhobSp92niQdlXvx/lCoztijePVanRmlkL82tMUxASsbTLLCKOcLXo25yOTaznVX27Z5PyABtM0utN1sI+nTuk2JRZ2dPpXWS0cm88/8AC3aVhac8dlym+KFou6Hav0WbUeMSOOPL2NCyo5Zoj1Mj4mtMj2ghgLidoLqGTS8noNI3Ualsk7v4cj6JF1wNjT/l5aLH91si126N0crtrHt2lxIxeCbK58A/8Zvm2lkhcD/L8A56k/CBzXm7qKNYnsvDvZ/Usc5kcEFMcfdzSfG1u4kNGLcSDzgDPJwup4RoXmNxldvPvZG7gAL2O2E7QMZaV5/S+3b2ac2zdMMNPIIrDnAdR+ePVcHVe2OpJLGvLW7nGhbbLyXOOOQS5yVD7Pfv8OaeAVil8OHm9OPReX8N9s5IrZK4kGtrqDi305sj1Wp/jgdbhqH5o8jHptJ4RTJaHa7SGup+5XGm0pB4XVZ4zuySK71XSsBKm1t4BaD98drrlWpNGbgcSXSEZISmspadS+Sx5vXn+iS57iRdfotEyHFoAhZ3tWg31QOcFQk6EFqU4rS9ZygpMgYhc1GXEJUgKBoohCQqGFe5BQJQOKMlKLkmNAlE3hCSibwpLQl7vVA5WTlWKUFgBG1/3VUogCrRbuxQ0pSQDo3eqbv9VkCu0WS4mwTeqFsqzAq07FqjcJAE2GfcecLmucqaaT2FodJs1Gx8vkOoTJfEA7Jq7HArjHI4/fNrlukKW00hsagdluptKMrr+PZXzzffvwsAmIUa6v6obEoGous/HefnfqnEOLa3XXSzj68D7rL+Ix1QGW+/y6fZSUN3k5DnUOcnHyooef0GfvQVfiMdL9Rf58pkepwQev2QAbIJDXQG6vA49cIWxkjPA+f7P0S3Tg4sfTv9EDp+l/v7IDk60etDWBrXUOwH6uOf1STrfmT+npdLmFygcgKNrPEHE1ZrkAGgPt++UD5TfUfUnPJ+36rLv7KFydg0bo9WevRGdTfVc0PViVUpEPGjaZUQlCw+8UMirYNDd71A6VYy9VvKNw0NRnS3OtItQOS2HoNtCXJZeqtLYrUIuRMdhLtMYcJWOhRClKKKSiZUr0UUQBKUr0UUQBKUpRRAEpSlFEASipRUUQBKKleiiiANDWxVkyXXQNq+vJ4Uc2Lp73ryGYxjAOc11CtRAB1B3m/2x/8AbP5Iahrma6/ysq677u6iiAIWw95v9rP+37/SbYe8v+xn/dRRAAsbF/MZL9A2vzRBsPeb/az9dyiiAKLIehl+rGfa93y7deOEh4yauulijXqFFEADXoplRRAEypRUUQBKKmVFECJRUUUQMmVKUUQIleilKKIGSimM4UUQB//Z"
            tags={['RPG', 'Open World', 'Souls-like']}
            isLarge={true}
            className="h-full"
         />
      </div>

      {/* 오른쪽: 작은 카드 스택 (Flex로 높이 분배) */}
      <div className="flex flex-col gap-6 h-full">
        <div className="flex-1">
          <GameCard 
            title="Hollow Knight"
            price={16000}
            discount={50}
            image="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop"
            tags={['Indie', 'Metroidvania']}
            className="h-full"
          />
        </div>
        <div className="flex-1">
          <GameCard 
            title="Stardew Valley"
            price={16000}
            image="https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=500&auto=format&fit=crop"
            tags={['Simulation', 'Farming']}
            className="h-full"
          />
        </div>
      </div>
    </div>
  </section>
);

// 3-3. Event Banner (텍스트 가독성 개선)
const EventBanner = () => (
  <section className="relative rounded-2xl overflow-hidden h-36 flex items-center px-10 border border-white/10 group cursor-pointer shadow-2xl">
    <div className="absolute inset-0 bg-gradient-to-r from-[#5a0000] to-[#121212] z-0" />
    <img 
      src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&auto=format&fit=crop" 
      className="absolute right-0 top-0 w-2/3 h-full object-cover opacity-30 mix-blend-screen group-hover:scale-105 transition-transform duration-700 mask-image-gradient-l" 
      alt="Event"
    />
    <div className="relative z-10 flex items-center justify-between w-full">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-white/10 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm border border-white/5">EVENT</span>
          <span className="text-red-300 text-xs font-medium flex items-center gap-1 animate-pulse"><Timer size={12}/> 3일 남음</span>
        </div>
        <h3 className="text-3xl font-extrabold text-white italic tracking-tighter drop-shadow-lg">WINTER SALE IS COMING</h3>
        <p className="text-gray-400 text-sm mt-1">최대 80% 할인, 당신의 지갑을 준비하세요.</p>
      </div>
      <button className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors shadow-lg">
        자세히 보기
      </button>
    </div>
  </section>
);

// 3-4. Trending List
const TrendingSection = () => (
  <section>
    <SectionHeader title="지금 뜨는 인기 게임" icon={Flame} />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
       {[1,2,3,4].map((i) => (
          <GameCard 
            key={i}
            id={i + 10}
            title={`인기 게임 타이틀 ${i}`}
            price={50000 + i*1000}
            image={`https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500&auto=format&fit=crop&sig=${i}`}
            tags={['Action', 'FPS']}
          />
       ))}
    </div>
  </section>
);

// 3-5. Free Games Section
const FreeGamesSection = () => (
  <section className="bg-[#1e1e1e] rounded-xl p-8 border border-white/5">
    <SectionHeader title="이주의 무료 게임" icon={Gift} />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="group cursor-pointer">
        <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-gray-800">
           <img 
             src="https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=800&auto=format&fit=crop" 
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
             alt="Free Game 1"
           />
           <span className="absolute bottom-0 left-0 bg-[#ff3f3f] text-white text-xs font-bold px-3 py-1 rounded-tr-lg shadow-lg">무료 배포 중</span>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Space Odyssey 2025</h3>
        <div className="text-sm text-gray-500">무료 기간: 11월 30일까지</div>
      </div>
      <div className="group cursor-pointer opacity-60 hover:opacity-100 transition-opacity">
        <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-gray-800">
           <img 
             src="https://images.unsplash.com/photo-1627856014759-2a01d6e270a7?w=800&auto=format&fit=crop" 
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 grayscale" 
             alt="Free Game 2"
           />
           <span className="absolute bottom-0 left-0 bg-gray-800 text-gray-400 text-xs font-bold px-3 py-1 rounded-tr-lg border-t border-r border-white/10">오픈 예정</span>
        </div>
        <h3 className="text-lg font-bold text-gray-400 group-hover:text-white mb-1">Mystery Dungeon</h3>
        <div className="text-sm text-gray-600">다음 주 무료 공개</div>
      </div>
    </div>
  </section>
);

// ----------------------------------------------------------------------
// 4. MAIN PAGE
// ----------------------------------------------------------------------

export default function HomePage() {
  return (
    <div className="pb-20 bg-[#121212] min-h-screen">
      <HeroSection />
      
      <div className="px-8 mt-12 space-y-20 max-w-[1600px] mx-auto">
        <FeaturedSection />
        <EventBanner />
        <TrendingSection />
        <FreeGamesSection />
      </div>
    </div>
  );
}