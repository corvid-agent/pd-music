import { Injectable, signal } from '@angular/core';

export interface FavoriteItem { id: string; type: 'artist' | 'release' | 'archive'; title: string; subtitle: string; }

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly storageKey = 'pd-music-favorites';
  readonly items = signal<FavoriteItem[]>(this.load());

  private load(): FavoriteItem[] {
    try { return JSON.parse(localStorage.getItem(this.storageKey) || '[]'); }
    catch { return []; }
  }

  private save(): void { localStorage.setItem(this.storageKey, JSON.stringify(this.items())); }

  add(item: FavoriteItem): void { if (!this.isFavorite(item.id)) { this.items.update(f => [...f, item]); this.save(); } }
  remove(id: string): void { this.items.update(f => f.filter(i => i.id !== id)); this.save(); }
  isFavorite(id: string): boolean { return this.items().some(i => i.id === id); }
  toggle(item: FavoriteItem): void { this.isFavorite(item.id) ? this.remove(item.id) : this.add(item); }
}
