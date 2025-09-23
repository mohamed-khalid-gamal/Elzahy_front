import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  // Basic alerts
  fire(title: string, text = '', icon: SweetAlertIcon = 'info') {
    return Swal.fire({ title, text, icon, confirmButtonText: 'OK' });
  }

  success(title: string, text = '') { return this.fire(title, text, 'success'); }
  error(title: string, text = '') { return this.fire(title, text, 'error'); }
  info(title: string, text = '') { return this.fire(title, text, 'info'); }
  warning(title: string, text = '') { return this.fire(title, text, 'warning'); }

  // Toasts
  toastSuccess(message: string) { return this.toast.fire({ icon: 'success', title: message }); }
  toastError(message: string) { return this.toast.fire({ icon: 'error', title: message }); }
  toastInfo(message: string) { return this.toast.fire({ icon: 'info', title: message }); }
  toastWarning(message: string) { return this.toast.fire({ icon: 'warning', title: message }); }

  // Confirmations
  async confirm(options: {
    title?: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    icon?: SweetAlertIcon;
  } = {}): Promise<boolean> {
    const result = await Swal.fire({
      title: options.title ?? 'Are you sure?',
      text: options.text ?? "You won't be able to revert this!",
      icon: options.icon ?? 'warning',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText ?? 'Yes',
      cancelButtonText: options.cancelButtonText ?? 'Cancel'
    });
    return result.isConfirmed === true;
  }

  confirmDelete(itemLabel = 'this item') {
    return this.confirm({
      title: 'Delete confirmation',
      text: `Are you sure you want to delete ${itemLabel}?`,
      confirmButtonText: 'Yes, delete it',
      icon: 'warning'
    });
  }
}
