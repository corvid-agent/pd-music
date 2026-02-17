import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArchiveService, ArchiveSearchResult } from '../../core/services/archive.service';
import { PlayerService } from '../../core/services/player.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-listen',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="listen-page">
      <h2>Browse Internet Archive</h2>
      <form (ngSubmit)="onSearch()" class="search-form">
        <input
          type="text"
          [(ngModel)]="query"
          name="query"
          placeholder="Search for audio..."
          class="search-input"
        />
        <button type="submit" class="btn btn-primary">Search</button>
      </form>

      @if (archive.loading()) {
        <div class="loading">Searching...</div>
      }

      @if (!selectedItem) {
        <div class="results">
          @for (item of archive.results(); track item.identifier) {
            <div class="result-item" (click)="loadItem(item)">
              <div class="result-title">{{ item.title }}</div>
              <div class="result-meta">
                <span>{{ item.creator }}</span>
                @if (item.date) { <span>{{ item.date }}</span> }
              </div>
            </div>
          }
        </div>
      }

      @if (selectedItem) {
        <div class="item-detail">
          <button class="btn btn-secondary back-btn" (click)="selectedItem = null">Back to results</button>
          <h3>{{ archive.currentItem()?.title }}</h3>
          <p class="item-creator">{{ archive.currentItem()?.creator }}</p>
          <button class="btn btn-secondary" (click)="toggleFavorite()">
            {{ isFav() ? 'Remove from Favorites' : 'Add to Favorites' }}
          </button>

          @if (archive.currentItem()?.files; as files) {
            <div class="file-list">
              @for (file of files; track file.name) {
                <div class="file-item" (click)="playFile(file.name)">
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-meta">{{ file.format }}</span>
                </div>
              }
              @empty {
                <p class="empty">No playable audio files found.</p>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .listen-page { padding: 1.5rem 1rem; max-width: 800px; margin: 0 auto; }
    h2 { margin: 0 0 1rem; }
    .search-form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .search-input { flex: 1; padding: 0.6rem 0.75rem; border: 1px solid var(--border); border-radius: 6px;
      font-size: 1rem; background: var(--surface); color: var(--text-primary); }
    .search-input:focus { outline: none; border-color: var(--accent); }
    .loading { padding: 1rem; text-align: center; color: var(--text-secondary); }
    .results { display: flex; flex-direction: column; gap: 0.5rem; }
    .result-item { padding: 0.75rem 1rem; background: var(--surface); border: 1px solid var(--border);
      border-radius: 6px; cursor: pointer; transition: border-color 0.2s; }
    .result-item:hover { border-color: var(--accent); }
    .result-title { font-weight: 600; margin-bottom: 0.25rem; }
    .result-meta { display: flex; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); }
    .item-detail { margin-top: 0.5rem; }
    .back-btn { margin-bottom: 1rem; }
    h3 { margin: 0 0 0.25rem; }
    .item-creator { color: var(--text-secondary); margin: 0 0 0.75rem; }
    .file-list { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 1rem; }
    .file-item { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.75rem;
      background: var(--surface); border: 1px solid var(--border); border-radius: 6px; cursor: pointer; transition: border-color 0.2s; }
    .file-item:hover { border-color: var(--accent); }
    .file-name { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 1; }
    .file-meta { color: var(--text-secondary); font-size: 0.85rem; flex-shrink: 0; margin-left: 0.5rem; }
    .empty { color: var(--text-secondary); }
  `]
})
export class ListenComponent {
  readonly archive = inject(ArchiveService);
  private readonly player = inject(PlayerService);
  private readonly favs = inject(FavoritesService);
  query = '';
  selectedItem: ArchiveSearchResult | null = null;

  onSearch(): void {
    this.selectedItem = null;
    this.archive.search(this.query);
  }

  loadItem(item: ArchiveSearchResult): void {
    this.selectedItem = item;
    this.archive.getMetadata(item.identifier);
  }

  playFile(filename: string): void {
    const item = this.archive.currentItem();
    if (!item) return;
    const url = this.archive.getStreamUrl(item.identifier, filename);
    this.player.play(url, {
      title: filename,
      artist: item.creator,
      url,
    });
  }

  isFav(): boolean {
    return this.selectedItem ? this.favs.isFavorite(this.selectedItem.identifier) : false;
  }

  toggleFavorite(): void {
    const item = this.archive.currentItem();
    if (item) {
      this.favs.toggle({
        id: item.identifier,
        type: 'archive',
        title: item.title,
        subtitle: item.creator,
      });
    }
  }
}
