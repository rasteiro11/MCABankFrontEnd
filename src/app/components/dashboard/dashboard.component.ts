import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { User } from '../../models/auth.model';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { ClientListComponent } from '../client-list/client-list.component';
import { MatDialog } from '@angular/material/dialog';
import { ClientDetailComponent } from '../client-detail/client-detail.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { ClientFormComponent } from '../client-form/client-form.component';
import { timer } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatMenuModule,
    ClientListComponent,
    ClientFormComponent
  ]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  totalClients = 0;
  totalBalance = 0;
  activeClients = 0;
  recentClients: Client[] = [];
  reloadClientListCounter = 0;

  @ViewChild(ClientListComponent) clientListComponent!: ClientListComponent;

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.clientService.getAllClients().subscribe(clients => {
      this.totalClients = clients.length;
      this.totalBalance = clients.reduce((sum, client) => sum + client.saldo, 0);
      this.activeClients = clients.filter(client => client.ativo).length;
      this.recentClients = clients
        .sort((a, b) => new Date(b.dataCadastro!).getTime() - new Date(a.dataCadastro!).getTime())
        .slice(0, 5);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showClientDetails = (client: Client) => {
    this.dialog.open(ClientDetailComponent, {
      width: '75vw',
      maxWidth: '75vw',
      height: '90vh',
      maxHeight: '90vh',
      data: client,
      panelClass: 'wide-dialog'
    });
  };

  editClient = (client: Client) => {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '1100px',
      data: client
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.refreshDashboard();
      }
    })
  };

  deleteClientHandler = (client: Client) => {
    const dialogRef = this.dialog.open(ConfirmDeleteDialogComponent, {
      width: '1100px',
      data: { nome: client.nome }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.clientService.deleteClient(client.id!).subscribe({
          next: () => {
            this.refreshDashboard();
          }
        });
      }
    });
  };

  createClient = () => {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '1100px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if (result === true) {
        this.refreshDashboard();
      }
    });
  };

  refreshDashboard() {
      console.log('Refreshing dashboard data...');
      if (this.clientListComponent) {
        this.clientListComponent.triggerReload();
      }
      this.loadDashboardData();
  }
}