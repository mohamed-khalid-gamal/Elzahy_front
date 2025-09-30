import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { trigger, style, transition, animate, stagger, query } from '@angular/animations';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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
      titleKey: 'about.featuresCards.infrastructure.title',
      descriptionKey: 'about.featuresCards.infrastructure.description'
    },
    {
      icon: 'users',
      titleKey: 'about.featuresCards.team.title',
      descriptionKey: 'about.featuresCards.team.description'
    },
    {
      icon: 'wrench',
      titleKey: 'about.featuresCards.equipment.title',
      descriptionKey: 'about.featuresCards.equipment.description'
    },
    {
      icon: 'shield',
      titleKey: 'about.featuresCards.safety.title',
      descriptionKey: 'about.featuresCards.safety.description'
    }
  ];

  projectImages = [
    "https://horizons-cdn.hostinger.com/1ae29a5c-5737-4779-81b2-240c63e964f7/d56dd49b0a6d4b48923ae6764f67295f.jpg",
    "https://horizons-cdn.hostinger.com/1ae29a5c-5737-4779-81b2-240c63e964f7/875d85bb3cdd1ed88430795e30be75a2.jpg",
    "https://horizons-cdn.hostinger.com/1ae29a5c-5737-4779-81b2-240c63e964f7/edecd1139ba6615767b13c2d1f568f25.jpg",
    "https://horizons-cdn.hostinger.com/1ae29a5c-5737-4779-81b2-240c63e964f7/983107997182115fdea06911e858204d.jpg"
  ];
}
