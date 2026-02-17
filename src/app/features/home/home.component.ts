import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArchiveService, ArchiveSearchResult } from '../../core/services/archive.service';
import { PlayerService } from '../../core/services/player.service';

interface FeaturedSection {
  title: string;
  query: string;
  items: ArchiveSearchResult[];
  loading: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home">
      <div class="hero">
        <h1>pd-music</h1>
        <p>Stream public domain music from the Internet Archive</p>
      </div>

      <div class="nav-actions">
        <a routerLink="/search" class="btn btn-secondary">Search Artists</a>
        <a routerLink="/listen" class="btn btn-secondary">Browse Archive</a>
        <a routerLink="/favorites" class="btn btn-secondary">Favorites</a>
      </div>

      @for (section of sections(); track section.title) {
        <section class="featured-section">
          <h2 class="section-title">{{ section.title }}</h2>
          @if (section.loading) {
            <div class="loading">Loading...</div>
          }
          <div class="featured-grid">
            @for (item of section.items; track item.identifier) {
              <div class="featured-card">
                <div class="card-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 18V5l12-2v13"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                </div>
                <div class="card-body">
                  <div class="card-title" [title]="item.title">{{ item.title }}</div>
                  <div class="card-creator">{{ item.creator }}</div>
                </div>
                <button
                  class="play-btn"
                  (click)="playItem(item)"
                  [disabled]="loadingTrack() === item.identifier"
                  [attr.aria-label]="'Play ' + item.title"
                >
                  @if (loadingTrack() === item.identifier) {
                    <span class="play-icon loading-spinner"></span>
                  } @else {
                    <svg class="play-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                  }
                </button>
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .home {
      padding: 1.5rem 1rem 3rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .hero {
      text-align: center;
      margin-bottom: 1.25rem;
      padding: 1.5rem 0 1rem;
    }

    .hero h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
      letter-spacing: -0.02em;
    }

    .hero p {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }

    .nav-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .featured-section {
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--border);
    }

    .loading {
      padding: 1rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0.75rem;
    }

    .featured-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      transition: border-color 0.2s, background 0.2s;
    }

    .featured-card:hover {
      border-color: var(--accent);
      background: var(--tag-bg);
    }

    .card-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      background: var(--tag-bg);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
    }

    .card-body {
      flex: 1;
      min-width: 0;
    }

    .card-title {
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.15rem;
    }

    .card-creator {
      font-size: 0.8rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .play-btn {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--accent);
      border: none;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s, transform 0.15s;
    }

    .play-btn:hover:not(:disabled) {
      opacity: 0.85;
      transform: scale(1.08);
    }

    .play-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .play-icon {
      display: block;
    }

    .loading-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly archive = inject(ArchiveService);
  private readonly player = inject(PlayerService);

  readonly sections = signal<FeaturedSection[]>([
    { title: 'Classical', query: 'classical music public domain', items: [], loading: true },
    { title: 'Jazz', query: 'jazz public domain', items: [], loading: true },
    { title: 'Folk', query: 'folk music public domain', items: [], loading: true },
  ]);

  readonly loadingTrack = signal<string | null>(null);

  ngOnInit(): void {
    const current = this.sections();
    for (let i = 0; i < current.length; i++) {
      this.archive.getFeatured(current[i].query, 8).subscribe({
        next: (items) => {
          this.sections.update(sections => {
            const updated = [...sections];
            updated[i] = { ...updated[i], items, loading: false };
            return updated;
          });
        },
        error: () => {
          this.sections.update(sections => {
            const updated = [...sections];
            updated[i] = { ...updated[i], loading: false };
            return updated;
          });
        },
      });
    }
  }

  playItem(item: ArchiveSearchResult): void {
    this.loadingTrack.set(item.identifier);
    this.archive.getFirstPlayableUrl(item.identifier).subscribe({
      next: (result) => {
        this.loadingTrack.set(null);
        if (result) {
          this.player.play(result.url, {
            title: item.title,
            artist: item.creator,
            url: result.url,
          });
        }
      },
      error: () => {
        this.loadingTrack.set(null);
      },
    });
  }
}
