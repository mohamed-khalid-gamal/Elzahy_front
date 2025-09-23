import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-section.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(50px)' }),
        animate('1000ms 200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInUpDelayed', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('800ms 400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInUpDelayed2', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('800ms 600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInUpDelayed3', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('800ms 800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeInFinal', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1000ms 1500ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('parallaxBg', [
      state('moved', style({
        transform: 'translateY({{yOffset}}px)'
      }), { params: { yOffset: 0 } })
    ]),
    trigger('parallaxContent', [
      state('moved', style({
        transform: 'translateY({{yOffset}}px)',
        opacity: '{{opacity}}'
      }), { params: { yOffset: 0, opacity: 1 } })
    ])
  ]
})
export class HeroSectionComponent implements OnInit {
  scrollY = 0;
  bgYOffset = 0;
  contentYOffset = 0;
  contentOpacity = 1;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.updateParallax();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: any) {
    this.scrollY = window.pageYOffset;
    this.updateParallax();
  }

  private updateParallax() {
    this.bgYOffset = -(this.scrollY * 0.33); // Similar to y2 transform in React
    this.contentYOffset = -(this.scrollY * 0.17); // Similar to y1 transform in React
    this.contentOpacity = Math.max(0.3, 1 - (this.scrollY / 300 * 0.7)); // Similar to opacity transform in React
  }

  scrollToProjects() {
    const el = document.getElementById('projects');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
