import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { trigger, style, transition, animate, stagger, query } from '@angular/animations';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about-section.component.html',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('800ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFeatures', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(200, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class AboutSectionComponent {
  @Input() isPage: boolean = false;

  features = [
    {
      icon: 'building-2',
      title: "Infrastructure Excellence",
      description: "Specializing in large-scale infrastructure projects with cutting-edge engineering solutions"
    },
    {
      icon: 'users',
      title: "Expert Team",
      description: "Highly skilled professionals with decades of combined experience in construction and engineering"
    },
    {
      icon: 'wrench',
      title: "Advanced Equipment",
      description: "State-of-the-art machinery and tools ensuring efficient and precise project execution"
    },
    {
      icon: 'shield',
      title: "Safety First",
      description: "Unwavering commitment to safety standards and environmental responsibility in all operations"
    }
  ];

  projectImages = [
    "https://horizons-cdn.hostinger.com/1ae29a5c-5737-4779-81b2-240c63e964f7/d56dd49b0a6d4b48923ae6764f67295f.jpg",
    "https://horizons-cdn.hostinger.com/1ae29a5c-5737-4779-81b2-240c63e964f7/875d85bb3cdd1ed88430795e30be75a2.jpg",
    "https://horizons-cdn.hostinger.com/1ae29a5c-5737-4779-81b2-240c63e964f7/edecd1139ba6615767b13c2d1f568f25.jpg",
    "https://horizons-cdn.hostinger.com/1ae29a5c-5737-4779-81b2-240c63e964f7/983107997182115fdea06911e858204d.jpg"
  ];
}
