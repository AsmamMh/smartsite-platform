import axios from "axios";

// API pour les projets (port 3002)
const projectsApi = axios.create({
  baseURL: "http://localhost:3002",
});

// API pour les sites (port 3001)
const sitesApi = axios.create({
  baseURL: "http://localhost:3001/api",
});

// API pour les utilisateurs (port 3000)
const usersApi = axios.create({
  baseURL: "http://localhost:3000",
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
[projectsApi, sitesApi, usersApi].forEach(api => {
  api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

// Types pour les données synchronisées
export interface Site {
  _id: string;
  name: string;
  localisation: string;
  status: string;
  budget: number;
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

export interface SyncedProject {
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
  // Données synchronisées
  assignedTeam?: TeamMember[];
  assignedSites?: Site[];
  teamSize?: number;
  siteCount?: number;
  totalTeamBudget?: number;
  totalSiteBudget?: number;
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

// API pour les projets
export const getAllProjectsForSuperAdmin = async (): Promise<SyncedProject[]> => {
  try {
    const response = await projectsApi.get("/projects/all");
    return response.data || [];
  } catch (error) {
    console.error("Error fetching all projects for super admin:", error);
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

// API pour les sites
export const getAllSites = async (): Promise<Site[]> => {
  try {
    const response = await sitesApi.get("/gestion-sites?limit=100");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching sites:", error);
    return [];
  }
};

// API pour les membres de l'équipe
export const getAllTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const response = await usersApi.get("/users");
    return response.data.data || response.data || [];
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
};

// Fonction de synchronisation principale
export const getSyncedProjectsWithDetails = async (): Promise<SyncedProject[]> => {
  try {
    // Charger toutes les données en parallèle
    const [projects, sites, teamMembers] = await Promise.allSettled([
      getAllProjectsForSuperAdmin(),
      getAllSites(),
      getAllTeamMembers()
    ]);

    const projectsData = projects.status === 'fulfilled' ? projects.value : [];
    const sitesData = sites.status === 'fulfilled' ? sites.value : [];
    const teamMembersData = teamMembers.status === 'fulfilled' ? teamMembers.value : [];

    // Synchroniser les projets avec les équipes et sites
    const syncedProjects = projectsData.map(project => {
      // Trouver les membres de l'équipe assignés à ce projet
      const assignedTeam = teamMembersData.filter(member => {
        const memberId = member._id;
        const projectAssignedTo = project.assignedTo;
        return memberId === projectAssignedTo || 
               (typeof member.role === 'object' && (member.role as any).name === 'project_manager' && 
                member._id === projectAssignedTo);
      });

      // Trouver les sites assignés à ce projet (basé sur le nom ou une référence)
      const assignedSites = sitesData.filter(site => {
        // Logique d'association: sites dont le nom contient le nom du projet
        return site.name.toLowerCase().includes(project.name.toLowerCase()) ||
               site.localisation.toLowerCase().includes(project.name.toLowerCase());
      });

      // Calculer les statistiques
      const teamSize = assignedTeam.length;
      const siteCount = assignedSites.length;
      const totalTeamBudget = assignedTeam.reduce((sum, member) => sum + 0, 0); // Pas de budget membre pour l'instant
      const totalSiteBudget = assignedSites.reduce((sum, site) => sum + (site.budget || 0), 0);

      return {
        ...project,
        assignedTeam,
        assignedSites,
        teamSize,
        siteCount,
        totalTeamBudget,
        totalSiteBudget
      };
    });

    return syncedProjects;
  } catch (error) {
    console.error("Error syncing projects with details:", error);
    return [];
  }
};

// API pour les statistiques des projets synchronisés
export const getSyncedProjectStats = async () => {
  try {
    const projects = await getSyncedProjectsWithDetails();
    
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'en_cours').length,
      completedProjects: projects.filter(p => p.status === 'terminé').length,
      delayedProjects: projects.filter(p => p.status === 'en_retard').length,
      totalTeamMembers: projects.reduce((sum, p) => sum + (p.teamSize || 0), 0),
      totalSites: projects.reduce((sum, p) => sum + (p.siteCount || 0), 0),
      totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      totalSiteBudget: projects.reduce((sum, p) => sum + (p.totalSiteBudget || 0), 0),
      avgProgress: projects.length > 0 
        ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
        : 0,
      urgentProjects: projects.filter(p => p.priority === 'urgent').length,
      highPriorityProjects: projects.filter(p => p.priority === 'high').length
    };

    return stats;
  } catch (error) {
    console.error("Error fetching synced project stats:", error);
    return {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      delayedProjects: 0,
      totalTeamMembers: 0,
      totalSites: 0,
      totalBudget: 0,
      totalSiteBudget: 0,
      avgProgress: 0,
      urgentProjects: 0,
      highPriorityProjects: 0
    };
  }
};
