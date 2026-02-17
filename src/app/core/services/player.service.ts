import { Injectable, signal, computed } from '@angular/core';

export interface TrackInfo { title: string; artist: string; url: string; }

@Injectable({ providedIn: 'root' })
export class PlayerService {
  readonly currentTrack = signal<TrackInfo | null>(null);
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly progress = computed(() => this.duration() > 0 ? this.currentTime() / this.duration() : 0);
  private audio = new Audio();

  constructor() {
    this.audio.addEventListener('timeupdate', () => this.currentTime.set(this.audio.currentTime));
    this.audio.addEventListener('durationchange', () => this.duration.set(this.audio.duration));
    this.audio.addEventListener('ended', () => this.isPlaying.set(false));
  }

  play(url: string, track: TrackInfo): void {
    this.audio.src = url;
    this.currentTrack.set(track);
    this.audio.play();
    this.isPlaying.set(true);
  }

  pause(): void { this.audio.pause(); this.isPlaying.set(false); }
  resume(): void { this.audio.play(); this.isPlaying.set(true); }
  seek(time: number): void { this.audio.currentTime = time; }
  toggle(): void { this.isPlaying() ? this.pause() : this.resume(); }
}
