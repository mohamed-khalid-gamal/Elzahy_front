import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { PageWrapperComponent } from '../../components/page-wrapper/page-wrapper.component';
import { ToastrService } from 'ngx-toastr';
import { ContactService } from '../../services/contact.service';
import { CreateContactRequest } from '../../shared/types/api.types';
import { SeoService } from '../../services/seo.service';
import Swal from 'sweetalert2';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule, PageWrapperComponent, TranslateModule],
  templateUrl: './contact-page.component.html'
})
export class ContactPageComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  private seoService = inject(SeoService);

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private contactService: ContactService,
    private translate: TranslateService
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
      emailAddress: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      subject: ['', [Validators.required, Validators.maxLength(200)]],
      message: ['', Validators.required],
      phoneNumber: [''],
      company: ['']
    });
  }

  ngOnInit() {
    this.seoService.updateSEO({
      url: 'https://elzahygroup.com/contact'
    });
  }

  onSubmit() {
    if (this.form.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = this.form.value;

    const contactRequest: CreateContactRequest = {
      fullName: formValue.fullName,
      emailAddress: formValue.emailAddress,
      subject: formValue.subject,
      message: formValue.message,
      phoneNumber: formValue.phoneNumber || undefined,
      company: formValue.company || undefined
    };

    this.contactService.submitContact(contactRequest).subscribe({
      next: () => {
        Swal.fire({
          title: this.translate.instant('contact.form.success'),
          text: this.translate.instant('contact.form.successDescription'),
          icon: 'success',
          confirmButtonText: this.translate.instant('common.ok'),
          confirmButtonColor: '#10b981',
          background: '#1f2937',
          color: '#f9fafb',
          customClass: { popup: 'border border-gray-600' }
        });
        this.form.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error sending contact message:', error);
        Swal.fire({
          title: this.translate.instant('contact.form.error'),
          text: this.translate.instant('contact.form.errorDescription'),
          icon: 'error',
          confirmButtonText: this.translate.instant('common.ok'),
          confirmButtonColor: '#ef4444',
          background: '#1f2937',
          color: '#f9fafb',
          customClass: { popup: 'border border-gray-600' }
        });
        this.isSubmitting = false;
      }
    });
  }
}
