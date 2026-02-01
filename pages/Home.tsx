import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProjectCard from '../components/ProjectCard';
import { Search, SlidersHorizontal, ArrowRight, MapPin, Tag as TagIcon, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CitySelector } from '../components/CitySelector';
import { ProjectCategory } from '../types';

const getCategoryEmoji = (category: ProjectCategory) => {
  switch (category) {
    case ProjectCategory.DRINKING: return '🍹';
    case ProjectCategory.SPORTS: return '🚴';
    case ProjectCategory.BOARD_GAME: return '🎲';
    case ProjectCategory.OUTDOOR: return '🏔️';
    case ProjectCategory.DINING: return '🍽️';
    case ProjectCategory.WORKSHOP: return '💡';
    default: return '✨';
  }
};

const Home: React.FC = () => {
  const { projects, t } = useApp();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedCity, setSelectedCity] = useState('上海');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categories = [
    { label: t.categories.all, value: 'ALL' },
    { label: t.categories.drinking, value: ProjectCategory.DRINKING },
    { label: t.categories.sports, value: ProjectCategory.SPORTS },
    { label: t.categories.gaming, value: ProjectCategory.BOARD_GAME },
    { label: t.categories.outdoor, value: ProjectCategory.OUTDOOR }
  ];

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => (p as any).tags?.forEach((tag: string) => tags.add(tag)));
    return Array.from(tags);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchTag = !selectedTag || (p as any).tags?.includes(selectedTag);
      const matchCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchCity = !selectedCity || p.city === selectedCity; 
      return matchTag && matchCategory && matchCity;
    });
  }, [projects, selectedTag, selectedCategory, selectedCity]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const itemWidth = 280 + 16; 
    const idx = Math.round(scrollLeft / itemWidth);
    if (idx !== activeIdx) setActiveIdx(idx);
  };

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isFilterOpen]);

  return (
    <div className="relative pb-24">
      {/* Header Area */}
      <div className="flex flex-col space-y-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white transition-colors duration-300">
            {t.heroTitle}
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Discover local gatherings</p>
        </div>

        {/* Search & Location Bar - Flat Design */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 dark:bg-zinc-900 rounded-xl h-12 flex items-center px-4 gap-3 border border-transparent focus-within:border-accent/50 focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all">
             <Search size={18} className="text-gray-400" />
             <input placeholder={t.searchPlaceholder} className="bg-transparent border-none outline-none text-sm font-semibold w-full placeholder-gray-400 text-black dark:text-white" />
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${selectedTag ? 'bg-accent text-black border-accent' : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-white/5'}`}
          >
             <SlidersHorizontal size={18} />
          </button>
        </div>
        
        {/* Categories - Minimal Text Tabs */}
        <div className="flex space-x-6 overflow-x-auto no-scrollbar items-center border-b border-gray-100 dark:border-white/5 pb-1">
          {categories.map((cat) => (
            <button 
              key={cat.value} 
              onClick={() => setSelectedCategory(cat.value)}
              className={`pb-3 text-[13px] font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${selectedCategory === cat.value ? 'text-black dark:text-white border-accent' : 'text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Section (Optional - kept but styled flatter) */}
      <div className="mb-8">
         <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">{t.featuredTitle}</h2>
         </div>
        <div ref={scrollRef} onScroll={handleScroll} className="flex space-x-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-6 px-6">
           {projects.slice(0, 5).map((p, idx) => (
              <div 
                key={p.id} 
                onClick={() => navigate(`/project/${p.id}`)} 
                className={`min-w-[260px] h-[180px] snap-center rounded-[24px] p-5 text-white relative overflow-hidden group cursor-pointer active:scale-[0.98] transition-all bg-black`}
              >
                 {p.coverImage && (
                   <>
                     <img src={p.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" alt="Background" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                   </>
                 )}
                 
                 <div className="relative z-10 h-full flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                        <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10">{p.category}</span>
                   </div>
                   
                   <div>
                     <h3 className="text-lg font-bold leading-tight mb-2 line-clamp-1">{p.title}</h3>
                     <div className="flex items-center gap-2 text-white/70">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-500">
                           <img src={p.hostAvatar} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-medium">{p.hostName}</span>
                     </div>
                   </div>
                 </div>
              </div>
           ))}
        </div>
      </div>

      {/* Results Feed - List Layout */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
           <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Nearby Events</h2>
              <span className="text-[10px] font-bold bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.5 rounded-md">{filteredProjects.length}</span>
           </div>
           <CitySelector value={selectedCity} onChange={setSelectedCity} className="scale-75 origin-right" />
        </div>
        
        {/* Flat List Container */}
        <div className="flex flex-col">
          {filteredProjects.length > 0 ? filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          )) : (
            <div className="text-center py-20 bg-gray-50 dark:bg-zinc-900 rounded-2xl flex flex-col items-center space-y-3 mt-4">
               <TagIcon size={32} className="opacity-10 dark:text-white" />
               <p className="text-[11px] font-bold uppercase tracking-widest opacity-30 dark:text-white">No events found</p>
               <button onClick={() => { setSelectedTag(null); setSelectedCategory('ALL'); }} className="text-accent text-[10px] font-bold uppercase underline">Clear filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsFilterOpen(false)}
          />
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-6 relative animate-in slide-in-from-bottom-10 duration-500 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold tracking-tight dark:text-white">Filters</h3>
               <button 
                 onClick={() => { setSelectedTag(null); setIsFilterOpen(false); }}
                 className="text-[10px] font-bold uppercase tracking-widest text-gray-400"
               >
                 Reset
               </button>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button 
                    key={tag}
                    onClick={() => { setSelectedTag(tag === selectedTag ? null : tag); }}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all ${selectedTag === tag ? 'bg-black dark:bg-white text-accent dark:text-black border-black dark:border-white' : 'bg-white dark:bg-zinc-800 border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setIsFilterOpen(false)}
              className="w-full mt-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold uppercase tracking-widest text-[11px] active:scale-[0.98] transition-all"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;