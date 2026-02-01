import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { 
  CreditCard, ShieldCheck, ChevronRight, ChevronDown, Check, Settings, Star, 
  Wallet, X, MessageSquare, History, CheckCircle2, Layers, ArrowUpRight, Edit3, Camera, Calendar, MapPin, User as UserIcon,
  ScanLine, LogOut, Moon, Sun, Globe, Shield, FileText, HelpCircle, UserCog, Upload, ArrowLeft
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const CITIES = ['上海', '北京', '广州', '深圳', '杭州', '成都', '南京', '武汉', '西安', '重庆'];

const StarRating = ({ score, size = 28 }: { score: number, size?: number }) => {
  const rating = (score / 100) * 5;
  return (
    <div className="flex items-center space-x-1.5">
      {[...Array(5)].map((_, i) => {
        const fillAmount = Math.max(0, Math.min(1, rating - i));
        return (
          <div key={i} className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="text-white/20 absolute inset-0" strokeWidth={2.5} />
            <div className="absolute inset-0 overflow-hidden transition-all duration-700 ease-out" style={{ width: `${fillAmount * 100}%` }}>
              <Star size={size} fill="currentColor" className="text-accent shadow-accent-glow" strokeWidth={2.5} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Profile: React.FC = () => {
  const { currentUser, t, projects, updateUser, setLanguage, language, getUser } = useApp();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  // Determine which user profile to show
  const isOwnProfile = !userId || userId === currentUser.id;
  const profileUser = isOwnProfile ? currentUser : getUser(userId!);

  const [activeTab, setActiveTab] = useState<'none' | 'wallet' | 'past' | 'projects'>('none');
  const [projectFilter, setProjectFilter] = useState<'joined' | 'hosted'>('joined');
  const [selectedPastProject, setSelectedPastProject] = useState<string | null>(null);
  
  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  
  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: profileUser.name,
    location: profileUser.location || '',
    birthDate: profileUser.birthDate || '',
    avatar: profileUser.avatar
  });

  const locationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setIsLocationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const walletBalance = "1,280.00";
  const [paymentMethod, setPaymentMethod] = useState('allset');

  // Filter projects for the management section
  const userJoinedProjects = projects.filter(p => p.participants.some(u => u.id === profileUser.id));
  const userHostedProjects = projects.filter(p => p.hostId === profileUser.id);
  const displayProjects = projectFilter === 'joined' ? userJoinedProjects : userHostedProjects;

  const pastProjects = projects.slice(0, 2).map(p => ({
    ...p,
    myRating: 5,
    othersComments: [
      { id: 'c1', user: 'Sarah', text: '非常靠谱的队友！', rating: 5 },
      { id: 'c2', user: 'Mike', text: '下次还一起组局。', rating: 5 }
    ]
  }));

  const handleEditSave = () => {
    updateUser(editForm);
    setIsEditOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result as string;
        setEditForm(prev => ({ ...prev, avatar: newAvatar }));
        updateUser({ avatar: newAvatar }); // Auto save for avatar modal
      };
      reader.readAsDataURL(file);
    }
  };

  const renderWallet = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="bg-zinc-900 rounded-[32px] p-6 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl -mr-10 -mt-10"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{t.profile.totalBalance}</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-black text-white">¥ {walletBalance}</span>
          <span className="text-[10px] font-bold text-accent">CNY</span>
        </div>
        <div className="mt-8 flex justify-between items-center">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[10px] font-black">All</div>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[10px] font-black">Set</div>
          </div>
          <span className="text-[10px] font-black text-white/20 uppercase tracking-tighter">{t.profile.goldMember}</span>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40 px-2">{t.profile.selectMethod}</p>
        {[
          { id: 'allset', name: t.profile.walletAllSet, icon: Wallet },
          { id: 'wechat', name: t.profile.walletWechat, icon: MessageSquare },
          { id: 'alipay', name: t.profile.walletAlipay, icon: CheckCircle2 },
        ].map((method) => (
          <button
            key={method.id}
            onClick={() => setPaymentMethod(method.id)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all dark:bg-zinc-900 ${
              paymentMethod === method.id ? 'bg-black border-accent text-accent dark:border-accent' : 'bg-white border-black/5 text-black dark:text-white dark:border-white/10'
            }`}
          >
            <div className="flex items-center space-x-3">
              <method.icon size={18} className={paymentMethod === method.id ? 'text-accent' : 'text-zinc-400'} />
              <span className="text-xs font-black uppercase tracking-widest">{method.name}</span>
            </div>
            {paymentMethod === method.id && <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-accent-glow"></div>}
          </button>
        ))}
      </div>
    </div>
  );

  const renderPastProjects = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
      {pastProjects.map((p) => (
        <div key={p.id} className="bg-white dark:bg-zinc-900 rounded-[32px] p-2 border border-black/5 dark:border-white/10 shadow-premium">
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-black uppercase tracking-tight line-clamp-1 flex-1 dark:text-white">{p.title}</h4>
              <div className="flex items-center space-x-0.5 text-accent ml-2">
                {[...Array(p.myRating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
              </div>
            </div>
            <button 
              onClick={() => setSelectedPastProject(selectedPastProject === p.id ? null : p.id)}
              className="w-full py-2.5 bg-surface hover:bg-black hover:text-accent transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
            >
              <span>{selectedPastProject === p.id ? t.profile.hideComments : t.profile.viewComments}</span>
              <ChevronRight size={12} className={`transition-transform ${selectedPastProject === p.id ? 'rotate-90' : ''}`} />
            </button>
          </div>
          {selectedPastProject === p.id && (
            <div className="bg-surface/50 p-4 rounded-b-[24px] border-t border-black/5 dark:border-white/10 space-y-3 animate-in fade-in slide-in-from-top-2">
              {p.othersComments.length > 0 ? p.othersComments.map((c) => (
                <div key={c.id} className="bg-white dark:bg-zinc-800 p-3 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black uppercase dark:text-white">{c.user}</span>
                    <div className="flex space-x-0.5 text-accent/60">
                      {[...Array(c.rating)].map((_, i) => <Star key={i} size={8} fill="currentColor" />)}
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-secondary dark:text-zinc-400">{c.text}</p>
                </div>
              )) : (
                <p className="text-[10px] text-center py-2 opacity-40 font-black uppercase dark:text-white">{t.profile.noComments}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderProjectManagement = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      <div className="flex p-1 bg-surface rounded-2xl border border-black/5 dark:border-white/10 dark:bg-zinc-900">
        <button 
          onClick={() => setProjectFilter('joined')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${projectFilter === 'joined' ? 'bg-black text-accent shadow-float' : 'text-secondary opacity-40 hover:opacity-100 dark:text-white'}`}
        >
          {t.profile.joined}
        </button>
        <button 
          onClick={() => setProjectFilter('hosted')}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${projectFilter === 'hosted' ? 'bg-black text-accent shadow-float' : 'text-secondary opacity-40 hover:opacity-100 dark:text-white'}`}
        >
          {t.profile.hosted}
        </button>
      </div>

      <div className="space-y-3 pb-10">
        {displayProjects.length > 0 ? displayProjects.map(p => (
          <div 
            key={p.id} 
            className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-premium transition-all group active:scale-[0.98] flex items-center justify-between"
          >
            <div 
              className="flex items-center space-x-4 flex-1 cursor-pointer"
              onClick={() => navigate(`/project/${p.id}`)}
            >
              <div className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center text-lg group-hover:bg-black group-hover:text-accent transition-all dark:bg-zinc-800 dark:text-white">
                {p.category === '酒局' ? '🍹' : p.category === '运动' ? '🚴' : '🎲'}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-tight line-clamp-1 dark:text-white">{p.title}</h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <p className="text-[9px] font-bold opacity-40 dark:text-zinc-400">{p.time}</p>
                  <span className="text-[8px] font-black px-2 py-0.5 bg-accent/10 text-black rounded-md uppercase dark:text-white dark:bg-accent/20">{p.status}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {projectFilter === 'hosted' && isOwnProfile && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/create', { state: { editProject: p } });
                  }}
                  className="w-9 h-9 bg-surface rounded-xl flex items-center justify-center text-secondary hover:bg-black hover:text-accent transition-all dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  <Edit3 size={14} strokeWidth={3} />
                </button>
              )}
              <div 
                className="w-9 h-9 bg-surface rounded-xl flex items-center justify-center text-secondary cursor-pointer hover:bg-black hover:text-accent transition-all dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <ArrowUpRight size={14} strokeWidth={3} />
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-10 opacity-20 flex flex-col items-center space-y-2">
            <Layers size={32} className="dark:text-white" />
            <p className="text-[10px] font-black uppercase tracking-widest dark:text-white">No projects found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div className="flex items-center space-x-4">
            {/* Back Button if not own profile */}
            {!isOwnProfile && (
               <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white shadow-premium rounded-full text-black hover:scale-110 active:scale-90 transition-all border border-black/[0.02] mr-2">
                  <ArrowLeft size={18} strokeWidth={3} />
               </button>
            )}

            <button 
              onClick={() => isOwnProfile && setIsAvatarModalOpen(true)}
              className={`relative w-16 h-16 rounded-full overflow-hidden shadow-float border-2 border-white transition-all group ${isOwnProfile ? 'active:scale-95 cursor-pointer' : 'cursor-default'}`}
            >
                <img src={profileUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                {isOwnProfile && <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />}
            </button>
            <div>
               <h2 className="text-2xl font-black tracking-tighter dark:text-white">{profileUser.name}</h2>
               <p className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60 dark:text-zinc-400">{t.profile.identity}</p>
            </div>
         </div>
         
         <div className="flex items-center space-x-3">
             <button 
                onClick={() => setIsQrOpen(true)}
                className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-gray-100 text-blue-500 dark:bg-zinc-800 dark:text-blue-400 dark:hover:bg-zinc-700"
             >
                <ScanLine size={20} strokeWidth={2} />
             </button>
             {isOwnProfile && (
               <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center active:scale-90 transition-all hover:bg-gray-100 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
               >
                  <Settings size={20} strokeWidth={2} />
               </button>
             )}
         </div>
      </div>

      {/* Credit Score Card */}
      <div className="bg-black rounded-4xl p-8 text-white shadow-premium-lg relative overflow-hidden dark:border dark:border-white/10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-10">
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">{t.profile.trustScore}</p>
                      <StarRating score={profileUser.creditScore} />
                  </div>
                  <ShieldCheck size={32} className="text-white/20" />
              </div>
              <div className="flex justify-between items-end">
                  <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{t.profile.userIdentity}</p>
                      <p className="text-sm font-bold tracking-widest">**** **** {profileUser.id.slice(-2)}</p>
                  </div>
                  <div className="w-12 h-6 bg-white/20 rounded-lg backdrop-blur-sm"></div>
              </div>
          </div>
      </div>

      {/* Main Menu List */}
      <div className="space-y-4">
        {activeTab !== 'none' && (
          <div className="flex items-center justify-between px-2 mb-2 animate-in slide-in-from-left-4 fade-in">
            <h3 className="text-[11px] font-black uppercase tracking-widest flex items-center space-x-2 dark:text-white">
              <button onClick={() => setActiveTab('none')} className="hover:opacity-60 transition-opacity">
                <ChevronRight size={14} className="rotate-180" />
              </button>
              <span>
                  {activeTab === 'wallet' && t.profile.wallet}
                  {activeTab === 'past' && t.profile.past}
                  {activeTab === 'projects' && (isOwnProfile ? t.profile.myProjects : "Projects")}
              </span>
            </h3>
          </div>
        )}

        {activeTab === 'none' ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-1 shadow-premium border border-black/[0.02] dark:border-white/10 overflow-hidden">
            {isOwnProfile && (
              <div onClick={() => setActiveTab('wallet')} className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-50 dark:border-zinc-800 group">
                  <div className="flex items-center space-x-4">
                    <CreditCard size={20} strokeWidth={2} className="text-black dark:text-white" />
                    <span className="text-sm font-bold text-black dark:text-white">{t.profile.wallet}</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 dark:text-zinc-600" />
              </div>
            )}
            <div onClick={() => setActiveTab('projects')} className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors border-b border-gray-50 dark:border-zinc-800 group">
                <div className="flex items-center space-x-4">
                  <Layers size={20} strokeWidth={2} className="text-black dark:text-white" />
                  <span className="text-sm font-bold text-black dark:text-white">{isOwnProfile ? t.profile.myProjects : "Projects"}</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 dark:text-zinc-600" />
            </div>
            <div onClick={() => setActiveTab('past')} className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors group">
                <div className="flex items-center space-x-4">
                  <History size={20} strokeWidth={2} className="text-black dark:text-white" />
                  <span className="text-sm font-bold text-black dark:text-white">{t.profile.past}</span>
                </div>
                <ChevronRight size={16} className="text-gray-300 dark:text-zinc-600" />
            </div>
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {activeTab === 'wallet' && isOwnProfile && renderWallet()}
            {activeTab === 'past' && renderPastProjects()}
            {activeTab === 'projects' && renderProjectManagement()}
          </div>
        )}
      </div>

      {activeTab === 'none' && (
         <div className="py-8"></div> // Spacer
      )}

      {/* Avatar Display/Edit Modal */}
      {isAvatarModalOpen && isOwnProfile && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
           <button 
             onClick={() => setIsAvatarModalOpen(false)}
             className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
           >
             <X size={20} />
           </button>
           
           <div className="w-full max-w-sm px-6 flex flex-col items-center space-y-8">
              <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl relative group">
                 <img src={profileUser.avatar} alt="Large Avatar" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex flex-col items-center space-y-3">
                 <h3 className="text-2xl font-bold text-white tracking-tight">{profileUser.name}</h3>
                 <p className="text-sm text-white/50 font-medium uppercase tracking-widest">{t.profile.userIdentity}</p>
              </div>

              <label className="cursor-pointer">
                 <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                 <div className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all flex items-center space-x-2">
                    <Camera size={16} />
                    <span>Change Avatar</span>
                 </div>
              </label>
           </div>
        </div>
      )}

      {/* QR Code Modal */}
      {isQrOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsQrOpen(false)} />
            <div className="w-full max-w-xs bg-white rounded-[32px] p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl flex flex-col items-center">
                 <button onClick={() => setIsQrOpen(false)} className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full hover:bg-gray-100"><X size={16} /></button>
                 <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-float mb-4">
                    <img src={profileUser.avatar} className="w-full h-full object-cover" />
                 </div>
                 <h3 className="text-lg font-black tracking-tight mb-1">{profileUser.name}</h3>
                 <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-8">{t.profile.userIdentity}</p>
                 
                 <div className="w-48 h-48 bg-black rounded-2xl p-2 mb-6 shadow-premium">
                     <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                        {/* Mock QR */}
                        <div className="grid grid-cols-5 gap-1 p-2">
                           {[...Array(25)].map((_, i) => <div key={i} className={`w-full h-full rounded-sm ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>)}
                        </div>
                     </div>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t.profile.settings.scan}</p>
            </div>
        </div>
      )}

      {/* System Settings Modal */}
      {isSettingsOpen && isOwnProfile && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSettingsOpen(false)} />
           <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-6 relative animate-in zoom-in-95 duration-300 shadow-2xl h-[70vh] flex flex-col transition-colors">
              <div className="flex items-center justify-between mb-6 shrink-0">
                  <h3 className="text-xl font-black tracking-tight dark:text-white">{t.profile.settings.title}</h3>
                  <button onClick={() => setIsSettingsOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"><X size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                 {/* Account Section */}
                 <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 px-1 opacity-60 dark:text-zinc-400">{t.profile.settings.account}</p>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl overflow-hidden transition-colors">
                       <button onClick={() => { setIsSettingsOpen(false); setIsEditOpen(true); }} className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all border-b border-black/[0.03] dark:border-white/[0.05]">
                          <div className="flex items-center space-x-3">
                             <UserCog size={18} className="text-zinc-600 dark:text-zinc-400" />
                             <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{t.profile.settings.editProfile}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 dark:text-zinc-600" />
                       </button>
                       <button className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all">
                          <div className="flex items-center space-x-3">
                             <Shield size={18} className="text-zinc-600 dark:text-zinc-400" />
                             <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">Security</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 dark:text-zinc-600" />
                       </button>
                    </div>
                 </div>

                 {/* General Section */}
                 <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 px-1 opacity-60 dark:text-zinc-400">{t.profile.settings.general}</p>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl overflow-hidden transition-colors">
                       <button onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')} className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all border-b border-black/[0.03] dark:border-white/[0.05]">
                          <div className="flex items-center space-x-3">
                             <Globe size={18} className="text-zinc-600 dark:text-zinc-400" />
                             <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{t.profile.settings.language}</span>
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest text-secondary dark:text-zinc-500">{language === 'zh' ? '中文' : 'English'}</span>
                       </button>
                       <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all">
                          <div className="flex items-center space-x-3">
                             <Moon size={18} className="text-zinc-600 dark:text-zinc-400" />
                             <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{t.profile.settings.darkMode}</span>
                          </div>
                          <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${theme === 'dark' ? 'bg-accent' : 'bg-gray-200'}`}>
                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}></div>
                          </div>
                       </button>
                    </div>
                 </div>

                 {/* About Section */}
                 <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 px-1 opacity-60 dark:text-zinc-400">{t.profile.settings.about}</p>
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl overflow-hidden transition-colors">
                       <button className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all border-b border-black/[0.03] dark:border-white/[0.05]">
                          <div className="flex items-center space-x-3">
                             <HelpCircle size={18} className="text-zinc-600 dark:text-zinc-400" />
                             <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{t.profile.settings.help}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 dark:text-zinc-600" />
                       </button>
                       <button className="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all border-b border-black/[0.03] dark:border-white/[0.05]">
                          <div className="flex items-center space-x-3">
                             <FileText size={18} className="text-zinc-600 dark:text-zinc-400" />
                             <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{t.profile.settings.privacy}</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 dark:text-zinc-600" />
                       </button>
                       <div className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800/50">
                          <span className="text-sm font-bold text-zinc-400 dark:text-zinc-600">{t.profile.settings.version}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Logout */}
              <div className="pt-6 border-t border-black/5 dark:border-white/10 shrink-0">
                 <button className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center space-x-2">
                    <LogOut size={16} />
                    <span>{t.profile.settings.logout}</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditOpen && isOwnProfile && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsEditOpen(false)}
          />
          <div className="w-full max-w-md bg-white rounded-[32px] p-8 relative animate-in zoom-in-95 duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-xl font-black tracking-tight">{t.profile.editProfile.title}</h3>
               <button 
                 onClick={() => setIsEditOpen(false)}
                 className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
               >
                 <X size={16} />
               </button>
            </div>

            <div className="space-y-6">
               {/* Avatar Upload */}
               <div className="flex flex-col items-center justify-center mb-2">
                  <div className="relative group cursor-pointer active:scale-95 transition-all">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-50 shadow-float">
                       <img src={editForm.avatar} className="w-full h-full object-cover" alt="Avatar" />
                    </div>
                    <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Camera className="text-white drop-shadow-md" size={24} />
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <span className="mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400">Tap to change</span>
               </div>

               {/* Name Input */}
               <div className="space-y-2">
                 <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <UserIcon size={12} /> <span>{t.profile.editProfile.name}</span>
                 </label>
                 <input 
                   value={editForm.name}
                   onChange={e => setEditForm(p => ({...p, name: e.target.value}))}
                   className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-black/5"
                 />
               </div>

               {/* Location Input -> Dropdown */}
               <div className="space-y-2 relative" ref={locationRef}>
                 <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <MapPin size={12} /> <span>{t.profile.editProfile.location}</span>
                 </label>
                 
                 <button 
                    onClick={() => setIsLocationOpen(!isLocationOpen)}
                    className="w-full bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-left transition-all active:scale-[0.99] hover:bg-gray-100"
                 >
                    <span className={`font-bold text-sm ${!editForm.location ? 'text-gray-400' : 'text-black'}`}>
                      {editForm.location || 'Select City'}
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isLocationOpen ? 'rotate-180' : ''}`} />
                 </button>

                 {isLocationOpen && (
                     <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-premium-lg border border-black/5 z-50 max-h-48 overflow-y-auto p-2 animate-in fade-in slide-in-from-top-2">
                        {CITIES.map(city => (
                           <div 
                             key={city}
                             onClick={() => {
                                setEditForm(prev => ({...prev, location: city}));
                                setIsLocationOpen(false);
                             }}
                             className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all ${editForm.location === city ? 'bg-black text-white' : 'hover:bg-gray-50 text-zinc-600'}`}
                           >
                              <span className="text-sm font-bold">{city}</span>
                              {editForm.location === city && <Check size={14} />}
                           </div>
                        ))}
                     </div>
                 )}
               </div>

               {/* BirthDate Input */}
               <div className="space-y-2">
                 <label className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <Calendar size={12} /> <span>{t.profile.editProfile.birthDate}</span>
                 </label>
                 <input 
                   type="date"
                   value={editForm.birthDate}
                   onChange={e => setEditForm(p => ({...p, birthDate: e.target.value}))}
                   className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-black/5"
                 />
               </div>
            </div>

            <button 
              onClick={handleEditSave}
              className="w-full mt-8 py-5 bg-black text-white rounded-[24px] font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-all shadow-premium hover:shadow-lg"
            >
              {t.profile.editProfile.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;