import axios from "axios";

// API pour les sites (port 3001)
const sitesApi = axios.create({
  baseURL: "http://localhost:3001/api",
});

// API pour les projets (port 3002)
const projectsApi = axios.create({
  baseURL: "http://localhost:3002",
});

// API pour les incidents (port 3003)
const incidentsApi = axios.create({
  baseURL: "http://localhost:3003",
});

// Récupérer le token depuis le localStorage
function getAuthToken(): string | null {
  const directToken = localStorage.getItem("access_token");
  if (directToken) return directToken;
  const persisted = localStorage.getItem("smartsite-auth");
  if (!persisted) return null;
  try {
    const parsed = JSON.parse(persisted);
    return parsed?.state?.user?.access_token || null;
  } catch {
    return null;
  }
}

// Ajouter le token d'authentification à toutes les requêtes
[sitesApi, projectsApi, incidentsApi].forEach(api => {
  api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

// Types pour les données
export interface Site {
  _id: string;
  name: string;
  localisation: string;
  status: string;
  budget: number;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  priority: string;
  deadline: string;
  assignedTo: string;
  assignedToName: string;
  assignedToRole: string;
  tasks: any[];
  createdAt: string;
  updatedAt: string;
  projectManagerName: string;
  budget?: number;
}

export interface Task {
  _id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string | { name: string; permissions: string[] };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Incident {
  _id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'resolved' | 'open' | 'investigating';
  description: string;
  createdAt: string;
  updatedAt: string;
}

// API pour les sites
export const getSites = async (): Promise<Site[]> => {
  try {
    const response = await sitesApi.get("/gestion-sites?limit=100");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching sites:", error);
    return [];
  }
};

// API pour les projets
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await projectsApi.get("/projects/all");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

// API pour les tâches urgentes
export const getUrgentTasks = async (): Promise<Task[]> => {
  try {
    const response = await projectsApi.get("/tasks/urgent");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching urgent tasks:", error);
    return [];
  }
};

// API pour les incidents récents
export const getRecentIncidents = async (limit: number = 5): Promise<Incident[]> => {
  try {
    const response = await incidentsApi.get(`/incidents?limit=${limit}`);
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching incidents:", error);
    return [];
  }
};

// API pour les membres de l'équipe (utilise le service user-authentication)
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const response = await axios.get("http://localhost:3000/users", {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    });
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
};

// Statistiques globales combinées
export const getDashboardStats = async () => {
  try {
    const [sites, projects, urgentTasks, incidents, teamMembers] = await Promise.allSettled([
      getSites(),
      getProjects(),
      getUrgentTasks(),
      getRecentIncidents(),
      getTeamMembers()
    ]);

    return {
      sites: sites.status === 'fulfilled' ? sites.value : [],
      projects: projects.status === 'fulfilled' ? projects.value : [],
      urgentTasks: urgentTasks.status === 'fulfilled' ? urgentTasks.value : [],
      incidents: incidents.status === 'fulfilled' ? incidents.value : [],
      teamMembers: teamMembers.status === 'fulfilled' ? teamMembers.value : [],
      stats: {
        totalSites: sites.status === 'fulfilled' ? sites.value.length : 0,
        activeSites: sites.status === 'fulfilled' ? sites.value.filter(s => s.status === 'active').length : 0,
        totalProjects: projects.status === 'fulfilled' ? projects.value.length : 0,
        activeProjects: projects.status === 'fulfilled' ? projects.value.filter(p => p.status === 'en_cours').length : 0,
        urgentTasks: urgentTasks.status === 'fulfilled' ? urgentTasks.value.length : 0,
        criticalIncidents: incidents.status === 'fulfilled' ? incidents.value.filter(i => i.severity === 'critical' || i.severity === 'high').length : 0,
        totalTeamMembers: teamMembers.status === 'fulfilled' ? teamMembers.value.length : 0,
        activeTeamMembers: teamMembers.status === 'fulfilled' ? teamMembers.value.filter(m => m.isActive).length : 0,
        totalBudget: projects.status === 'fulfilled' ? projects.value.reduce((sum, p) => sum + (p.budget || 0), 0) : 0,
        avgProgress: projects.status === 'fulfilled' && projects.value.length > 0
          ? Math.round(projects.value.reduce((sum, p) => sum + p.progress, 0) / projects.value.length)
          : 0
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      sites: [],
      projects: [],
      urgentTasks: [],
      incidents: [],
      teamMembers: [],
      stats: {
        totalSites: 0,
        activeSites: 0,
        totalProjects: 0,
        activeProjects: 0,
        urgentTasks: 0,
        criticalIncidents: 0,
        totalTeamMembers: 0,
        activeTeamMembers: 0,
        totalBudget: 0,
        avgProgress: 0
      }
    };
  }
};
