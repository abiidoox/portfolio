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

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private languageService: LanguageService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Subscribe to language changes to update form placeholders if needed
    this.languageService.currentLanguage$.subscribe(() => {
      // You could update dynamic content here if needed
    });
  }

  onSubmit() {
    this.submitted = true;

    if (this.contactForm.valid) {
      // Here you would normally send the form data to your backend
      console.log(this.contactForm.value);
      
      // Simulate successful submission
      this.success = true;
      this.error = false;
      this.contactForm.reset();
      this.submitted = false;
    }
  }
}