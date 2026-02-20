import { Injectable, signal, computed } from '@angular/core';

export interface TrackInfo { title: string; artist: string; url: string; }

@Injectable({ providedIn: 'root' })
export class PlayerService {
  readonly currentTrack = signal<TrackInfo | null>(null);
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly progress = computed(() => this.duration() > 0 ? this.currentTime() / this.duration() : 0);

  readonly queue = signal<TrackInfo[]>([]);
  readonly queueIndex = signal(-1);
  readonly shuffleEnabled = signal(false);
  readonly hasNext = computed(() => this.queueIndex() < this.queue().length - 1);
  readonly hasPrev = computed(() => this.queueIndex() > 0);

  private audio = new Audio();
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  getAnalyser(): AnalyserNode {
    if (!this.analyser) {
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx?.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.analyser;
  }

  constructor() {
    this.audio.addEventListener('timeupdate', () => this.currentTime.set(this.audio.currentTime));
    this.audio.addEventListener('durationchange', () => this.duration.set(this.audio.duration));
    this.audio.addEventListener('ended', () => {
      if (this.hasNext()) {
        this.next();
      } else {
        this.isPlaying.set(false);
      }
    });
  }

  play(url: string, track: TrackInfo): void {
    this.audio.src = url;
    this.currentTrack.set(track);
    this.audio.play();
    this.isPlaying.set(true);
  }

  playQueue(tracks: TrackInfo[], startIndex: number = 0): void {
    if (tracks.length === 0) return;
    const ordered = this.shuffleEnabled() ? this.shuffleArray(tracks, startIndex) : [...tracks];
    this.queue.set(ordered);
    const idx = this.shuffleEnabled() ? 0 : startIndex;
    this.queueIndex.set(idx);
    const track = ordered[idx];
    this.play(track.url, track);
  }

  next(): void {
    const q = this.queue();
    const idx = this.queueIndex();
    if (idx < q.length - 1) {
      const nextIdx = idx + 1;
      this.queueIndex.set(nextIdx);
      const track = q[nextIdx];
      this.play(track.url, track);
    }
  }

  prev(): void {
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    const idx = this.queueIndex();
    if (idx > 0) {
      const prevIdx = idx - 1;
      this.queueIndex.set(prevIdx);
      const track = this.queue()[prevIdx];
      this.play(track.url, track);
    }
  }

  toggleShuffle(): void {
    this.shuffleEnabled.update(v => !v);
  }

  pause(): void { this.audio.pause(); this.isPlaying.set(false); }
  resume(): void { this.audio.play(); this.isPlaying.set(true); }
  seek(time: number): void { this.audio.currentTime = time; }
  toggle(): void { this.isPlaying() ? this.pause() : this.resume(); }

  private shuffleArray(arr: TrackInfo[], keepFirst: number): TrackInfo[] {
    const result = [...arr];
    const first = result.splice(keepFirst, 1)[0];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return [first, ...result];
  }
}
