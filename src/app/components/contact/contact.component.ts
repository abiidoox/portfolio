import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit, OnDestroy {
  contactForm: UntypedFormGroup;
  submitted = false;
  success = false;
  error = false;
  isLoading = false;

  readonly socials = [
    { label: 'GitHub', url: 'https://github.com/abiidoox', icon: 'fab fa-github' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/abderrazzaq-el-abdouni-28004019a', icon: 'fab fa-linkedin-in' }
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private languageService: LanguageService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  private langSub?: Subscription;

  ngOnInit(): void {
    this.langSub = this.languageService.currentLanguage$.subscribe(() => {
      // Reset form messages when language changes
      this.success = false;
      this.error = false;
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  isInvalid(control: string): boolean {
    const c = this.contactForm.get(control);
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  /**
   * Builds a valid tel: URI. The displayed number is grouped for readability
   * ("+212 653 539 113") but a URI may not contain those spaces, so everything
   * except the leading + and the digits is dropped.
   */
  telHref(display: string): string {
    return 'tel:' + (display || '').replace(/[^\d+]/g, '');
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
    } else {
      // Trigger error visibility for invalid fields
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }
}