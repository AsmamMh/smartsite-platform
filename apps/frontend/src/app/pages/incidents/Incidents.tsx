import { AlertTriangle, Search, Upload, FileText, Send, User, Download, UserCheck, Users, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useAuthStore } from '../../store/authStore';
import { canEdit } from '../../utils/permissions';
import { mockIncidents } from '../../utils/mockData';
import { toast } from 'sonner';
import axios from 'axios';

// API pour rechercher des utilisateurs
const api = axios.create({
  baseURL: 'http://localhost:3001',
});

// Configuration des headers pour l'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pour les réponses (debug)
api.interceptors.response.use(
  (response) => {
    console.log('🔍 Frontend: Réponse API réussie:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Frontend: Erreur API:', error.config?.url, error.response?.status);
    return Promise.reject(error);
  }
);

export default function Incidents() {
  const user = useAuthStore((state) => state.user);
  // Contournement : si le role est null, utiliser un role par défaut
  const userRole = user?.role || { name: 'super_admin' as const };
  const canManageIncidents = user && canEdit(userRole.name, 'incidents');
  const [incidents, setIncidents] = useState(mockIncidents);
  const [filteredIncidents, setFilteredIncidents] = useState(mockIncidents);
  const [searchTerm, setSearchTerm] = useState('');
  const [newIncident, setNewIncident] = useState({
    type: '',
    description: '',
    severity: 'medium',
    image: null as File | null,
    pdfReport: null as File | null
  });
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [targetUserCin, setTargetUserCin] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [isSearchingUser, setIsSearchingUser] = useState(false);

  // États pour la sélection d'utilisateur
  const [showUserSelectDialog, setShowUserSelectDialog] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [selectedUserForIncident, setSelectedUserForIncident] = useState<any>(null);

  // États pour la génération IA
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Filtrer les incidents par recherche
  useEffect(() => {
    const filtered = incidents.filter(incident =>
      incident.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reportedBy?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIncidents(filtered);
  }, [incidents, searchTerm]);

  // Filtrer les utilisateurs par recherche et rôle
  useEffect(() => {
    let filtered = allUsers;

    // Filtrer par rôle
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role?.name === selectedRole);
    }

    // Filtrer par terme de recherche
    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.cin?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.firstname?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.lastname?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [allUsers, userSearchTerm, selectedRole]);

  // Charger tous les utilisateurs au démarrage
  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        console.log('🔍 Frontend: Début du chargement des utilisateurs...');
        console.log('🔍 Frontend: Token disponible:', !!localStorage.getItem('access_token'));
        console.log('🔍 Frontend: Utilisateur connecté:', user?.cin);

        if (!localStorage.getItem('access_token')) {
          console.error('❌ Frontend: Aucun token disponible');
          toast.error('Veuillez vous reconnecter');
          return;
        }

        console.log('🔍 Frontend: Appel API en cours...');
        const response = await api.get('/users');
        console.log('🔍 Frontend: Réponse reçue:', response.data.length, 'utilisateurs');

        if (response.data.length > 0) {
          console.log('🔍 Frontend: Premier utilisateur:', {
            cin: response.data[0].cin,
            name: response.data[0].firstname + ' ' + response.data[0].lastname,
            role: response.data[0].role?.name,
            status: response.data[0].status
          });
        }

        setAllUsers(response.data);
        console.log('✅ Frontend: Utilisateurs chargés avec succès');
        console.log('🔍 Frontend: allUsers state:', allUsers.length);
      } catch (error) {
        console.error('❌ Frontend: Erreur lors du chargement des utilisateurs:', error);
        if (error.response) {
          console.error('❌ Frontend: Status:', error.response.status);
          console.error('❌ Frontend: Data:', error.response.data);
        }
        toast.error('Erreur lors du chargement des utilisateurs');
      }
    };

    loadAllUsers();
  }, []);

  const handleAddIncident = () => {
    if (!newIncident.type || !newIncident.description) {
      toast.error('All fields are required');
      return;
    }
    const incident = {
      id: String(incidents.length + 1),
      type: newIncident.type as 'safety' | 'quality' | 'delay' | 'other',
      description: newIncident.description,
      severity: newIncident.severity as 'low' | 'medium' | 'high' | 'critical',
      status: 'open' as 'open' | 'investigating' | 'resolved' | 'closed',
      createdAt: new Date().toISOString(),
      reportedBy: user?.firstname + ' ' + user?.lastname || 'Current User',
      siteId: "1", // Valeur par défaut
    };
    setIncidents([...incidents, incident]);
    setNewIncident({
      type: '',
      description: '',
      severity: 'medium',
      image: null,
      pdfReport: null
    });
    toast.success('Incident reported successfully!');
  };

  const handleResolveIncident = (id: number) => {
    toast.success('Incident marked as resolved');
  };

  // Fonction pour assigner un incident à un utilisateur
  const handleAssignIncident = async () => {
    if (!selectedIncident || !targetUserCin.trim()) {
      toast.error('Veuillez spécifier le CIN de l\'utilisateur');
      return;
    }

    setIsSearchingUser(true);
    setFoundUser(null);

    // Rechercher l'utilisateur
    const user = await findUserByCin(targetUserCin);

    if (user) {
      setFoundUser(user);
      toast.success(`Incident assigné à ${user.name} (${user.cin})`);
    } else {
      toast.error('Utilisateur non trouvé pour ce CIN');
    }

    setIsSearchingUser(false);
  };

  // Fonction pour ouvrir la sélection d'utilisateur
  const openUserSelectDialog = () => {
    setShowUserSelectDialog(true);
    setUserSearchTerm('');
    setSelectedRole('all');
  };

  // Fonction pour sélectionner un utilisateur pour l'incident
  const selectUserForIncident = (user: any) => {
    setSelectedUserForIncident(user);
    setShowUserSelectDialog(false);
    toast.success(`Utilisateur ${user.name} sélectionné pour l'incident`);
  };

  // Fonction pour générer une description avec l'IA
  const generateDescriptionWithAI = async () => {
    if (!newIncident.type || !newIncident.severity) {
      toast.error('Veuillez sélectionner le type et la gravité de l\'incident');
      return;
    }

    setIsGeneratingDescription(true);

    try {
      // Simuler une génération IA (remplacer par un appel API réel)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const descriptions = {
        safety: {
          low: "Incident mineur de sécurité : situation contrôlée sans risque immédiat pour le personnel. Mesures préventives recommandées pour éviter récurrence.",
          medium: "Incident de sécurité modéré : risque potentiel pour le personnel avec nécessité d'intervention immédiate. Évaluation des procédures de sécurité requise.",
          high: "Incident de sécurité majeur : risque élevé pour le personnel avec arrêt temporaire des activités. Investigation complète et plan d'action corrective urgent.",
          critical: "Incident critique de sécurité : danger immédiat et grave pour le personnel. Évacuation et arrêt complet des activités en cours. Intervention d'urgence requise."
        },
        quality: {
          low: "Non-conformité qualité mineure : écart acceptable dans les tolérances standards. Action corrective simple et rapide à mettre en œuvre.",
          medium: "Non-conformité qualité modérée : impact sur les spécifications du produit. Analyse des causes et mise en place de mesures correctives.",
          high: "Non-conformité qualité majeure : impact significatif sur la performance du produit. Arrêt de production et investigation complète requise.",
          critical: "Non-conformité qualité critique : défaillance complète du produit. Rappel produit possible et révision complète du processus qualité."
        },
        delay: {
          low: "Retard mineur : impact négligeable sur le planning. Rattrapage possible sans ressources supplémentaires.",
          medium: "Retard modéré : impact sur le planning avec nécessité de réorganisation. Communication aux parties prenantes requise.",
          high: "Retard majeur : impact significatif sur le planning et budget. Plan de récupération urgent et réévaluation des délais.",
          critical: "Retard critique : arrêt du projet avec impact contractuel. Négociation avec client et révision complète du planning."
        },
        other: {
          low: "Incident mineur : situation gérable avec les ressources actuelles. Monitoring et documentation suffisants.",
          medium: "Incident modéré : nécessite une attention particulière et des ressources additionnelles. Plan d'action à définir.",
          high: "Incident majeur : impact significatif sur les opérations. Intervention immédiate et coordination d'équipe requise.",
          critical: "Incident critique : urgence absolue avec impact sur plusieurs départements. Mobilisation de toutes les ressources nécessaires."
        }
      };

      const generatedDescription = descriptions[newIncident.type as keyof typeof descriptions]?.[newIncident.severity as keyof typeof descriptions.safety] ||
        "Description générée automatiquement pour cet incident. Veuillez compléter avec les détails spécifiques.";

      setNewIncident({ ...newIncident, description: generatedDescription });
      toast.success('Description générée avec succès par l\'IA');

    } catch (error) {
      console.error('Erreur lors de la génération IA:', error);
      toast.error('Erreur lors de la génération de la description');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Fonction pour filtrer les utilisateurs par rôle
  const getUniqueRoles = () => {
    const roles = allUsers.map(user => user.role?.name).filter(Boolean);
    return ['all', ...Array.from(new Set(roles))];
  };

  // Fonction pour exporter un incident en PDF
  const handleExportPDF = (incident: any) => {
    // Créer le contenu du PDF
    const pdfContent = `
==========================================
RAPPORT D'INCIDENT - SMARTSITE PLATFORM
==========================================

INFORMATIONS DE L'INCIDENT
---------------------------
ID: ${incident.id}
Type: ${incident.type?.toUpperCase() || 'N/A'}
Gravité: ${incident.severity?.toUpperCase() || 'N/A'}
Statut: ${incident.status?.toUpperCase() || 'N/A'}
Date de création: ${new Date(incident.createdAt).toLocaleString('fr-FR')}

DESCRIPTION
-----------
${incident.description || 'N/A'}

INFORMATIONS DU RAPPORTEUR
-------------------------
Nom: ${incident.reportedBy || 'N/A'}
Date du rapport: ${new Date().toLocaleString('fr-FR')}
Généré par: SmartSite Platform

==========================================
Ce rapport est généré automatiquement par la plateforme SmartSite.
Pour toute question, veuillez contacter l'administrateur système.
==========================================
    `;

    // Créer un Blob et le télécharger
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incident_${incident.id}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Rapport d\'incident exporté avec succès !');
  };

  // Fonction pour trouver un utilisateur par CIN (API réelle)
  const findUserByCin = async (cin: string) => {
    try {
      const response = await api.get(`/users/cin/${cin}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la recherche utilisateur:', error);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Incident Management</h1>
          <p className="text-gray-500 mt-1">Track and resolve safety and quality incidents</p>
        </div>
        {canManageIncidents ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                + Report Incident
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report New Incident</DialogTitle>
                <DialogDescription>
                  Document a safety or quality incident
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="incident-type">Incident Type</Label>
                  <Select value={newIncident.type} onValueChange={(value) => setNewIncident({ ...newIncident, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="e.g., Safety Hazard, Quality Issue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safety">Safety Hazard</SelectItem>
                      <SelectItem value="quality">Quality Issue</SelectItem>
                      <SelectItem value="delay">Delay</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportedByCin">Your CIN (non-modifiable)</Label>
                  <Input
                    id="reportedByCin"
                    value={user?.cin || ''}
                    disabled
                    className="bg-gray-100"
                    placeholder="Your CIN will be automatically filled"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <div className="space-y-2">
                    <textarea
                      id="description"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Describe incident in detail"
                      value={newIncident.description}
                      onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                      rows={4}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateDescriptionWithAI}
                      disabled={isGeneratingDescription}
                      className="w-full"
                    >
                      {isGeneratingDescription ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-2" />
                          Générer avec l'IA
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select value={newIncident.severity} onValueChange={(value) => setNewIncident({ ...newIncident, severity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Upload Image (optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewIncident({ ...newIncident, image: e.target.files?.[0] || null })}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                  {newIncident.image && (
                    <p className="text-xs text-green-600">Image selected: {newIncident.image.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pdfReport">Upload PDF Report (optional)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="pdfReport"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setNewIncident({ ...newIncident, pdfReport: e.target.files?.[0] || null })}
                      className="flex-1"
                    />
                    <FileText className="h-4 w-4 text-gray-400" />
                  </div>
                  {newIncident.pdfReport && (
                    <p className="text-xs text-green-600">PDF selected: {newIncident.pdfReport.name}</p>
                  )}
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  onClick={handleAddIncident}
                >
                  Report Incident
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button disabled className="opacity-50 cursor-not-allowed">
            + Report Incident (No Permission)
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              All Incidents
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Rechercher un incident..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredIncidents.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                {searchTerm ? 'Aucun incident trouvé pour cette recherche' : 'No incidents reported'}
              </p>
            ) : (
              filteredIncidents.map((incident) => (
                <div key={incident.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{incident.type.toUpperCase()}</h3>
                      <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                      <div className="text-xs text-gray-400 mt-2 space-y-1">
                        <p>Reported by: {incident.reportedBy}</p>
                        <p>{new Date(incident.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge
                        variant={
                          incident.severity === 'critical' || incident.severity === 'high' ? 'destructive' :
                            incident.severity === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {incident.severity}
                      </Badge>
                      <Badge variant={incident.status === 'resolved' || incident.status === 'closed' ? 'secondary' : 'destructive'}>
                        {incident.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {incident.status !== 'resolved' && incident.status !== 'closed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveIncident(Number(incident.id))}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportPDF(incident)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedIncident(incident);
                        setShowAssignDialog(true);
                        setTargetUserCin('');
                        setFoundUser(null);
                      }}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Assign by CIN
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedIncident(incident);
                        openUserSelectDialog();
                      }}
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Select User
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialogue d'assignation d'incident */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Incident to User</DialogTitle>
            <DialogDescription>
              Assign this incident to a specific user by their CIN
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm">Incident Details</h4>
                <p className="text-sm text-gray-600 mt-1">{selectedIncident.type}</p>
                <p className="text-xs text-gray-500">{selectedIncident.description}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetUserCin">User CIN</Label>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <Input
                    id="targetUserCin"
                    placeholder="Enter user CIN..."
                    value={targetUserCin}
                    onChange={(e) => {
                      setTargetUserCin(e.target.value);
                      setFoundUser(null);
                    }}
                    className="flex-1"
                  />
                </div>
                {foundUser && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {foundUser.name} ({foundUser.cin})
                        </p>
                        <p className="text-xs text-green-600">
                          {foundUser.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <>
                  <Button variant="outline" onClick={() => {
                    setShowAssignDialog(false);
                    setSelectedIncident(null);
                    setTargetUserCin('');
                    setFoundUser(null);
                  }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignIncident}
                    disabled={isSearchingUser}
                  >
                    {isSearchingUser ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Send className="h-3 w-3 mr-1" />
                        Assign Incident
                      </>
                    )}
                  </Button>
                </>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de sélection d'utilisateur */}
      <Dialog open={showUserSelectDialog} onOpenChange={setShowUserSelectDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sélectionner un utilisateur</DialogTitle>
            <DialogDescription>
              Choisissez un utilisateur pour assigner l'incident
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="user-search">Rechercher un utilisateur</Label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    id="user-search"
                    placeholder="Rechercher par nom, CIN, email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="role-filter">Filtrer par rôle</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les rôles" />
                  </SelectTrigger>
                  <SelectContent>
                    {getUniqueRoles().map(role => (
                      <SelectItem key={role} value={role}>
                        {role === 'all' ? 'Tous les rôles' : role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedUserForIncident && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Utilisateur sélectionné: {selectedUserForIncident.firstname} {selectedUserForIncident.lastname}
                      </p>
                      <p className="text-xs text-green-600">
                        CIN: {selectedUserForIncident.cin} | Email: {selectedUserForIncident.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedUserForIncident(null);
                      toast.info('Sélection annulée');
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  {userSearchTerm || selectedRole !== 'all'
                    ? 'Aucun utilisateur trouvé pour ces critères'
                    : 'Chargement des utilisateurs...'}
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => selectUserForIncident(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {user.firstname} {user.lastname}
                          </p>
                          <p className="text-xs text-gray-500">
                            CIN: {user.cin}
                          </p>
                          <p className="text-xs text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {user.role?.name || 'N/A'}
                        </Badge>
                        <Badge
                          variant={user.status === 'approved' ? 'default' : 'secondary'}
                        >
                          {user.status || 'N/A'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowUserSelectDialog(false)}>
                Fermer
              </Button>
              {selectedUserForIncident && (
                <Button onClick={() => {
                  if (selectedIncident) {
                    toast.success(`Incident assigné à ${selectedUserForIncident.firstname} ${selectedUserForIncident.lastname}`);
                    setShowUserSelectDialog(false);
                    setSelectedUserForIncident(null);
                  }
                }}>
                  <Send className="h-3 w-3 mr-1" />
                  Confirmer l'assignation
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
