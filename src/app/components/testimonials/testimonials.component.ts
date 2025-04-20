import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { trigger, transition, style, animate } from '@angular/animations';

interface Testimonial {
  name: string;
  position: string;
  company: string;
  image: string;
  text: string;
  rating: number;
}

@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.5s ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ])
  ]
})
export class TestimonialsComponent implements OnInit, OnDestroy {
  testimonials: Testimonial[] = [];
  currentIndex = 0;
  autoPlayInterval: any;
  isAnimating = false;

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
    this.loadTestimonials();
    this.startCarousel();
  }

  ngOnDestroy(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  loadTestimonials(): void {
    const testimonialKeys = ['JOHN', 'JANE', 'MIKE'];
    this.testimonials = testimonialKeys.map(key => ({
      name: this.translate.instant(`TESTIMONIALS.ITEMS.${key}.NAME`),
      position: this.translate.instant(`TESTIMONIALS.ITEMS.${key}.POSITION`),
      company: this.translate.instant(`TESTIMONIALS.ITEMS.${key}.COMPANY`),
      image: `assets/images/testimonials/${key.toLowerCase()}.jpg`,
      text: this.translate.instant(`TESTIMONIALS.ITEMS.${key}.TEXT`),
      rating: this.translate.instant(`TESTIMONIALS.ITEMS.${key}.RATING`)
    }));
  }

  startCarousel(): void {
    this.autoPlayInterval = setInterval(() => {
      if (!this.isAnimating) {
        this.nextTestimonial();
      }
    }, 5000);
  }

  nextTestimonial(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  previousTestimonial(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  goToTestimonial(index: number): void {
    if (this.isAnimating || this.currentIndex === index) return;
    this.isAnimating = true;
    this.currentIndex = index;
    setTimeout(() => {
      this.isAnimating = false;
    }, 500);
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
} 