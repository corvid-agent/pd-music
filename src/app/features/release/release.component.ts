import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicBrainzService } from '../../core/services/musicbrainz.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { DurationPipe } from '../../shared/duration-pipe';

@Component({
  selector: 'app-release',
  standalone: true,
  imports: [DurationPipe],
  template: `
    <div class="release-page">
      @if (mb.loading()) {
        <div class="loading">Loading release...</div>
      }

      @if (mb.error()) {
        <div class="error">{{ mb.error() }}</div>
      }

      @if (mb.releaseDetail(); as detail) {
        <div class="release-header">
          <h2>{{ detail.release.title }}</h2>
          <div class="release-meta">
            @if (detail.release.date) { <span>{{ detail.release.date }}</span> }
            @if (detail.release.country) { <span class="tag">{{ detail.release.country }}</span> }
            @if (detail.release.status) { <span class="tag">{{ detail.release.status }}</span> }
          </div>
          <button class="btn btn-secondary" (click)="toggleFavorite()">
            {{ favs.isFavorite(detail.release.id) ? 'Remove from Favorites' : 'Add to Favorites' }}
          </button>
        </div>

        <h3>Recordings ({{ detail.recordings.length }})</h3>
        <div class="recordings">
          @for (rec of detail.recordings; track rec.id; let i = $index) {
            <div class="recording-item">
              <span class="track-num">{{ i + 1 }}</span>
              <div class="track-info">
                <div class="track-title">{{ rec.title }}</div>
                <div class="track-artist">{{ rec.artistCredit }}</div>
              </div>
              <span class="track-duration">{{ rec.length | duration }}</span>
            </div>
          }
          @empty {
            <p class="empty">No recordings found.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .release-page { padding: 1.5rem 1rem; max-width: 800px; margin: 0 auto; }
    .release-header { margin-bottom: 1.5rem; }
    .release-header h2 { margin: 0 0 0.5rem; }
    .release-meta { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.75rem; font-size: 0.9rem; color: var(--text-secondary); }
    .tag { font-size: 0.875rem; padding: 0.125rem 0.5rem; background: var(--tag-bg); border-radius: 4px; }
    .loading { padding: 1rem; text-align: center; color: var(--text-secondary); }
    .error { padding: 0.75rem; background: #3d1c1c; color: #ff8a8a; border-radius: 6px; margin-bottom: 1rem; }
    h3 { margin: 0 0 0.75rem; }
    .recordings { display: flex; flex-direction: column; gap: 0.25rem; }
    .recording-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.75rem;
      background: var(--surface); border: 1px solid var(--border); border-radius: 6px; }
    .track-num { width: 1.5rem; text-align: right; color: var(--text-secondary); font-size: 0.875rem; flex-shrink: 0; }
    .track-info { flex: 1; min-width: 0; }
    .track-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track-artist { font-size: 0.875rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .track-duration { color: var(--text-secondary); font-size: 0.875rem; flex-shrink: 0; }
    .empty { color: var(--text-secondary); }
  `]
})
export class ReleaseComponent implements OnInit {
  readonly mb = inject(MusicBrainzService);
  readonly favs = inject(FavoritesService);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mb.getRelease(id);
    }
  }

  toggleFavorite(): void {
    const detail = this.mb.releaseDetail();
    if (detail) {
      this.favs.toggle({
        id: detail.release.id,
        type: 'release',
        title: detail.release.title,
        subtitle: detail.release.date || '',
      });
    }
  }
}
