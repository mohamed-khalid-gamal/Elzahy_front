import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { ContactMessage, UpdateContactMessageRequestDto } from '../../../shared/types/api.types';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent],
  template: `
    <div class="pt-24 pb-8 min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-8">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold text-white">Message Management</h1>
              <p class="text-gray-400 mt-2">View and manage contact messages</p>
            </div>
            <div class="flex space-x-4">
              <button
                (click)="filterMessages('unread')"
                [ngClass]="filter === 'unread' ? 'bg-blue-600' : 'bg-gray-600'"
                class="px-4 py-2 rounded-lg text-white font-semibold transition-all"
              >
                Unread ({{ unreadCount }})
              </button>
              <button
                (click)="filterMessages('all')"
                [ngClass]="filter === 'all' ? 'bg-blue-600' : 'bg-gray-600'"
                class="px-4 py-2 rounded-lg text-white font-semibold transition-all"
              >
                All
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="isLoadingMessages" class="flex justify-center py-12">
          <app-loading size="large" message="Loading messages..."></app-loading>
        </div>

        <!-- Messages List -->
        <div *ngIf="!isLoadingMessages" class="space-y-4">
          <div
            *ngFor="let message of filteredMessages"
            class="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all cursor-pointer"
            (click)="selectMessage(message)"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="flex items-center space-x-3">
                <div
                  [ngClass]="message.isRead ? 'bg-gray-500' : 'bg-blue-500'"
                  class="w-3 h-3 rounded-full"
                ></div>
                <div>
                  <h3 class="text-white font-semibold">{{ message.fullName }}</h3>
                  <p class="text-gray-400 text-sm">{{ message.emailAddress }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-gray-400 text-sm">{{ message.createdAt | date:'medium' }}</p>
                <div class="flex space-x-2 mt-1">
                  <span
                    [ngClass]="message.isRead ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    {{ message.isRead ? 'Read' : 'Unread' }}
                  </span>
                  <span
                    [ngClass]="message.isReplied ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'"
                    class="px-2 py-1 rounded-full text-xs font-semibold"
                  >
                    {{ message.isReplied ? 'Replied' : 'Pending' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="mb-3">
              <h4 class="text-white font-medium mb-2">{{ message.subject }}</h4>
              <p class="text-gray-300 text-sm line-clamp-2">{{ message.message }}</p>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-400">
              <div class="flex space-x-4">
                <span *ngIf="message.phoneNumber">📞 {{ message.phoneNumber }}</span>
                <span *ngIf="message.company">🏢 {{ message.company }}</span>
              </div>
              <div class="flex space-x-2">
                <button
                  *ngIf="!message.isRead"
                  (click)="markAsRead(message.id, $event)"
                  class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-all"
                >
                  Mark Read
                </button>
                <button
                  *ngIf="!message.isReplied"
                  (click)="markAsReplied(message.id, $event)"
                  class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-all"
                >
                  Mark Replied
                </button>
                <button
                  (click)="deleteMessage(message.id, $event)"
                  class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="filteredMessages.length === 0" class="text-center py-12">
            <div class="text-gray-400 text-lg">
              {{ filter === 'unread' ? 'No unread messages' : 'No messages found' }}
            </div>
          </div>
        </div>

        <!-- Message Detail Modal -->
        <div *ngIf="selectedMessage" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-start mb-6">
              <div>
                <h3 class="text-xl font-bold text-white">{{ selectedMessage.subject }}</h3>
                <p class="text-gray-400">From: {{ selectedMessage.fullName }} ({{ selectedMessage.emailAddress }})</p>
                <p class="text-gray-400 text-sm">{{ selectedMessage.createdAt | date:'full' }}</p>
              </div>
              <button (click)="closeModal()" class="text-gray-400 hover:text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-6">
              <!-- Contact Details -->
              <div class="bg-gray-700/50 rounded-lg p-4">
                <h4 class="text-white font-semibold mb-3">Contact Details</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-400">Name:</span>
                    <span class="text-white ml-2">{{ selectedMessage.fullName }}</span>
                  </div>
                  <div>
                    <span class="text-gray-400">Email:</span>
                    <span class="text-white ml-2">{{ selectedMessage.emailAddress }}</span>
                  </div>
                  <div *ngIf="selectedMessage.phoneNumber">
                    <span class="text-gray-400">Phone:</span>
                    <span class="text-white ml-2">{{ selectedMessage.phoneNumber }}</span>
                  </div>
                  <div *ngIf="selectedMessage.company">
                    <span class="text-gray-400">Company:</span>
                    <span class="text-white ml-2">{{ selectedMessage.company }}</span>
                  </div>
                </div>
              </div>

              <!-- Message Content -->
              <div>
                <h4 class="text-white font-semibold mb-3">Message</h4>
                <div class="bg-gray-700/50 rounded-lg p-4">
                  <p class="text-gray-300 whitespace-pre-wrap">{{ selectedMessage.message }}</p>
                </div>
              </div>

              <!-- Admin Notes -->
              <div>
                <h4 class="text-white font-semibold mb-3">Admin Notes</h4>
                <form [formGroup]="notesForm" (ngSubmit)="updateNotes()">
                  <textarea
                    formControlName="adminNotes"
                    rows="4"
                    class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add internal notes about this message..."
                  ></textarea>
                  <div class="flex justify-end mt-3">
                    <button
                      type="submit"
                      [disabled]="loading"
                      class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-semibold transition-all"
                    >
                      {{ loading ? 'Saving...' : 'Save Notes' }}
                    </button>
                  </div>
                </form>
              </div>

              <!-- Status & Actions -->
              <div class="flex justify-between items-center pt-4 border-t border-gray-600">
                <div class="flex space-x-4">
                  <span [ngClass]="selectedMessage.isRead ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
                        class="px-3 py-1 rounded-full text-sm font-semibold">
                    {{ selectedMessage.isRead ? 'Read' : 'Unread' }}
                  </span>
                  <span [ngClass]="selectedMessage.isReplied ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'"
                        class="px-3 py-1 rounded-full text-sm font-semibold">
                    {{ selectedMessage.isReplied ? 'Replied' : 'Pending' }}
                  </span>
                </div>
                <div class="flex space-x-3">
                  <button
                    *ngIf="!selectedMessage.isRead"
                    (click)="markAsRead(selectedMessage.id)"
                    class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Mark as Read
                  </button>
                  <button
                    *ngIf="!selectedMessage.isReplied"
                    (click)="markAsReplied(selectedMessage.id)"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Mark as Replied
                  </button>
                  <a
                    [href]="'mailto:' + selectedMessage.emailAddress + '?subject=Re: ' + selectedMessage.subject"
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                  >
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminMessagesComponent implements OnInit {
  messages: ContactMessage[] = [];
  filteredMessages: ContactMessage[] = [];
  selectedMessage: ContactMessage | null = null;
  filter: 'all' | 'unread' = 'all';
  loading = false;
  isLoadingMessages = true;
  unreadCount = 0;

  notesForm: FormGroup;

  constructor(
    private contactService: ContactService,
    private fb: FormBuilder,
    private notifications: NotificationService
  ) {
    this.notesForm = this.fb.group({
      adminNotes: ['']
    });
  }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.isLoadingMessages = true;
    this.contactService.getMessages().subscribe({
      next: (response: any) => {
        this.messages = response.data;
        this.updateFilteredMessages();
        this.updateUnreadCount();
        this.isLoadingMessages = false;
      },
      error: (error: any) => {
        console.error('Error loading messages:', error);
        this.isLoadingMessages = false;
      }
    });
  }

  filterMessages(filter: 'all' | 'unread') {
    this.filter = filter;
    this.updateFilteredMessages();
  }

  updateFilteredMessages() {
    if (this.filter === 'unread') {
      this.filteredMessages = this.messages.filter(m => !m.isRead);
    } else {
      this.filteredMessages = this.messages;
    }
  }

  updateUnreadCount() {
    this.unreadCount = this.messages.filter(m => !m.isRead).length;
  }

  selectMessage(message: ContactMessage) {
    this.selectedMessage = message;
    this.notesForm.patchValue({
      adminNotes: message.adminNotes || ''
    });

    // Automatically mark as read when opened
    if (!message.isRead) {
      this.markAsRead(message.id);
    }
  }

  closeModal() {
    this.selectedMessage = null;
    this.notesForm.reset();
  }

  markAsRead(id: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.contactService.markAsRead(id).subscribe({
      next: () => {
        const message = this.messages.find(m => m.id === id);
        if (message) {
          message.isRead = true;
          message.readAt = new Date().toISOString();
        }
        if (this.selectedMessage?.id === id) {
          this.selectedMessage.isRead = true;
          this.selectedMessage.readAt = new Date().toISOString();
        }
        this.updateFilteredMessages();
        this.updateUnreadCount();
        this.notifications.toastSuccess('Marked as read');
      },
      error: (error) => {
        console.error('Error marking message as read:', error);
        this.notifications.toastError(error?.message || 'Failed to mark as read');
      }
    });
  }

  markAsReplied(id: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.contactService.markAsReplied(id).subscribe({
      next: () => {
        const message = this.messages.find(m => m.id === id);
        if (message) {
          message.isReplied = true;
          message.repliedAt = new Date().toISOString();
        }
        if (this.selectedMessage?.id === id) {
          this.selectedMessage.isReplied = true;
          this.selectedMessage.repliedAt = new Date().toISOString();
        }
        this.notifications.toastSuccess('Marked as replied');
      },
      error: (error) => {
        console.error('Error marking message as replied:', error);
        this.notifications.toastError(error?.message || 'Failed to mark as replied');
      }
    });
  }

  async deleteMessage(id: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    const confirmed = await this.notifications.confirmDelete('this message');
    if (!confirmed) return;

    this.contactService.deleteMessage(id).subscribe({
      next: () => {
        this.messages = this.messages.filter(m => m.id !== id);
        this.updateFilteredMessages();
        this.updateUnreadCount();
        if (this.selectedMessage?.id === id) {
          this.closeModal();
        }
        this.notifications.toastSuccess('Message deleted');
      },
      error: (error: any) => {
        console.error('Error deleting message:', error);
        this.notifications.toastError(error?.message || 'Failed to delete message');
      }
    });
  }

  updateNotes() {
    if (!this.selectedMessage) return;

    this.loading = true;
    const updateData: UpdateContactMessageRequestDto = {
      isRead: this.selectedMessage.isRead,
      isReplied: this.selectedMessage.isReplied,
      adminNotes: this.notesForm.value.adminNotes
    };

    this.contactService.updateMessage(this.selectedMessage.id, updateData).subscribe({
      next: (updatedMessage: any) => {
        // Update the message in the list
        const index = this.messages.findIndex(m => m.id === this.selectedMessage!.id);
        if (index !== -1) {
          this.messages[index] = updatedMessage;
        }
        this.selectedMessage = updatedMessage;
        this.loading = false;
        this.notifications.toastSuccess('Notes updated');
      },
      error: (error: any) => {
        console.error('Error updating message notes:', error);
        this.loading = false;
        this.notifications.toastError(error?.message || 'Failed to update notes');
      }
    });
  }
}
