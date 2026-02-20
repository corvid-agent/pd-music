import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MusicBrainzService } from '../../core/services/musicbrainz.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-artist',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="artist-page">
      @if (mb.loading()) {
        <div class="loading">Loading artist...</div>
      }

      @if (mb.error()) {
        <div class="error">{{ mb.error() }}</div>
      }

      @if (mb.artistDetail(); as detail) {
        <div class="artist-header">
          <h2>{{ detail.artist.name }}</h2>
          <div class="artist-meta">
            @if (detail.artist.type) { <span class="tag">{{ detail.artist.type }}</span> }
            @if (detail.artist.country) { <span class="tag">{{ detail.artist.country }}</span> }
            @if (detail.artist.beginDate) { <span class="date">{{ detail.artist.beginDate }}{{ detail.artist.endDate ? ' - ' + detail.artist.endDate : '' }}</span> }
            @if (detail.artist.disambiguation) { <p class="disambig">{{ detail.artist.disambiguation }}</p> }
          </div>
          <button class="btn btn-secondary" (click)="toggleFavorite()">
            {{ favs.isFavorite(detail.artist.id) ? 'Remove from Favorites' : 'Add to Favorites' }}
          </button>
        </div>

        <h3>Releases ({{ detail.releases.length }})</h3>
        <div class="releases">
          @for (release of detail.releases; track release.id) {
            <a [routerLink]="['/release', release.id]" class="release-item">
              <div class="release-title">{{ release.title }}</div>
              <div class="release-meta">
                @if (release.date) { <span>{{ release.date }}</span> }
                @if (release.status) { <span class="tag">{{ release.status }}</span> }
                <span>{{ release.trackCount }} tracks</span>
              </div>
            </a>
          }
          @empty {
            <p class="empty">No releases found.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .artist-page { padding: 1.5rem 1rem; max-width: 800px; margin: 0 auto; }
    .artist-header { margin-bottom: 1.5rem; }
    .artist-header h2 { margin: 0 0 0.5rem; }
    .artist-meta { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.75rem; }
    .tag { font-size: 0.875rem; padding: 0.125rem 0.5rem; background: var(--tag-bg); border-radius: 4px; color: var(--text-secondary); }
    .date { font-size: 0.875rem; color: var(--text-secondary); }
    .disambig { color: var(--text-secondary); margin: 0.25rem 0 0; }
    .loading { padding: 1rem; text-align: center; color: var(--text-secondary); }
    .error { padding: 0.75rem; background: #3d1c1c; color: #ff8a8a; border-radius: 6px; margin-bottom: 1rem; }
    h3 { margin: 0 0 0.75rem; }
    .releases { display: flex; flex-direction: column; gap: 0.5rem; }
    .release-item { display: block; padding: 0.75rem 1rem; background: var(--surface); border: 1px solid var(--border);
      border-radius: 6px; text-decoration: none; color: inherit; transition: border-color 0.2s; }
    .release-item:hover { border-color: var(--accent); }
    .release-title { font-weight: 600; margin-bottom: 0.25rem; }
    .release-meta { display: flex; gap: 0.5rem; align-items: center; font-size: 0.875rem; color: var(--text-secondary); }
    .empty { color: var(--text-secondary); }
  `]
})
export class ArtistComponent implements OnInit {
  readonly mb = inject(MusicBrainzService);
  readonly favs = inject(FavoritesService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mb.getArtist(id);
    }
  }

  toggleFavorite(): void {
    const detail = this.mb.artistDetail();
    if (detail) {
      this.favs.toggle({
        id: detail.artist.id,
        type: 'artist',
        title: detail.artist.name,
        subtitle: detail.artist.type || '',
      });
    }
  }
}
