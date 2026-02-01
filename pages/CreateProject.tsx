import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProjectCategory, CostType, ProjectStatus, Project, BillGroup } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Loader2, ArrowLeft, ChevronDown, Check, Percent, Image as ImageIcon, X, Edit2, Clock, Plus as PlusIcon, Tag as TagIcon, Wand2, Upload, Trash2, Calculator, GripVertical, Users, ChevronRight, Settings2 } from 'lucide-react';
import { polishProjectDescription, generateProjectCover } from '../services/geminiService';

const CITIES = ['上海', '北京', '广州', '深圳', '杭州', '成都', '南京', '武汉', '西安', '重庆'];

const WheelColumn = ({ options, value, onChange }: { options: string[], value: string, onChange: (val: string) => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 48;

  useEffect(() => {
    const idx = options.indexOf(value);
    if (containerRef.current && idx !== -1) {
      containerRef.current.scrollTop = idx * itemHeight;
    }
  }, [value, options]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const idx = Math.round(scrollTop / itemHeight);
    if (options[idx] && options[idx] !== value) {
      onChange(options[idx]);
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[144px] flex-1 overflow-y-auto no-scrollbar snap-y snap-mandatory py-[48px]"
    >
      {options.map((opt) => (
        <div 
          key={opt} 
          className={`h-[48px] flex items-center justify-center snap-center transition-all duration-300 ${
            value === opt ? 'text-accent font-black scale-110 opacity-100' : 'text-white/20 font-bold scale-90'
          }`}
        >
          <span className="text-[11px] tracking-widest uppercase truncate px-1">{opt}</span>
        </div>
      ))}
    </div>
  );
};

const WheelTimePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const dateOptions = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[d.getDay()];
    return i === 0 ? `今天 (${month}-${day})` : i === 1 ? `明天 (${month}-${day})` : `${month}-${day} ${weekday}`;
  }), []);

  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = ['00', '15', '30', '45'];

  const parseValue = () => {
    const parts = value.split(' ');
    if (parts.length < 2) return { date: dateOptions[0], hour: '19', min: '00' };
    const timeIdx = parts.findIndex(p => p.includes(':'));
    const datePart = parts.slice(0, timeIdx).join(' ');
    const timePart = parts[timeIdx].split(':');
    return {
      date: dateOptions.includes(datePart) ? datePart : dateOptions[0],
      hour: hourOptions.includes(timePart[0]) ? timePart[0] : '19',
      min: minuteOptions.includes(timePart[1]) ? timePart[1] : '00'
    };
  };

  const current = parseValue();
  const handleUpdate = (d: string, h: string, m: string) => {
    onChange(`${d} ${h}:${m}`);
  };

  return (
    <div className="bg-black rounded-3xl p-3 relative overflow-hidden shadow-premium-lg border border-white/5">
      <div className="absolute top-1/2 left-0 w-full h-[48px] -translate-y-1/2 bg-white/5 pointer-events-none rounded-xl border-y border-white/10"></div>
      <div className="flex relative z-10">
        <div className="flex-[1.5]">
          <WheelColumn options={dateOptions} value={current.date} onChange={(v) => handleUpdate(v, current.hour, current.min)} />
        </div>
        <div className="w-[1px] h-16 self-center bg-white/5"></div>
        <WheelColumn options={hourOptions} value={current.hour} onChange={(v) => handleUpdate(current.date, v, current.min)} />
        <div className="flex items-center text-accent/40 font-black px-1 text-lg mb-0.5">:</div>
        <WheelColumn options={minuteOptions} value={current.min} onChange={(v) => handleUpdate(current.date, current.hour, v)} />
      </div>
    </div>
  );
};

const CapsuleDropdown = ({ label, options, value, onChange, t }: { label: string, options: string[], value: string, onChange: (val: any) => void, t: any }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-[10px] font-black text-secondary uppercase tracking-widest mb-3 px-1 opacity-60">{label}</label>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 active:scale-[0.98] border ${isOpen ? 'bg-black text-accent border-black shadow-accent-glow' : 'bg-gray-50 text-black border-transparent hover:bg-gray-100'}`}>
        <span className="text-sm font-black uppercase tracking-widest">{value}</span>
        <ChevronDown size={16} strokeWidth={3} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`absolute z-50 top-[calc(100%+8px)] left-0 w-full bg-black rounded-3xl shadow-premium-lg p-2 transition-all duration-300 origin-top ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}`}>
        <div className="space-y-1 max-h-60 overflow-y-auto no-scrollbar">
          {options.map((opt) => (
            <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`flex items-center justify-between px-4 py-3 cursor-pointer rounded-2xl transition-all active:scale-95 ${value === opt ? 'bg-accent text-black' : 'hover:bg-white/10 text-white/70'}`}>
              <span className="text-[11px] font-black uppercase tracking-widest">{opt}</span>
              {value === opt && <Check size={14} strokeWidth={4} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Count Selector Dropdown with Capsule Options ---
const CountSelector = ({ value, max, onChange }: { value: number, max: number, onChange: (v: number) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold flex items-center justify-between shadow-sm active:scale-[0.98] transition-all outline-none focus:border-black"
            >
                <span>{value}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-premium-lg border border-black/5 p-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                        {Array.from({ length: max }).map((_, i) => {
                            const num = i + 1;
                            return (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => { onChange(num); setIsOpen(false); }}
                                    className={`
                                        h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all
                                        ${value === num ? 'bg-black text-accent' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}
                                    `}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

const COLORS = ['#FACC15', '#000000', '#9CA3AF', '#60A5FA', '#F87171'];

// --- Preset Ratio Definitions ---
const PRESETS_2 = [
  { label: '均摊 (50% / 50%)', values: [50, 50] },
  { label: '55% / 45%', values: [55, 45] },
  { label: '60% / 40%', values: [60, 40] },
  { label: '65% / 35%', values: [65, 35] },
  { label: '70% / 30%', values: [70, 30] },
  { label: '75% / 25%', values: [75, 25] },
  { label: '80% / 20%', values: [80, 20] },
];

const PRESETS_3 = [
  { label: '均摊 (34% / 33% / 33%)', values: [34, 33, 33] },
  { label: '40% / 30% / 30%', values: [40, 30, 30] },
  { label: '50% / 30% / 20%', values: [50, 30, 20] },
];

const DonutChart = ({ groups, total }: { groups: BillGroup[], total: number }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const totalRatio = groups.reduce((sum, g) => sum + (g.ratio || 0), 0);
  const isValid = Math.abs(totalRatio - 100) < 0.1;

  return (
    <div className="relative w-56 h-56 mx-auto my-2 flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
        <circle cx="100" cy="100" r={radius} stroke="#f3f4f6" strokeWidth="24" fill="none" />
        {groups.map((group, index) => {
          const ratio = group.ratio || 0;
          if (ratio === 0) return null;
          
          const strokeDasharray = `${(ratio / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -1 * (accumulatedPercent / 100) * circumference;
          accumulatedPercent += ratio;
          
          return (
            <circle
              key={group.id}
              cx="100"
              cy="100"
              r={radius}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth="24"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          );
        })}
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">TOTAL</span>
          <div className="flex items-baseline space-x-1">
             <span className="text-sm font-bold">¥</span>
             <span className="text-2xl font-black">{total.toFixed(0)}</span>
          </div>
          {!isValid && (
             <span className="text-[9px] font-bold text-red-500 mt-1">{totalRatio.toFixed(0)}%</span>
          )}
      </div>
    </div>
  )
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProject, updateProject, currentUser, t } = useApp();
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for collapsible Smart Split
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  const editProject = location.state?.editProject as Project | undefined;
  const isEditMode = !!editProject;

  const [formData, setFormData] = useState({ 
    title: editProject?.title || '', 
    description: editProject?.description || '', 
    category: editProject?.category || ProjectCategory.DRINKING, 
    city: editProject?.city || '上海', 
    location: editProject?.location || '', 
    time: editProject?.time || `今天 (${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}) 19:00`, 
    maxPeople: editProject?.maxPeople || 4, 
    costType: editProject?.costType || CostType.AA, 
    coverImage: editProject?.coverImage || '',
    tags: editProject?.tags || [] as string[],
    smartBill: editProject?.smartBill ? {
        ...editProject.smartBill,
        groups: editProject.smartBill.groups
    } : {
        enabled: true,
        totalAmount: 0,
        groups: [
            { id: 'g1', name: t.create.smartSplit.male, ratio: 70, count: 1 },
            { id: 'g2', name: t.create.smartSplit.female, ratio: 30, count: 1 }
        ],
        receiptImage: null
    }
  });

  const imgPresets = [
    { url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800', label: '酒吧' },
    { url: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe1?auto=format&fit=crop&q=80&w=800', label: '运动' },
    { url: 'https://images.unsplash.com/photo-1611333069145-66774ec25345?auto=format&fit=crop&q=80&w=800', label: '桌游' },
    { url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800', label: '聚会' }
  ];
  
  const PRESET_TAGS = [
    '新手友好', '安静', '有空调', '禁烟', '宠物友好', 
    '含餐', '需要预约', '仅限女生', '免费停车', '英语交流', 
    'AA制', '请客', '周末', '工作日', '夜猫子', 
    '早起鸟', '摄影', '无需经验', '提供装备'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { 
      const { name, value, type } = e.target;
      // Ensure number inputs are stored as numbers to prevent string concatenation bugs
      setFormData(prev => ({ 
          ...prev, 
          [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value 
      })); 
  };
  
  const handleSelectOption = (name: string, value: any) => { setFormData(prev => ({ ...prev, [name]: value })); };

  // Smart Split Handlers
  const handleSmartBillTotal = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      setFormData(prev => ({ ...prev, smartBill: { ...prev.smartBill, totalAmount: isNaN(val) ? 0 : val } }));
  };

  const handleGroupUpdate = (id: string, field: keyof BillGroup, value: any) => {
      if (field !== 'ratio') {
          setFormData(prev => ({
              ...prev,
              smartBill: {
                  ...prev.smartBill,
                  groups: prev.smartBill.groups.map(g => g.id === id ? { ...g, [field]: value } : g)
              }
          }));
          return;
      }

      let newVal = parseFloat(value);
      if (isNaN(newVal)) newVal = 0;
      if (newVal < 0) newVal = 0;
      if (newVal > 100) newVal = 100;

      if (formData.smartBill.groups.length === 2) {
          const otherGroupId = formData.smartBill.groups.find(g => g.id !== id)?.id;
          if (otherGroupId) {
              setFormData(prev => ({
                  ...prev,
                  smartBill: {
                      ...prev.smartBill,
                      groups: prev.smartBill.groups.map(g => {
                          if (g.id === id) return { ...g, ratio: newVal };
                          if (g.id === otherGroupId) return { ...g, ratio: 100 - newVal };
                          return g;
                      })
                  }
              }));
          }
          return;
      }

      const otherGroupsTotal = formData.smartBill.groups
          .filter(g => g.id !== id)
          .reduce((sum, g) => sum + (g.ratio || 0), 0);
      
      const maxAllowed = 100 - otherGroupsTotal;
      if (newVal > maxAllowed) {
          newVal = maxAllowed;
      }

      setFormData(prev => ({
          ...prev,
          smartBill: {
              ...prev.smartBill,
              groups: prev.smartBill.groups.map(g => g.id === id ? { ...g, ratio: newVal } : g)
          }
      }));
  };
  
  // Logic to apply a preset array to all groups, starting with the targetGroupId as primary
  const applyPreset = (targetGroupId: string, ratios: number[]) => {
      const groups = [...formData.smartBill.groups];
      const targetIndex = groups.findIndex(g => g.id === targetGroupId);
      if (targetIndex === -1) return;

      // Assign presets sequentially starting from the target group
      // This ensures if I select "70/30" for Group A, Group A gets 70, next gets 30.
      const newGroups = groups.map((g, i) => {
          // Calculate relative index from target
          let offset = (i - targetIndex + groups.length) % groups.length;
          // Use the preset value or 0 if undefined (though presets should match length)
          const newRatio = ratios[offset] !== undefined ? ratios[offset] : 0;
          return { ...g, ratio: newRatio };
      });
      
      setFormData(prev => ({
          ...prev,
          smartBill: { ...prev.smartBill, groups: newGroups }
      }));
  };

  const addGroup = () => {
      if (formData.smartBill.groups.length >= 5) return;
      
      const newId = Date.now().toString();
      const newGroup: BillGroup = {
          id: newId,
          name: 'New Group',
          count: 1,
          ratio: 0
      };
      setFormData(prev => ({
          ...prev,
          smartBill: { ...prev.smartBill, groups: [...prev.smartBill.groups, newGroup] }
      }));
      setExpandedGroupId(newId);
  };

  const removeGroup = (id: string) => {
      setFormData(prev => ({
          ...prev,
          smartBill: { ...prev.smartBill, groups: prev.smartBill.groups.filter(g => g.id !== id) }
      }));
  };

  const splitAllocations = useMemo<Record<string, { total: number, perPerson: number }>>(() => {
    const totalCents = Math.round(formData.smartBill.totalAmount * 100);
    const groups = formData.smartBill.groups;
    
    let totalWeightedPopulation = 0;
    groups.forEach(g => {
      totalWeightedPopulation += g.count * (g.ratio || 0);
    });

    if (totalWeightedPopulation === 0 || totalCents === 0) {
       return groups.reduce((acc, g) => ({...acc, [g.id]: { total: 0, perPerson: 0 }}), {} as Record<string, { total: number, perPerson: number }>);
    }

    const tempAllocations = groups.map(g => {
        const weightPop = g.count * (g.ratio || 0);
        const idealShare = (totalCents * weightPop) / totalWeightedPopulation;
        const integerShare = Math.floor(idealShare);
        return {
            id: g.id,
            count: g.count,
            integerShare,
            decimalPart: idealShare - integerShare
        };
    });

    const integerSum = tempAllocations.reduce((sum, t) => sum + t.integerShare, 0);
    let remainder = totalCents - integerSum;
    const sortedForDistribution = [...tempAllocations].sort((a, b) => b.decimalPart - a.decimalPart);
    const extras = new Map<string, number>();
    for (let i = 0; i < remainder; i++) {
        const item = sortedForDistribution[i % sortedForDistribution.length];
        extras.set(item.id, (extras.get(item.id) || 0) + 1);
    }

    const results: Record<string, { total: number, perPerson: number }> = {};
    tempAllocations.forEach(t => {
        const extra = extras.get(t.id) || 0;
        const groupTotalCents = t.integerShare + extra;
        results[t.id] = {
            total: groupTotalCents / 100,
            perPerson: t.count > 0 ? (groupTotalCents / 100) / t.count : 0
        };
    });

    return results;
  }, [formData.smartBill.totalAmount, formData.smartBill.groups]);


  const handleAIPolish = async () => { if (!formData.description) return; setLoading(true); const polished = await polishProjectDescription(formData.description, formData.category, formData.city); setFormData(prev => ({ ...prev, description: polished })); setLoading(false); };
  
  const handleGenerateImage = async () => {
    if (!formData.title) return;
    setImgLoading(true);
    const generatedImage = await generateProjectCover(formData.title, formData.description || formData.category);
    if (generatedImage) {
      setFormData(prev => ({ ...prev, coverImage: generatedImage }));
      setIsImageModalOpen(false);
    }
    setImgLoading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, coverImage: reader.result as string }));
        setIsImageModalOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const toggleTag = (tag: string) => {
    if (formData.tags.includes(tag)) {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
    } else {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && editProject) {
      const updated: Project = {
        ...editProject,
        ...formData,
        smartBill: formData.costType === CostType.SMART_SPLIT ? formData.smartBill : undefined
      };
      updateProject(updated);
      navigate('/profile');
    } else {
      const newProject: Project = { 
        id: Date.now().toString(), 
        hostId: currentUser.id, 
        hostName: currentUser.name, 
        hostAvatar: currentUser.avatar, 
        ...formData, 
        currentPeople: 1, 
        status: ProjectStatus.RECRUITING, 
        participants: [currentUser], 
        chatMessages: [], 
        reviews: [], 
        smartBill: formData.costType === CostType.SMART_SPLIT ? formData.smartBill : undefined 
      };
      addProject(newProject);
      navigate('/');
    }
  };

  const containerClass = "bg-white p-7 rounded-[32px] shadow-premium border border-black/[0.03] transition-all focus-within:shadow-premium-lg";
  const labelClass = "block text-[10px] font-black text-secondary uppercase tracking-widest mb-4 px-1 opacity-60";
  const inputClass = "w-full bg-gray-50 border-none rounded-2xl p-4 text-black placeholder-[#8E8E93] outline-none focus:ring-2 focus:ring-accent/30 focus:bg-white transition-all font-bold";

  return (
    <div className="space-y-8 pb-12 pt-4">
      <div className="flex items-center space-x-4 px-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white shadow-premium rounded-full text-black hover:scale-110 active:scale-90 transition-all border border-black/[0.02]"><ArrowLeft size={18} strokeWidth={3} /></button>
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter">{isEditMode ? '修改你的局' : t.create.title}</h1>
          {isEditMode && <div className="flex items-center space-x-1.5 mt-1"><Edit2 size={10} className="text-accent" /><span className="text-[10px] font-black uppercase tracking-widest opacity-40">Editing Existing Project</span></div>}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={containerClass}>
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-black text-secondary uppercase tracking-widest px-1 opacity-60">照片封面 / Cover Image</label>
            {/* AI Generate button removed from here */}
          </div>
          
          <div className="space-y-4">
             {/* Hidden File Input */}
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*" 
               onChange={handleFileUpload} 
             />

             <div onClick={() => setIsImageModalOpen(true)} className="cursor-pointer active:scale-[0.99] transition-transform">
               {formData.coverImage ? (
                 <div className="relative w-full h-40 rounded-2xl overflow-hidden group shadow-inner">
                    <img src={formData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <p className="text-white text-[10px] font-black uppercase tracking-widest">Change Image</p>
                    </div>
                 </div>
               ) : (
                 <div 
                   className="w-full h-40 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                 >
                    <ImageIcon size={32} className="text-gray-300" />
                    <span className="text-[10px] font-black uppercase text-gray-400">Tap to Upload or Select Preset</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        <div className={containerClass}>
          <label className={labelClass}>{t.create.formName}</label>
          <input required name="title" value={formData.title} onChange={handleInputChange} placeholder={t.create.namePlaceholder} className={`${inputClass} text-lg`} />
        </div>

        {/* --- Dynamic Tag Section --- */}
        <div className={containerClass}>
          <label className={labelClass}>标签 / PROJECT TAGS</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.tags.map((tag, idx) => (
              <span key={idx} className="flex items-center space-x-1 px-3 py-1.5 bg-black text-accent text-[10px] font-black rounded-full uppercase border border-white/10 group transition-all">
                <TagIcon size={10} />
                <span>{tag}</span>
                <button type="button" onClick={() => removeTag(idx)} className="hover:text-white"><X size={10} strokeWidth={3} /></button>
              </span>
            ))}
          </div>
          <div className="relative">
            <input 
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="ADD SOME KEYWORDS..."
              className={`${inputClass} text-[11px] pr-14`}
            />
            <button 
                type="button" 
                onClick={() => setIsTagModalOpen(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-accent rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-float hover:shadow-accent-glow z-10"
            >
              <PlusIcon size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className={containerClass}><CapsuleDropdown label={t.create.formType} options={Object.values(ProjectCategory)} value={formData.category} onChange={(val) => handleSelectOption('category', val)} t={t} /></div>
          <div className={containerClass}><CapsuleDropdown label={t.create.formCost} options={Object.values(CostType)} value={formData.costType} onChange={(val) => handleSelectOption('costType', val)} t={t} /></div>
        </div>
        
        {/* Revamped Smart Split Section - Collapsible Layout */}
        {formData.costType === CostType.SMART_SPLIT && (
          <div className={`${containerClass} animate-in slide-in-from-top-4 duration-500 border-2 border-accent/20 bg-accent/5`}>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
               <div className="flex items-center space-x-2">
                 <div className="p-1.5 bg-black text-accent rounded-lg"><Calculator size={14} /></div>
                 <h3 className="text-sm font-black uppercase tracking-tight">{t.create.smartSplit.title}</h3>
               </div>
               <span className="text-[9px] font-bold text-secondary uppercase opacity-60">{t.create.smartSplit.tips}</span>
            </div>

            {/* Total Amount Input */}
            <div className="mb-3 bg-white rounded-xl p-3 border border-black/5 shadow-sm flex items-center justify-between">
               <label className="text-[10px] font-black text-secondary uppercase tracking-widest">{t.create.smartSplit.totalAmount}</label>
               <div className="flex items-baseline space-x-1">
                  <span className="text-sm font-black text-black">¥</span>
                  <input 
                    type="number"
                    value={formData.smartBill.totalAmount || ''}
                    onChange={handleSmartBillTotal}
                    placeholder="0.00"
                    className="w-24 bg-transparent border-none text-xl font-black p-0 focus:ring-0 placeholder-gray-200 outline-none text-right"
                  />
               </div>
            </div>

            {/* Donut Chart */}
            <div className="transform scale-90 -my-4 origin-center">
                <DonutChart groups={formData.smartBill.groups} total={formData.smartBill.totalAmount} />
            </div>
            
            {/* Group Cards */}
            <div className="space-y-2">
               {formData.smartBill.groups.map((group, idx) => {
                  const allocation = splitAllocations[group.id] || { total: 0, perPerson: 0 };
                  const isExpanded = expandedGroupId === group.id;

                  // Calculate available slots for this group
                  const otherGroupsCount = formData.smartBill.groups.reduce<number>((sum, g) => g.id !== group.id ? sum + g.count : sum, 0);
                  const availableSlots = Math.max(1, (formData.maxPeople || 20) - otherGroupsCount);
                  
                  // Get Presets based on group length
                  const applicablePresets = formData.smartBill.groups.length === 2 ? PRESETS_2 : formData.smartBill.groups.length === 3 ? PRESETS_3 : [];

                  return (
                    <div key={group.id} className={`bg-white rounded-xl border transition-all overflow-hidden ${isExpanded ? 'border-accent shadow-md' : 'border-gray-100'}`}>
                        {/* Header / Summary (Click to Toggle) */}
                        <div 
                            onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                            className="flex items-center justify-between p-3 cursor-pointer active:bg-gray-50"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                <div className="flex flex-col">
                                     <span className="text-xs font-bold text-black">{group.name}</span>
                                     <div className="flex items-center text-[10px] text-gray-400 font-medium">
                                        <Users size={10} className="mr-1" /> {group.count}
                                     </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-black text-black">¥ {allocation.total.toFixed(0)}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-400">{group.ratio}%</span>
                                    <ChevronRight size={12} className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                            </div>
                        </div>

                        {/* Expanded Controls */}
                        {isExpanded && (
                            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-5 animate-in slide-in-from-top-2">
                                
                                {/* Name and Count Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Name</label>
                                        <input 
                                            value={group.name}
                                            onChange={(e) => handleGroupUpdate(group.id, 'name', e.target.value)}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-black outline-none transition-all shadow-sm"
                                            placeholder="Group Name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Count</label>
                                        
                                        {/* Dropdown Capsule Count Selector */}
                                        <CountSelector 
                                            value={group.count} 
                                            max={availableSlots} 
                                            onChange={(val) => handleGroupUpdate(group.id, 'count', val)} 
                                        />
                                    </div>
                                </div>

                                {/* Split Weight Slider */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Split Weight</label>
                                        {/* Intelligent Preset Dropdown */}
                                        {applicablePresets.length > 0 && (
                                            <div className="relative group/presets">
                                                <div className="flex items-center space-x-1 text-[9px] font-bold text-accent bg-black px-3 py-1 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors shadow-sm">
                                                    <span>Presets</span>
                                                    <ChevronDown size={10} />
                                                </div>
                                                <select
                                                    onChange={(e) => {
                                                        const selectedPreset = applicablePresets.find(p => p.label === e.target.value);
                                                        if (selectedPreset) applyPreset(group.id, selectedPreset.values);
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    value=""
                                                >
                                                    <option value="" disabled>Select Ratio</option>
                                                    {applicablePresets.map(p => (
                                                        <option key={p.label} value={p.label}>{p.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                     <div className="flex items-center space-x-3">
                                        <div className="relative flex-1 h-6 flex items-center">
                                            <input 
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={group.ratio || 0}
                                                onChange={(e) => handleGroupUpdate(group.id, 'ratio', parseFloat(e.target.value))}
                                                className="absolute w-full h-full opacity-0 cursor-pointer z-20"
                                            />
                                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div 
                                                className="h-full rounded-full transition-all duration-75"
                                                style={{ width: `${group.ratio || 0}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                                                />
                                            </div>
                                            <div 
                                                className="absolute h-4 w-4 bg-white rounded-full shadow-sm border border-gray-200 z-10 pointer-events-none flex items-center justify-center transition-all duration-75"
                                                style={{ left: `calc(${group.ratio || 0}% - 8px)` }}
                                            >
                                                <GripVertical size={8} className="opacity-40" />
                                            </div>
                                        </div>
                                        <span className="text-xs font-black w-8 text-right">{group.ratio}%</span>
                                     </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50">
                                    <div className="flex items-center space-x-1">
                                         <span className="text-[9px] font-bold text-gray-400 uppercase">Per Person:</span>
                                         <span className="text-[10px] font-black text-black">¥ {allocation.perPerson.toFixed(2)}</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={(e) => { e.stopPropagation(); removeGroup(group.id); }}
                                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                  );
               })}
            </div>

            {/* Add Group Button */}
            {formData.smartBill.groups.length < 5 && (
              <button 
                type="button"
                onClick={addGroup}
                className="w-full mt-3 py-2.5 bg-white/50 border border-dashed border-gray-300 rounded-xl flex items-center justify-center space-x-2 text-gray-400 hover:border-black hover:text-black transition-all active:scale-[0.98]"
              >
                 <PlusIcon size={14} strokeWidth={3} />
                 <span className="text-[9px] font-black uppercase tracking-widest">{t.create.smartSplit.addGroup}</span>
              </button>
            )}
          </div>
        )}
        
        <div className={containerClass}>
          <div className="flex justify-between items-center mb-4">
            <label className={labelClass}>{t.create.formDetails}</label>
            <button type="button" onClick={handleAIPolish} disabled={loading || !formData.description} className="flex items-center space-x-2 text-[9px] bg-black text-accent px-4 py-2 rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-20 shadow-float">{loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}<span>{t.create.aiPolish}</span></button>
          </div>
          <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={5} placeholder={t.create.detailsPlaceholder} className={`${inputClass} resize-none leading-relaxed`} />
        </div>
        
        <div className={containerClass}>
          <div className="space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-2 px-1"><Clock size={14} className="text-accent" /><label className="text-[10px] font-black text-secondary uppercase tracking-widest opacity-60">选择时间 / LAUNCH TIME</label></div>
              <WheelTimePicker value={formData.time} onChange={(val) => handleSelectOption('time', val)} />
            </div>
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-black/5">
               <div>
                  <label className={labelClass}>{t.create.formLimit}</label>
                  <input type="number" min="2" max="20" name="maxPeople" value={formData.maxPeople} onChange={handleInputChange} className={inputClass} />
               </div>
               <div>
                  <CapsuleDropdown label="城市 / CITY" options={CITIES} value={formData.city} onChange={(val) => setFormData(p => ({...p, city: val}))} t={t} />
               </div>
            </div>
             <div className="mt-4">
                  <label className={labelClass}>{t.create.formLoc}</label>
                  <input required name="location" value={formData.location} onChange={handleInputChange} placeholder="具体店名或地标" className={inputClass} />
             </div>
          </div>
        </div>
        
        <button type="submit" className="w-full py-5 rounded-[28px] bg-black text-accent font-black text-lg shadow-premium-lg active:scale-[0.96] hover:shadow-accent-glow transition-all uppercase tracking-widest mt-6">{isEditMode ? '确认修改 / Update' : t.create.submit}</button>
      </form>

      {/* Image Selection Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10">
           <div 
             className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
             onClick={() => setIsImageModalOpen(false)}
           />
           <div className="w-full max-w-md bg-white rounded-[32px] p-6 relative animate-in slide-in-from-bottom-10 duration-500 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-lg font-bold tracking-tight">Select Image</h3>
                 <button onClick={() => setIsImageModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100">
                   <X size={14} />
                 </button>
              </div>

              <div className="space-y-6">
                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-3">
                     <button 
                       type="button"
                       onClick={() => fileInputRef.current?.click()}
                       className="flex flex-col items-center justify-center gap-2 p-5 bg-gray-50 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
                     >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-black">
                           <Upload size={18} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Upload Photo</span>
                     </button>

                     <button 
                       type="button"
                       onClick={handleGenerateImage}
                       disabled={imgLoading || !formData.title}
                       className="flex flex-col items-center justify-center gap-2 p-5 bg-black rounded-2xl active:scale-95 transition-all disabled:opacity-50"
                     >
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-accent">
                           {imgLoading ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} strokeWidth={2.5} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">AI Generate</span>
                     </button>
                  </div>

                  {/* Presets Grid */}
                  <div>
                     <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-3 px-1 opacity-60">System Presets</p>
                     <div className="grid grid-cols-4 gap-2">
                        {imgPresets.map(img => (
                          <button 
                            key={img.url} 
                            type="button" 
                            onClick={() => { setFormData(p => ({...p, coverImage: img.url})); setIsImageModalOpen(false); }} 
                            className={`h-16 rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${formData.coverImage === img.url ? 'border-accent ring-2 ring-accent/20' : 'border-transparent opacity-80 hover:opacity-100'}`}
                          >
                             <img src={img.url} className="w-full h-full object-cover" />
                          </button>
                        ))}
                     </div>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Tag Selection Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-10">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsTagModalOpen(false)}
          />
          <div className="w-full max-w-md bg-white rounded-[32px] p-6 relative animate-in slide-in-from-bottom-10 duration-500 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold tracking-tight">Select Tags</h3>
                <button 
                  onClick={() => setIsTagModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100"
                >
                  <X size={14} />
                </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-[60vh] overflow-y-auto no-scrollbar pb-4">
              {PRESET_TAGS.map(tag => (
                <button 
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all ${formData.tags.includes(tag) ? 'bg-black text-accent border-black shadow-float' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <button 
              type="button"
              onClick={() => setIsTagModalOpen(false)}
              className="w-full mt-4 py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[11px] active:scale-[0.98] transition-all shadow-premium"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProject;