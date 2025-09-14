import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent implements OnInit {
  private reloadSubject = new Subject<void>();
  reload$ = this.reloadSubject.asObservable();

  allClients: Client[] = []; 
  clients: Client[] = [];    
  displayedColumns: string[] = ['id', 'nome', 'saldo', 'status', 'actions'];
  loadingClients = false;

  @ViewChild('tableContainer') tableContainer!: ElementRef;
  ngAfterViewInit() {
    this.tableContainer.nativeElement.style.setProperty('--min-rows', this.pageSize);
  }

  @Input() showClientDetails!: (client: Client) => void;
  @Input() editClient!: (client: Client) => void;
  @Input() deleteClientHandler!: (client: Client) => void;
  @Input() createClient!: () => void;

  totalCount = 0;
  pageSize = 5;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 20, 50];

  constructor(
    private clientService: ClientService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadClients()
    this.reload$.subscribe(() => {
      this.loadClients();
    });
  }

  loadClients(): void {
    this.loadingClients = true;
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.allClients = clients;
        this.totalCount = clients.length;
        this.updatePage();
        this.loadingClients = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar clientes', 'Fechar', { duration: 3000 });
        this.loadingClients = false;
      }
    });
  }

  updatePage(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.clients = this.allClients.slice(start, end);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePage();
  }

  triggerReload(): void {
    this.reloadSubject.next();
  }
}