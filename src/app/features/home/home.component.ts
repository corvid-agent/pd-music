import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home">
      <div class="hero">
        <h1>Public Domain Music</h1>
        <p>Explore artists, releases, and recordings from MusicBrainz. Stream public domain audio from the Internet Archive.</p>
      </div>
      <div class="actions">
        <a routerLink="/search" class="btn btn-primary">Search Artists</a>
        <a routerLink="/listen" class="btn btn-secondary">Browse Archive</a>
        <a routerLink="/favorites" class="btn btn-secondary">Favorites</a>
      </div>
      <div class="info-cards">
        <div class="card">
          <h3>MusicBrainz</h3>
          <p>Search the open music encyclopedia for artists, albums, and recordings with rich metadata.</p>
        </div>
        <div class="card">
          <h3>Internet Archive</h3>
          <p>Stream public domain and freely available audio from the world's largest digital library.</p>
        </div>
        <div class="card">
          <h3>Persistent Player</h3>
          <p>Audio keeps playing as you browse. Control playback from the always-visible player bar.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home { padding: 2rem 1rem; max-width: 800px; margin: 0 auto; }
    .hero { text-align: center; margin-bottom: 2rem; }
    .hero h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    .hero p { color: var(--text-secondary); line-height: 1.6; }
    .actions { display: flex; gap: 1rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap; }
    .info-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; }
    .card h3 { margin: 0 0 0.5rem; }
    .card p { margin: 0; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5; }
  `]
})
export class HomeComponent {}
