import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';

interface Message {
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-component.html',
  styleUrl: './chat-component.scss'
})
export class ChatComponent {
  private chatService = inject(ChatService);

  isOpen = signal(false);
  messages = signal<Message[]>([{ text: 'שלום! איך אפשר לעזור לך?', isUser: false }]);
  input = '';
  isLoading = signal(false);

  toggle() {
    this.isOpen.update(v => !v);
  }

  send() {
    const msg = this.input.trim();
    if (!msg || this.isLoading()) return;

    this.messages.update(m => [...m, { text: msg, isUser: true }]);
    this.input = '';
    this.isLoading.set(true);

    this.chatService.sendMessage(msg).subscribe({
      next: (res) => {
        this.messages.update(m => [...m, { text: res.reply, isUser: false }]);
        this.isLoading.set(false);
      },
      error: () => {
        this.messages.update(m => [...m, { text: 'שגיאה, נסי שוב.', isUser: false }]);
        this.isLoading.set(false);
      }
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') this.send();
  }
}
