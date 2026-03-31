import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);

  currentStep = signal<number>(1);
  totalSteps = 3;
  
  schoolInfoForm: FormGroup;
  adminAccountForm: FormGroup;
  planSelectionForm: FormGroup;
  
  errorMessage = signal<string>('');
  successMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  institutionTypes = [
    { value: 'k12', label: 'K-12 Academy' },
    { value: 'university', label: 'University' },
    { value: 'college', label: 'College' },
    { value: 'vocational', label: 'Vocational School' },
    { value: 'primary', label: 'Primary School' },
    { value: 'secondary', label: 'Secondary School' }
  ];

  countries = [
    { value: 'Kenya', label: 'Kenya' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'South Africa', label: 'South Africa' }
  ];

  enrollmentRanges = [
    { value: '<200', label: '< 200' },
    { value: '200-1k', label: '200 - 1k' },
    { value: '1k-5k', label: '1k - 5k' },
    { value: '5k+', label: '5k+' }
  ];

  constructor() {
    this.schoolInfoForm = this.fb.group({
      school_name: ['', [Validators.required, Validators.minLength(3)]],
      institution_type: ['k12', Validators.required],
      country: ['Kenya', Validators.required],
      student_enrollment: ['200-1k', Validators.required]
    });

    this.adminAccountForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirm: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.planSelectionForm = this.fb.group({
      plan: ['pro', Validators.required]
    });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('password_confirm')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  nextStep(): void {
    let currentForm: FormGroup;
    
    switch (this.currentStep()) {
      case 1:
        currentForm = this.schoolInfoForm;
        break;
      case 2:
        currentForm = this.adminAccountForm;
        break;
      case 3:
        currentForm = this.planSelectionForm;
        break;
      default:
        return;
    }

    if (currentForm.valid) {
      if (this.currentStep() < this.totalSteps) {
        this.currentStep.set(this.currentStep() + 1);
      } else {
        this.submitRegistration();
      }
    } else {
      Object.keys(currentForm.controls).forEach(key => {
        const control = currentForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  submitRegistration(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const registrationData = {
      ...this.schoolInfoForm.value,
      ...this.adminAccountForm.value
    };

    this.http.post(`${environment.apiUrl}/api/auth/register/`, registrationData)
      .subscribe({
        next: (response: any) => {
          this.successMessage.set(response.message || 'Registration successful! Redirecting to login...');
          this.isLoading.set(false);
          
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error) => {
          console.error('Registration error:', error);
          let message = 'Registration failed. Please try again.';
          
          if (error.error) {
            // Handle field-specific errors
            if (typeof error.error === 'object' && !error.error.detail && !error.error.message) {
              const errors = Object.entries(error.error)
                .map(([field, msgs]: [string, any]) => {
                  const errorMsg = Array.isArray(msgs) ? msgs.join(', ') : msgs;
                  return `${field}: ${errorMsg}`;
                })
                .join('; ');
              message = errors || message;
            } else {
              message = error.error?.detail || error.error?.message || message;
            }
          }
          
          this.errorMessage.set(message);
          this.isLoading.set(false);
        }
      });
  }

  get schoolName() {
    return this.schoolInfoForm.get('school_name');
  }

  get institutionType() {
    return this.schoolInfoForm.get('institution_type');
  }

  get country() {
    return this.schoolInfoForm.get('country');
  }

  get studentEnrollment() {
    return this.schoolInfoForm.get('student_enrollment');
  }

  get firstName() {
    return this.adminAccountForm.get('first_name');
  }

  get lastName() {
    return this.adminAccountForm.get('last_name');
  }

  get email() {
    return this.adminAccountForm.get('email');
  }

  get phone() {
    return this.adminAccountForm.get('phone');
  }

  get password() {
    return this.adminAccountForm.get('password');
  }

  get passwordConfirm() {
    return this.adminAccountForm.get('password_confirm');
  }
}
