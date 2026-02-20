import { Component, inject, ViewChild, ElementRef, effect, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PlayerService } from './core/services/player.service';
import { SecondsPipe } from './shared/seconds-pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SecondsPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  readonly player = inject(PlayerService);
  @ViewChild('visualizer') canvasRef!: ElementRef<HTMLCanvasElement>;

  private animId = 0;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;

  constructor() {
    effect(() => {
      const playing = this.player.isPlaying();
      const track = this.player.currentTrack();
      if (playing && track) {
        this.startVisualizer();
      } else {
        this.stopVisualizer();
      }
    });
  }

  private startVisualizer(): void {
    if (this.animId) return;
    if (!this.analyser) {
      this.analyser = this.player.getAnalyser();
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
    }
    const draw = () => {
      this.animId = requestAnimationFrame(draw);
      const canvas = this.canvasRef?.nativeElement;
      if (!canvas || !this.analyser || !this.freqData) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      this.analyser.getByteFrequencyData(this.freqData);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const bars = this.freqData.length;
      const barW = w / bars;
      for (let i = 0; i < bars; i++) {
        const val = this.freqData[i] / 255;
        const barH = val * h;
        ctx.fillStyle = `rgba(108, 140, 255, ${0.4 + val * 0.6})`;
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }
    };
    draw();
  }

  private stopVisualizer(): void {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = 0;
    }
    const canvas = this.canvasRef?.nativeElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  ngOnDestroy(): void {
    this.stopVisualizer();
  }

  onSeek(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const time = ratio * this.player.duration();
    this.player.seek(time);
  }
}
