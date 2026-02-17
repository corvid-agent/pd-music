import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, concatMap, delay, of, tap } from 'rxjs';
import { Artist } from '../models/artist.model';
import { Release } from '../models/release.model';
import { Recording } from '../models/recording.model';

interface QueuedRequest<T> {
  url: string;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

@Injectable({ providedIn: 'root' })
export class MusicBrainzService {
  private readonly baseUrl = 'https://musicbrainz.org/ws/2';
  private readonly headers = new HttpHeaders({
    'Accept': 'application/json',
  });

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly artistResults = signal<Artist[]>([]);
  readonly artistDetail = signal<{ artist: Artist; releases: Release[] } | null>(null);
  readonly releaseDetail = signal<{ release: Release; recordings: Recording[] } | null>(null);

  private readonly requestQueue = new Subject<QueuedRequest<unknown>>();

  constructor(private readonly http: HttpClient) {
    this.requestQueue.pipe(
      concatMap((req) =>
        of(req).pipe(
          delay(1000),
          concatMap((r) =>
            new Promise<void>((done) => {
              this.http.get<unknown>(r.url, { headers: this.headers }).subscribe({
                next: (data) => { r.resolve(data); done(); },
                error: (err) => { r.reject(err); done(); },
              });
            })
          )
        )
      )
    ).subscribe();
  }

  private enqueue<T>(url: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.requestQueue.next({ url, resolve: resolve as (v: unknown) => void, reject });
    });
  }

  searchArtists(query: string): void {
    if (!query.trim()) {
      this.artistResults.set([]);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const url = `${this.baseUrl}/artist?query=${encodeURIComponent(query)}&fmt=json`;
    this.enqueue<{ artists?: Array<Record<string, unknown>> }>(url).then(
      (data) => {
        const artists: Artist[] = (data.artists || []).map((a: Record<string, unknown>) => ({
          id: a['id'] as string,
          name: a['name'] as string,
          sortName: (a['sort-name'] as string) || '',
          type: (a['type'] as string) || '',
          country: (a['country'] as string) || null,
          disambiguation: (a['disambiguation'] as string) || '',
          beginDate: (a['life-span'] as Record<string, unknown>)?.['begin'] as string || null,
          endDate: (a['life-span'] as Record<string, unknown>)?.['end'] as string || null,
        }));
        this.artistResults.set(artists);
        this.loading.set(false);
      },
      (err) => {
        this.error.set('Failed to search artists');
        this.loading.set(false);
      }
    );
  }

  getArtist(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    const url = `${this.baseUrl}/artist/${id}?inc=releases&fmt=json`;
    this.enqueue<Record<string, unknown>>(url).then(
      (data) => {
        const artist: Artist = {
          id: data['id'] as string,
          name: data['name'] as string,
          sortName: (data['sort-name'] as string) || '',
          type: (data['type'] as string) || '',
          country: (data['country'] as string) || null,
          disambiguation: (data['disambiguation'] as string) || '',
          beginDate: (data['life-span'] as Record<string, unknown>)?.['begin'] as string || null,
          endDate: (data['life-span'] as Record<string, unknown>)?.['end'] as string || null,
        };
        const releases: Release[] = ((data['releases'] as Array<Record<string, unknown>>) || []).map((r) => ({
          id: r['id'] as string,
          title: r['title'] as string,
          date: (r['date'] as string) || null,
          country: (r['country'] as string) || null,
          status: (r['status'] as string) || '',
          trackCount: (r['track-count'] as number) || 0,
        }));
        this.artistDetail.set({ artist, releases });
        this.loading.set(false);
      },
      () => {
        this.error.set('Failed to load artist');
        this.loading.set(false);
      }
    );
  }

  getRelease(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    const url = `${this.baseUrl}/release/${id}?inc=recordings&fmt=json`;
    this.enqueue<Record<string, unknown>>(url).then(
      (data) => {
        const release: Release = {
          id: data['id'] as string,
          title: data['title'] as string,
          date: (data['date'] as string) || null,
          country: (data['country'] as string) || null,
          status: (data['status'] as string) || '',
          trackCount: 0,
        };
        const media = (data['media'] as Array<Record<string, unknown>>) || [];
        const recordings: Recording[] = [];
        for (const medium of media) {
          const tracks = (medium['tracks'] as Array<Record<string, unknown>>) || [];
          for (const track of tracks) {
            const rec = track['recording'] as Record<string, unknown>;
            if (rec) {
              const artistCredit = ((rec['artist-credit'] as Array<Record<string, unknown>>) || [])
                .map((ac) => {
                  const artistObj = ac['artist'] as Record<string, unknown>;
                  return (artistObj?.['name'] as string || '') + ((ac['joinphrase'] as string) || '');
                })
                .join('');
              recordings.push({
                id: rec['id'] as string,
                title: rec['title'] as string,
                length: (rec['length'] as number) || null,
                artistCredit: artistCredit || 'Unknown',
              });
            }
          }
        }
        release.trackCount = recordings.length;
        this.releaseDetail.set({ release, recordings });
        this.loading.set(false);
      },
      () => {
        this.error.set('Failed to load release');
        this.loading.set(false);
      }
    );
  }
}
