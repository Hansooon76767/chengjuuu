import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Project, ProjectStatus, ProjectCategory, CostType } from '../types';
import { locales, Language } from '../locales';

const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  isVerified: true,
  creditScore: 100,
  tags: ['E人', '桌游控', '周末党'],
  joinedProjects: [],
  location: '上海',
  birthDate: '1998-05-20'
};

const MOCK_USERS_DATA: User[] = [
  MOCK_USER,
  { id: 'u2', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200', isVerified: true, creditScore: 95, tags: ['精酿', '聊天'], joinedProjects: [], location: '上海', birthDate: '1995-03-15' },
  { id: 'u3', name: 'Mike', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200', isVerified: true, creditScore: 88, tags: ['骑行', '运动'], joinedProjects: [], location: '上海', birthDate: '1992-08-20' },
  { id: 'u4', name: 'Lina', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200', isVerified: true, creditScore: 92, tags: ['桌游', '德扑'], joinedProjects: [], location: '上海', birthDate: '1996-12-05' },
  { id: 'u5', name: 'David', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', isVerified: true, creditScore: 85, tags: ['露营', '自驾'], joinedProjects: [], location: '杭州', birthDate: '1990-06-30' },
  { id: 'u6', name: 'Emma', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200', isVerified: true, creditScore: 98, tags: ['咖啡', '手冲'], joinedProjects: [], location: '上海', birthDate: '1994-02-14' },
  { id: 'u7', name: 'Jason', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', isVerified: true, creditScore: 82, tags: ['飞盘', '运动'], joinedProjects: [], location: '北京', birthDate: '1998-11-11' },
  { id: 'u8', name: 'Sophie', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200', isVerified: true, creditScore: 96, tags: ['爵士', '音乐'], joinedProjects: [], location: '上海', birthDate: '1993-09-09' },
  { id: 'u9', name: 'Chris', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', isVerified: true, creditScore: 90, tags: ['电影', '文艺'], joinedProjects: [], location: '广州', birthDate: '1991-07-22' },
];

const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    hostId: 'u2',
    hostName: 'Sarah',
    hostAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    title: '周五晚精酿啤酒品鉴',
    description: '寻找志同道合的朋友一起探索城中新开的精酿馆，主打轻松聊天，不劝酒。',
    category: ProjectCategory.DRINKING,
    city: '上海',
    location: '静安区武定路',
    time: '本周五 20:00',
    maxPeople: 6,
    currentPeople: 4,
    costType: CostType.AA,
    status: ProjectStatus.RECRUITING,
    participants: [],
    chatMessages: [],
    reviews: [],
    tags: ['新手友好', '精品精酿', '无烟'],
    coverImage: 'https://images.unsplash.com/photo-1575425186775-b8de9a427e67?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p2',
    hostId: 'u3',
    hostName: 'Mike',
    hostAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200',
    title: '滨江骑行夜刷',
    description: '在这个微风沉醉的夜晚，让我们一起追风。全程20公里，休闲骑，甚至可以停下来吃个夜宵。',
    category: ProjectCategory.SPORTS,
    city: '上海',
    location: '徐汇滨江',
    time: '周六 19:30',
    maxPeople: 10,
    currentPeople: 8,
    costType: CostType.FREE,
    status: ProjectStatus.RECRUITING,
    participants: [],
    chatMessages: [],
    reviews: [],
    tags: ['夜骑', '装备要求', '摄影'],
    coverImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p3',
    hostId: 'u4',
    hostName: 'Lina',
    hostAvatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=200',
    title: '德州扑克新手友谊赛',
    description: '纯技术交流，不带金钱。欢迎新手，有专人讲解规则，气氛非常Nice。',
    category: ProjectCategory.BOARD_GAME,
    city: '上海',
    location: '长宁区愚园路',
    time: '周日 14:00',
    maxPeople: 8,
    currentPeople: 5,
    costType: CostType.AA,
    status: ProjectStatus.RECRUITING,
    participants: [],
    chatMessages: [],
    reviews: [],
    tags: ['新手向', '绿色竞技', '有空调'],
    coverImage: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p4',
    hostId: 'u5',
    hostName: 'David',
    hostAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    title: '安吉竹海周末露营',
    description: '逃离城市喧嚣，去安吉吸氧！自带装备或租赁皆可，晚上有篝火晚会和露天电影。',
    category: ProjectCategory.OUTDOOR,
    city: '杭州',
    location: '安吉县',
    time: '下周六 09:00',
    maxPeople: 12,
    currentPeople: 3,
    costType: CostType.AA,
    status: ProjectStatus.RECRUITING,
    participants: [],
    chatMessages: [],
    reviews: [],
    tags: ['自驾', '宠物友好', '过夜'],
    coverImage: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p5',
    hostId: 'u6',
    hostName: 'Emma',
    hostAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    title: '手冲咖啡入门工作坊',
    description: '从选豆到冲煮，专业咖啡师带你入门。包含三种不同产地咖啡豆品鉴。',
    category: ProjectCategory.WORKSHOP,
    city: '上海',
    location: '静安嘉里中心',
    time: '周日 10:30',
    maxPeople: 6,
    currentPeople: 6,
    costType: CostType.AA,
    status: ProjectStatus.FULL,
    participants: [],
    chatMessages: [],
    reviews: [],
    tags: ['技能交换', '咖啡控', '早鸟'],
    coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p6',
    hostId: 'u7',
    hostName: 'Jason',
    hostAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    title: '极限飞盘新手局',
    description: '不需要经验，会有教练教反手出盘。运动量适中，主要是为了交朋友！',
    category: ProjectCategory.SPORTS,
    city: '北京',
    location: '朝阳公园',
    time: '周六 16:00',
    maxPeople: 20,
    currentPeople: 12,
    costType: CostType.AA,
    status: ProjectStatus.RECRUITING,
    participants: [],
    chatMessages: [],
    reviews: [],
    tags: ['社交', '出汗', '男女比例1:1'],
    coverImage: 'https://images.unsplash.com/photo-1632165248231-c4270428d087?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p7',
    hostId: 'u8',
    hostName: 'Sophie',
    hostAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
    title: 'Blue Note 爵士之夜',
    description: '传奇爵士乐手现场演出，已订好卡座，缺两位喜欢Jazz的朋友。',
    category: ProjectCategory.DINING,
    city: '上海',
    location: '四川北路',
    time: '周五 21:00',
    maxPeople: 4,
    currentPeople: 2,
    costType: CostType.TREATER,
    status: ProjectStatus.RECRUITING,
    participants: [],
    chatMessages: [],
    reviews: [],
    tags: ['高雅', '音乐', '请客'],
    coverImage: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'p8',
    hostId: 'u9',
    hostName: 'Chris',
    hostAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    title: '独立电影《晒后假日》放映会',
    description: '屋顶放映会，提供爆米花和饮料。映后有简短的交流环节。',
    category: ProjectCategory.OTHER,
    city: '广州',
    location: '海珠区创意园',
    time: '周六 19:00',
    maxPeople: 15,
    currentPeople: 14,
    costType: CostType.FREE,
    status: ProjectStatus.RECRUITING,
    participants: [],
    chatMessages: [],
    reviews: [],
    tags: ['文艺', '电影', '氛围感'],
    coverImage: 'https://images.unsplash.com/photo-1517604931442-710c8ed63fe9?auto=format&fit=crop&q=80&w=800'
  }
];

interface AppContextType {
  currentUser: User;
  projects: Project[];
  language: Language;
  t: any;
  setLanguage: (lang: Language) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  joinProject: (projectId: string) => void;
  sendMessage: (projectId: string, content: string) => void;
  submitReview: (projectId: string, targetUserId: string, rating: number) => void;
  updateUser: (updates: Partial<User>) => void;
  getUser: (id: string) => User;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [language, setLanguageState] = useState<Language>('zh');

  const setLanguage = (lang: Language) => setLanguageState(lang);
  const t = locales[language];

  const getUser = (id: string) => {
    return MOCK_USERS_DATA.find(u => u.id === id) || MOCK_USER;
  };

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) return { ...p, status };
      return p;
    }));
  };

  const joinProject = (projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId && p.currentPeople < p.maxPeople) {
        const isJoined = p.participants.some(u => u.id === currentUser.id);
        if (isJoined) return p;
        return {
          ...p,
          currentPeople: p.currentPeople + 1,
          participants: [...p.participants, currentUser]
        };
      }
      return p;
    }));
    setCurrentUser(prev => ({
      ...prev,
      joinedProjects: [...prev.joinedProjects, projectId]
    }));
  };

  const sendMessage = (projectId: string, content: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newMessage = {
          id: Date.now().toString(),
          authorId: currentUser.id,
          authorName: currentUser.name,
          content,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return { ...p, chatMessages: [...p.chatMessages, newMessage] };
      }
      return p;
    }));
  };

  const submitReview = (projectId: string, targetUserId: string, rating: number) => {
    setProjects(prev => prev.map(p => {
        if(p.id === projectId) {
            return {
                ...p,
                reviews: [...p.reviews, { raterId: currentUser.id, targetId: targetUserId, rating }]
            }
        }
        return p;
    }))
  };

  const updateUser = (updates: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <AppContext.Provider value={{ currentUser, projects, language, t, setLanguage, addProject, updateProject, updateProjectStatus, joinProject, sendMessage, submitReview, updateUser, getUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};