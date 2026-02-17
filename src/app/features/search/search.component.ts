import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MusicBrainzService } from '../../core/services/musicbrainz.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="search-page">
      <h2>Search Artists</h2>
      <form (ngSubmit)="onSearch()" class="search-form">
        <input
          type="text"
          [(ngModel)]="query"
          name="query"
          placeholder="Search for an artist..."
          class="search-input"
        />
        <button type="submit" class="btn btn-primary">Search</button>
      </form>

      @if (mb.loading()) {
        <div class="loading">Searching...</div>
      }

      @if (mb.error()) {
        <div class="error">{{ mb.error() }}</div>
      }

      <div class="results">
        @for (artist of mb.artistResults(); track artist.id) {
          <a [routerLink]="['/artist', artist.id]" class="result-item">
            <div class="result-name">{{ artist.name }}</div>
            <div class="result-meta">
              @if (artist.type) { <span class="tag">{{ artist.type }}</span> }
              @if (artist.country) { <span class="tag">{{ artist.country }}</span> }
              @if (artist.disambiguation) { <span class="disambig">{{ artist.disambiguation }}</span> }
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-page { padding: 1.5rem 1rem; max-width: 800px; margin: 0 auto; }
    h2 { margin: 0 0 1rem; }
    .search-form { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .search-input { flex: 1; padding: 0.6rem 0.75rem; border: 1px solid var(--border); border-radius: 6px;
      font-size: 1rem; background: var(--surface); color: var(--text-primary); }
    .search-input:focus { outline: none; border-color: var(--accent); }
    .loading { padding: 1rem; text-align: center; color: var(--text-secondary); }
    .error { padding: 0.75rem; background: #fee; color: #c00; border-radius: 6px; margin-bottom: 1rem; }
    .results { display: flex; flex-direction: column; gap: 0.5rem; }
    .result-item { display: block; padding: 0.75rem 1rem; background: var(--surface); border: 1px solid var(--border);
      border-radius: 6px; text-decoration: none; color: inherit; transition: border-color 0.2s; }
    .result-item:hover { border-color: var(--accent); }
    .result-name { font-weight: 600; margin-bottom: 0.25rem; }
    .result-meta { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
    .tag { font-size: 0.75rem; padding: 0.125rem 0.5rem; background: var(--tag-bg); border-radius: 4px; color: var(--text-secondary); }
    .disambig { font-size: 0.85rem; color: var(--text-secondary); }
  `]
})
export class SearchComponent {
  readonly mb = inject(MusicBrainzService);
  query = '';

  onSearch(): void {
    this.mb.searchArtists(this.query);
  }
}
