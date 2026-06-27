const BASE_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001/api`;

function getToken(): string | null {
  return localStorage.getItem('kryvant_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401) {
    localStorage.removeItem('kryvant_token');
    localStorage.removeItem('kryvant_user');
    window.location.href = '/login';
    throw new Error('No autenticado');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
  return data as T;
}

export const api = {
  // Auth
  register: (body: { email: string; username: string; password: string }) =>
    request<{ token: string; user: AuthUser }>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),

  loginWithGitHub: (code: string) =>
    request<{ token: string; user: AuthUser; githubToken: string }>('/auth/github', {
      method: 'POST', body: JSON.stringify({ code }),
    }),

  me: () => request<AuthUser>('/auth/me'),

  // Dashboard
  getDashboard: () => request<DashboardData>('/users/dashboard'),

  // Analysis
  analyze: (body: AnalyzePayload) =>
    request<AnalysisResult>('/analysis/analyze', { method: 'POST', body: JSON.stringify(body) }),

  getAnalysisResults: () => request<AnalysisResultFull>('/analysis/results'),

  // Projects
  getProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  updateProject: (id: string, body: Partial<Project>) =>
    request<Project>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Jobs
  getJobs: () => request<Job[]>('/jobs'),
  getJob: (id: string) => request<Job>(`/jobs/${id}`),

  // Learning
  getLearning: () => request<LearningResource[]>('/learning'),

  // Billing
  getBilling: () => request<Subscription>('/billing'),
  upgradePlan: (plan: 'PRO' | 'ENTERPRISE') =>
    request<{ ok: boolean; subscription: Subscription }>('/billing/upgrade', {
      method: 'POST', body: JSON.stringify({ plan }),
    }),
  cancelPlan: () =>
    request<{ ok: boolean }>('/billing/cancel', { method: 'POST' }),

  // Profile
  getProfile: () => request<UserWithProfile>('/users/profile'),
  updateProfile: (body: Partial<ProfileUpdate>) =>
    request<Profile>('/users/profile', { method: 'PATCH', body: JSON.stringify(body) }),

  // Teams
  getTeams: () => request<Team[]>('/teams'),
  createTeam: (body: { name: string; slug: string }) =>
    request<Team>('/teams', { method: 'POST', body: JSON.stringify(body) }),
  inviteToTeam: (teamId: string, email: string) =>
    request<TeamMember>(`/teams/${teamId}/invite`, { method: 'POST', body: JSON.stringify({ email }) }),
  getTeamMembers: (teamId: string) => request<TeamMember[]>(`/teams/${teamId}/members`),
};

// Types
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  avatarUrl?: string;
}

export interface DashboardData {
  matchScore: number;
  targetRole: TargetRole | null;
  skillGaps: SkillGap[];
  skills: SkillAnalysis[];
  recentProjects: Project[];
}

export interface AnalyzePayload {
  githubUsername: string;
  targetCompany: string;
  targetTitle: string;
  targetLevel?: string;
  githubToken?: string;
}

export interface SkillAnalysis {
  skill: string;
  level: 'Experto' | 'Avanzado' | 'Intermedio' | 'Junior';
  matchPercent: number;
  repoCount: number;
}

export interface AnalysisResult {
  githubUser: { login: string; name: string | null; avatarUrl: string };
  skills: SkillAnalysis[];
  gaps: SkillGap[];
  matchScore: number;
  targetRole: TargetRole;
}

export interface AnalysisResultFull {
  profile: UserWithProfile;
  skills: SkillAnalysis[];
}

export interface TargetRole {
  id: string;
  company: string;
  title: string;
  level: string;
  matchScore: number;
  summary?: string | null;
}

export interface SkillGap {
  id: string;
  title: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedDays: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  project?: Project;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  progress: number;
  githubUrl?: string;
  startedAt?: string;
  completedAt?: string;
  skillGap?: SkillGap & { targetRole: TargetRole };
}

export interface Job {
  id: string;
  company: string;
  title: string;
  level: string;
  location: string;
  salary: string;
  techStack: string[];
  description: string;
  url: string;
  postedAt: string;
  isNew: boolean;
}

export interface LearningResource {
  id: string;
  category: string;
  title: string;
  type: string;
  platform: string;
  duration: string;
  level: string;
  url: string;
  tags: string[];
  rating: number;
  free: boolean;
}

export interface Subscription {
  id: string;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Profile {
  id: string;
  githubUsername?: string;
  linkedinUrl?: string;
  bio?: string;
  yearsOfExp: number;
  currentRole?: string;
  skills: string;
}

export interface ProfileUpdate {
  githubUsername: string;
  linkedinUrl: string;
  bio: string;
  yearsOfExp: number;
  currentRole: string;
}

export interface UserWithProfile {
  id: string;
  email: string;
  username: string;
  plan: string;
  avatarUrl?: string;
  profile?: Profile;
  subscription?: Subscription;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: string;
  teamRole: 'OWNER' | 'ADMIN' | 'MEMBER';
  user: AuthUser;
}
