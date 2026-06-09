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

  onSubmit(event?: Event) {
    // If the native event is provided, prevent default since we'll submit via fetch
    if (event) {
      event.preventDefault();
    }

    this.submitted = true;
    this.success = false;
    this.error = false;

    if (this.contactForm.valid) {
      this.isLoading = true;

      // Prepare data for Netlify Forms: URL-encoded body including form-name
      const formValue = this.contactForm.value;
      const data: { [k: string]: any } = { 'form-name': 'contact', ...formValue };
      const body = Object.keys(data)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
        .join('&');

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      })
        .then(() => {
          this.success = true;
          this.contactForm.reset();
          this.submitted = false;
        })
        .catch(() => {
          this.error = true;
        })
        .finally(() => {
          this.isLoading = false;
        });
    }
  }

  // Helper method to check if a field has errors
  hasError(controlName: string, errorType: string): boolean {
    const control = this.contactForm.get(controlName);
    return control ? control.hasError(errorType) && (control.touched || this.submitted) : false;
  }
}