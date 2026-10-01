import { Component, ElementRef, OnInit, ViewChild, NgZone, OnDestroy } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

@Component({
  selector: 'app-particles-background',
  template: '<canvas #canvas aria-hidden="true"></canvas>',
  styles: [`
    :host { display: block; }
    canvas { width: 100%; height: 100%; display: block; }
  `]
})
export class ParticlesBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rafId = 0;
  private mouse = { x: -9999, y: -9999 };
  private resizeHandler = () => this.resize();
  private paused = false;
  private reducedMotion = false;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.addEventListener('mousemove', this.onMouse, { passive: true });

    // Cap the count: the connection pass is O(n^2), so 80 particles means
    // ~3160 distance checks per frame. 44 keeps it under 1000 on small screens.
    const count = Math.min(44, Math.floor(window.innerWidth / 26));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35
      });
    }

    // Stop burning frames when the tab is hidden.
    document.addEventListener('visibilitychange', this.onVisibility);

    if (this.reducedMotion) {
      this.draw();
      return;
    }
    this.zone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('mousemove', this.onMouse);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private onVisibility = () => {
    this.paused = document.hidden;
  };

  private onMouse = (e: MouseEvent) => {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  };

  private resize() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  /** One static frame, used for the reduced-motion case. */
  private draw(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(148,163,184,0.45)';
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private animate() {
    const draw = () => {
      this.rafId = requestAnimationFrame(draw);
      if (this.paused) return;

      const canvas = this.canvasRef.nativeElement;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const linkDist = 128;
      const repelDist = 108;

      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Repel from mouse
        const dx = this.mouse.x - p.x;
        const dy = this.mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < repelDist && d > 0) {
          p.x -= (dx / d) * 1.5;
          p.y -= (dy / d) * 1.5;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(148,163,184,0.5)';
        ctx.fill();
      }

      // Connect nearby particles
      const n = this.particles.length;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const a = this.particles[i];
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const d = Math.sqrt(d2);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255,94,58,${(0.16 * (1 - d / linkDist)).toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };
    draw();
  }
}
