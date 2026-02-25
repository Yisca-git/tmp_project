import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, DialogModule],
  templateUrl: './footer-component.html',
  styleUrls: ['./footer-component.scss']
})
export class FooterComponent {
  currentYear = signal(new Date().getFullYear());
  showTermsDialog = false;

  contactInfo = {
    address: 'רחוב האומן 10, ירושלים',
    phone: '02-1234567',
    hours: [
      { days: 'א׳ - ה׳', time: '09:00 - 20:00' },
      { days: 'יום ו׳', time: '09:00 - 13:00' }
    ]
  };

  footerSections = [
    {
      title: 'קולקציה',
      links: [
        { label: 'קולקציית ילדות', url: '/winter-collection' },
        { label: 'קולקציית נשים', url: '/evening-wear' },
        { label: 'אקססוריז', url: '/accessories' },
      ]
    },
    {
      title: 'מידע נוסף',
      links: [
        { label: 'אודותינו', url: '/about' },
        { label: 'תקנון האתר', url: '/terms', action: 'showTerms' }
      ]
    }
  ];

  socials = [
    { icon: 'pi pi-facebook', link: '#' },
    { icon: 'pi pi-instagram', link: '#' },
    { icon: 'pi pi-whatsapp', link: '#' }
  ];

  onLinkClick(link: any, event: Event) {
    if (link.action === 'showTerms') {
      event.preventDefault();
      this.showTermsDialog = true;
    }
  }
}