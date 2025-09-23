import { Component } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { PageWrapperComponent } from '../../components/page-wrapper/page-wrapper.component';
import { ToastrService } from 'ngx-toastr';
import { ContactService } from '../../services/contact.service';
import { CreateContactRequest } from '../../shared/types/api.types';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contact-page',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule, PageWrapperComponent],
  templateUrl: './contact-page.component.html'
})
export class ContactPageComponent {
  form: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private contactService: ContactService
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
      next: (response) => {
        // Show SweetAlert2 success message
        Swal.fire({
          title: 'Message Sent Successfully!',
          text: 'Thank you for contacting us. We will get back to you shortly.',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#10b981',
          background: '#1f2937',
          color: '#f9fafb',
          customClass: {
            popup: 'border border-gray-600'
          }
        });
        this.form.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error sending contact message:', error);
        // Show SweetAlert2 error message
        Swal.fire({
          title: 'Error!',
          text: 'Failed to send message. Please try again later.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444',
          background: '#1f2937',
          color: '#f9fafb',
          customClass: {
            popup: 'border border-gray-600'
          }
        });
        this.isSubmitting = false;
      }
    });
  }
}
