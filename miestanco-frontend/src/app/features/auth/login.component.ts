import { Component, signal, inject, ChangeDetectionStrategy, ApplicationRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private appRef = inject(ApplicationRef);

  // Inicializar ThemeService para que aplique el tema guardado en login también
  private _theme = inject(ThemeService);

  loading  = signal(false);
  errorMsg = signal('');
  showPass = signal(false);

  form = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  togglePass() { this.showPass.update(v => !v); }

  onSubmit() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.errorMsg.set('');

    this.auth.login({
      username: this.form.value.username!,
      password: this.form.value.password!
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.appRef.tick();
        this.router.navigate(['/pedidos']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Usuario o contraseña incorrectos');
      }
    });
  }
}
