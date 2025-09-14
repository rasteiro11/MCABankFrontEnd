import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatListModule
  ],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  depositForm: FormGroup;
  withdrawForm: FormGroup;
  depositLoading = false;
  withdrawLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private clientService: ClientService,
    private snackBar: MatSnackBar,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: Client | null = null,
    @Optional() public dialogRef?: MatDialogRef<ClientDetailComponent>,
  ) {
    this.depositForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      descricao: ['']
    });

    this.withdrawForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      descricao: ['']
    });
  }

  ngOnInit(): void {
    if (this.data) {
      this.client = this.data;
      this.updateWithdrawValidator();
    } else {
      const id = Number(this.route.snapshot.params['id']);
      if (id) {
        this.loadClient(id);
      }
    }
  }

  loadClient(id: number): void {
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.client = client;
        this.updateWithdrawValidator();
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar cliente', 'Fechar', { duration: 3000 });
        this.router.navigate(['/clients']);
      }
    });
  }

  updateWithdrawValidator(): void {
    if (this.client) {
      this.withdrawForm.get('amount')?.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.client.saldo)
      ]);
      this.withdrawForm.get('amount')?.updateValueAndValidity();
    }
  }

  deposit(): void {
    if (this.depositForm.invalid || this.depositLoading || !this.client) return;

    this.depositLoading = true;
    this.clientService.deposit(this.client.id!, { ...this.depositForm.value, idempotency_key: uuidv4() } ).subscribe({
      next: (transaction) => {
        this.depositLoading = false;
        this.snackBar.open('Depósito realizado com sucesso', 'Fechar', { duration: 3000 });
        this.depositForm.reset();
        this.loadClient(this.client!.id!);
        this.closeDialog()
      },
      error: (error) => {
        this.depositLoading = false;
        this.snackBar.open('Erro ao realizar depósito', 'Fechar', { duration: 3000 });
      }
    });
  }

  withdraw(): void {
    if (this.withdrawForm.invalid || this.withdrawLoading || !this.client) return;

    this.withdrawLoading = true;
    this.clientService.withdraw(this.client.id!, { ...this.withdrawForm.value, idempotency_key: uuidv4()}).subscribe({
      next: (transaction) => {
        this.withdrawLoading = false;
        this.snackBar.open('Saque realizado com sucesso', 'Fechar', { duration: 3000 });
        this.withdrawForm.reset();
        this.loadClient(this.client!.id!);
        this.closeDialog()
      },
      error: (error) => {
        this.withdrawLoading = false;
        const message = error.message || 'Erro ao realizar saque';
        this.snackBar.open(message, 'Fechar', { duration: 3000 });
      }
    });
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}