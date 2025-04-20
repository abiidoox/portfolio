import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  submitted = false;
  success = false;
  error = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.languageService.currentLanguage$.subscribe(() => {
      // Reset form messages when language changes
      this.success = false;
      this.error = false;
    });
  }

  onSubmit() {
    this.submitted = true;
    this.success = false;
    this.error = false;

    if (this.contactForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        try {
          // Here you would normally send the form data to your backend
          console.log(this.contactForm.value);
          
          this.success = true;
          this.contactForm.reset();
          this.submitted = false;
        } catch (err) {
          this.error = true;
        } finally {
          this.isLoading = false;
        }
      }, 1500);
    }
  }

  // Helper method to check if a field has errors
  hasError(controlName: string, errorType: string): boolean {
    const control = this.contactForm.get(controlName);
    return control ? control.hasError(errorType) && (control.touched || this.submitted) : false;
  }
}