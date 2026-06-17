import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  success = false;
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.error = '';
    
    if (this.password !== this.confirmPassword) {
      this.error = 'Şifreler eşleşmiyor';
      return;
    }

    if (this.password.length < 8) {
      this.error = 'Şifre en az 8 karakter olmalıdır';
      return;
    }

    this.loading = true;
    this.authService.register(this.email, this.password).subscribe({
      next: (response) => {
        this.success = true;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Bir hata oluştu';
        this.loading = false;
      }
    });
  }
}
