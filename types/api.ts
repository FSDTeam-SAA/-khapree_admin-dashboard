export type ApiMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
};

export type Avatar = {
  public_id: string;
  url: string;
};

export type AppUser = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  currentPlan?: string;
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  avatar?: Avatar;
  subscription?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    plan?: {
      name?: string;
      priceMonthly?: number;
      priceYearly?: number;
    };
  } | null;
};

export type LoginData = {
  accessToken: string;
  refreshToken: string;
  role: "admin" | "user";
  _id: string;
  user: AppUser;
};

export type DashboardOverview = {
  totalUsers: number;
  activeSubscriptionCount: number;
  totalQuizzes: number;
  totalJournalEntries: number;
  totalQuizTaken: number;
  totalMeditationCompleted: number;
};

export type DashboardSeriesPoint = {
  date: string;
  day: string;
  count: number;
};

export type DashboardData = {
  overview: DashboardOverview;
  userActivity: {
    quizTaken: DashboardSeriesPoint[];
    journalEntries: DashboardSeriesPoint[];
    meditationCompleted: DashboardSeriesPoint[];
  };
  recentUsers: AppUser[];
};

export type SubscriptionPlan = {
  _id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  isActive: boolean;
  features: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type QuizOption = {
  label: string;
  text: string;
};

export type QuizQuestion = {
  question: string;
  options: QuizOption[];
  order: number;
};

export type Quiz = {
  _id: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
};

export type Archetype = {
  _id: string;
  title: string;
  description: string;
  emotion: string;
  insight: string;
  color: string;
  priority: number;
  isActive: boolean;
  emoji: Avatar;
  attachment: {
    public_id: string;
    url: string;
    resourceType: string;
  };
  linkedQuestionTags: string[];
  createdAt: string;
};

export type JournalPrompt = {
  _id: string;
  title: string;
  moodQuestion: string;
  emotion: string;
  emotions: string[];
  promptQuestions: string[];
  tips: string[];
  isActive: boolean;
  createdAt: string;
};

export type Meditation = {
  _id: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  benefits: string[];
  recommendationTags: string[];
  audioUrl: string;
  emoji: Avatar;
  isActive: boolean;
  createdAt: string;
};

export type PlaylistTrack = {
  _id: string;
  title: string;
  artist: string;
  duration: string;
  audioUrl: string;
  thumbnailUrl: string;
  playCount: number;
};

export type Playlist = {
  _id: string;
  name: string;
  meditation: {
    _id: string;
    title: string;
    category: string;
  };
  category: string;
  description: string;
  categoryIconUrl: string;
  trackCount: number;
  tracks: PlaylistTrack[];
  isActive: boolean;
  createdAt: string;
};

export type UsersListResponse = {
  users: AppUser[];
  meta: ApiMeta;
};

