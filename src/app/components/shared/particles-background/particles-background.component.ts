import { Component, ElementRef, OnInit, ViewChild, NgZone, OnDestroy } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

@Component({
  selector: 'app-particles-background',
  template: '<canvas #canvas></canvas>',
  styles: [`
    :host { position: fixed; inset: 0; z-index: -1; pointer-events: none; }
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

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('mousemove', this.onMouse);

    const count = Math.min(80, Math.floor(window.innerWidth / 16));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4
      });
    }
    // Run outside Angular zone for performance (no change detection per frame)
    this.zone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('mousemove', this.onMouse);
  }

  private onMouse = (e: MouseEvent) => {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  };

  private resize() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  private animate() {
    const draw = () => {
      const canvas = this.canvasRef.nativeElement;
      const ctx = this.ctx;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const linkDist = 130;
      const repelDist = 110;

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
          p.x -= (dx / d) * 1.6;
          p.y -= (dy / d) * 1.6;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(143,147,163,0.55)';
        ctx.fill();
      }

      // Connect nearby particles
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i + 1; j < this.particles.length; j++) {
          const a = this.particles[i];
          const b = this.particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(255,94,58,${0.14 * (1 - d / linkDist)})`;
            ctx.stroke();
          }
        }
      }

      this.rafId = requestAnimationFrame(draw);
    };
    draw();
  }
}
