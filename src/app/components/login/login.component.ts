import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@mcabank.com', [Validators.required, Validators.email]],
      password: ['123456', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) return;

    this.loading = true;
    
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackBar.open(response.message, 'Fechar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.snackBar.open('Erro ao fazer login. Verifique suas credenciais.', 'Fechar', { duration: 3000 });
      }
    });
  }
}