import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('projects/all')
  getAllProjects() {
    // Données de test pour le Super Admin Projects Dashboard
    return [
      {
        _id: '1',
        name: 'Site E-commerce',
        description: 'Développement plateforme e-commerce',
        status: 'en_cours',
        progress: 65,
        priority: 'high',
        deadline: '2026-04-15',
        assignedTo: 'pm001',
        assignedToName: 'Jean Dupont',
        assignedToRole: 'project_manager',
        tasks: [],
        createdAt: '2026-03-01',
        updatedAt: '2026-03-29',
        projectManagerName: 'Jean Dupont'
      },
      {
        _id: '2',
        name: 'Application Mobile',
        description: 'App iOS/Android pour gestion',
        status: 'en_retard',
        progress: 30,
        priority: 'urgent',
        deadline: '2026-03-22',
        assignedTo: 'pm002',
        assignedToName: 'Marie Martin',
        assignedToRole: 'project_manager',
        tasks: [],
        createdAt: '2026-02-15',
        updatedAt: '2026-03-29',
        projectManagerName: 'Marie Martin'
      },
      {
        _id: '3',
        name: 'Dashboard Analytics',
        description: 'Tableau de bord analytique',
        status: 'terminé',
        progress: 100,
        priority: 'low',
        deadline: '2026-03-10',
        assignedTo: 'pm003',
        assignedToName: 'Pierre Bernard',
        assignedToRole: 'project_manager',
        tasks: [],
        createdAt: '2026-02-01',
        updatedAt: '2026-03-10',
        projectManagerName: 'Pierre Bernard'
      }
    ];
  }

  @Get('tasks/urgent')
  getUrgentTasks() {
    // Données de test pour les tâches urgentes
    return [
      {
        _id: '1-1',
        title: 'Intégration paiement',
        status: 'en_cours',
        priority: 'urgent',
        deadline: '2026-03-25',
        projectId: '1',
        createdAt: '2026-03-01',
        updatedAt: '2026-03-29'
      },
      {
        _id: '2-1',
        title: 'Backend API',
        status: 'en_retard',
        priority: 'urgent',
        deadline: '2026-03-20',
        projectId: '2',
        createdAt: '2026-02-15',
        updatedAt: '2026-03-29'
      }
    ];
  }
}
