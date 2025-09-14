import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  styleUrls: ['./client-form.component.css'],
  templateUrl: './client-form.component.html',
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  loading = false;
  isEditMode = false;
  clientId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Client | null = null,
    @Optional() private dialogRef?: MatDialogRef<ClientFormComponent>
  ) {
    this.clientForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      saldo: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.data) {
      // Opened as dialog for edit
      this.isEditMode = true;
      this.clientId = this.data.id!;
      this.clientForm.removeControl('saldo');
      this.clientForm.patchValue({
        nome: this.data.nome,
        email: this.data.email,
      });
    } else {
      // Fallback to route params for navigation-based usage
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.clientId = Number(params['id']);
          this.loadClient(this.clientId);
          this.clientForm.removeControl('saldo');
        }
      });
    }
  }

  loadClient(id: number): void {
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          nome: client.nome,
          email: client.email,
        });
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar cliente', 'Fechar', { duration: 3000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid || this.loading) return;

    this.loading = true;
    const clientData = this.clientForm.value;

    if (this.isEditMode && this.clientId) {
      this.clientService.updateClient(this.clientId, clientData).subscribe({
        next: (client) => {
          this.loading = false;
          this.snackBar.open('Cliente atualizado com sucesso', 'Fechar', { duration: 3000 });
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.router.navigate(['/clients', client.id]);
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Erro ao atualizar cliente', 'Fechar', { duration: 3000 });
        }
      });
    } else {
      this.clientService.createClient(clientData).subscribe({
        next: (client) => {
          this.loading = false;
          this.snackBar.open('Cliente criado com sucesso', 'Fechar', { duration: 3000 });
          if (this.dialogRef) {
            this.dialogRef.close(true);
          } else {
            this.router.navigate(['/clients', client.id]);
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Erro ao criar cliente', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}