import { MessageSquare, ThumbsUp, Eye, Edit3 } from 'lucide-react';

export default function CommunityPage() {
  const posts = [
    { id: 1, title: '이번 할인 뭐 사는게 좋음?', author: '뉴비절단기', views: 1205, likes: 45, comments: 12, tag: '자유', time: '방금 전' },
    { id: 2, title: '반지의 제왕 모리아 게임 같이 하실 분 구합니다 (2/4)', author: '간달프', views: 890, likes: 12, comments: 8, tag: '파티모집', time: '10분 전' },
    { id: 3, title: 'RTX 4060에서 프레임 방어 하는 법 팁 공유함', author: 'TechMaster', views: 3400, likes: 156, comments: 42, tag: '공략/팁', time: '1시간 전' },
    { id: 4, title: '로그인 안되는 버그 있나요?', author: '버그헌터', views: 230, likes: 2, comments: 5, tag: '버그제보', time: '2시간 전' },
  ];

  return (
    <div className="px-8 py-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-white">커뮤니티</h2>
        <button className="bg-[#ff3f3f] hover:bg-red-700 text-white px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors">
          <Edit3 size={16} /> 글쓰기
        </button>
      </div>

      <div className="flex gap-8 h-full">
        {/* Left: Sidebar Categories */}
        <div className="w-48 hidden md:block space-y-1">
          {['전체글', '인기글', '자유게시판', '공략/팁', '파티모집', '버그제보'].map((menu, idx) => (
            <button key={menu} className={`w-full text-left px-4 py-2 rounded text-sm font-medium ${idx === 0 ? 'bg-[#1e1e1e] text-[#ff3f3f]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              {menu}
            </button>
          ))}
        </div>

        {/* Right: Post List */}
        <div className="flex-1 space-y-2">
          {posts.map(post => (
            <div key={post.id} className="bg-[#1e1e1e] p-4 rounded border border-transparent hover:border-[#ff3f3f]/30 cursor-pointer transition-colors flex items-center justify-between group">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-white/5 text-gray-400 text-[10px] px-1.5 py-0.5 rounded border border-white/5">{post.tag}</span>
                  <h3 className="text-white font-bold group-hover:text-[#ff3f3f] transition-colors">{post.title}</h3>
                </div>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span>{post.author}</span>
                  <span>·</span>
                  <span>{post.time}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <div className="flex items-center gap-1"><Eye size={14}/> {post.views}</div>
                <div className="flex items-center gap-1"><ThumbsUp size={14}/> {post.likes}</div>
                <div className="flex items-center gap-1 text-[#e1e1e1]"><MessageSquare size={14}/> {post.comments}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}