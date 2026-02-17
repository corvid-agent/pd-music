import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FavoritesService, FavoriteItem } from '../../core/services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  template: `
    <div class="favorites-page">
      <h2>Favorites</h2>

      @if (favs.items().length === 0) {
        <p class="empty">No favorites yet. Browse artists, releases, or archive items and add them here.</p>
      }

      <div class="fav-list">
        @for (item of favs.items(); track item.id) {
          <div class="fav-item" (click)="navigate(item)">
            <div class="fav-info">
              <span class="fav-type tag">{{ item.type }}</span>
              <div class="fav-title">{{ item.title }}</div>
              @if (item.subtitle) { <div class="fav-subtitle">{{ item.subtitle }}</div> }
            </div>
            <button class="btn-icon" (click)="remove($event, item.id)" title="Remove from favorites">
              &times;
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .favorites-page { padding: 1.5rem 1rem; max-width: 800px; margin: 0 auto; }
    h2 { margin: 0 0 1rem; }
    .empty { color: var(--text-secondary); }
    .fav-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .fav-item { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem;
      background: var(--surface); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; transition: border-color 0.2s; }
    .fav-item:hover { border-color: var(--accent); }
    .fav-info { flex: 1; min-width: 0; }
    .tag { font-size: 0.7rem; padding: 0.125rem 0.5rem; background: var(--tag-bg); border-radius: 4px;
      color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .fav-title { font-weight: 600; margin-top: 0.25rem; }
    .fav-subtitle { font-size: 0.85rem; color: var(--text-secondary); }
    .btn-icon { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);
      padding: 0.25rem 0.5rem; line-height: 1; }
    .btn-icon:hover { color: #c00; }
  `]
})
export class FavoritesComponent {
  readonly favs = inject(FavoritesService);
  private readonly router = inject(Router);

  navigate(item: FavoriteItem): void {
    switch (item.type) {
      case 'artist': this.router.navigate(['/artist', item.id]); break;
      case 'release': this.router.navigate(['/release', item.id]); break;
      case 'archive': this.router.navigate(['/listen']); break;
    }
  }

  remove(event: Event, id: string): void {
    event.stopPropagation();
    this.favs.remove(id);
  }
}
