import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ArchiveItem, ArchiveFile } from '../models/archive-item.model';

export interface ArchiveSearchResult { identifier: string; title: string; creator: string; date: string; description: string; }

@Injectable({ providedIn: 'root' })
export class ArchiveService {
  readonly loading = signal(false);
  readonly results = signal<ArchiveSearchResult[]>([]);
  readonly currentItem = signal<ArchiveItem | null>(null);
  constructor(private readonly http: HttpClient) {}

  search(query: string): void {
    this.loading.set(true);
    const u = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(query + ' AND mediatype:audio') + '&output=json&rows=20';
    this.http.get<any>(u).subscribe({
      next: (r: any) => {
        this.results.set((r.response?.docs || []).map((d: any) => ({
          identifier: d.identifier, title: d.title || 'Untitled', creator: d.creator || 'Unknown', date: d.date || '', description: d.description || '',
        })));
        this.loading.set(false);
      },
      error: () => { this.results.set([]); this.loading.set(false); },
    });
  }

  getFeatured(query: string, rows: number = 8): Observable<ArchiveSearchResult[]> {
    const url = 'https://archive.org/advancedsearch.php?q='
      + encodeURIComponent(query + ' AND mediatype:audio')
      + '&output=json&rows=' + rows
      + '&sort[]=downloads+desc';
    return this.http.get<any>(url).pipe(
      map((r: any) => (r.response?.docs || []).map((d: any) => ({
        identifier: d.identifier,
        title: d.title || 'Untitled',
        creator: d.creator || 'Unknown',
        date: d.date || '',
        description: d.description || '',
      })))
    );
  }

  getFirstPlayableUrl(identifier: string): Observable<{ url: string; filename: string } | null> {
    return this.http.get<any>('https://archive.org/metadata/' + identifier).pipe(
      map((res: any) => {
        const audioFile = (res.files || []).find((f: any) => /\.(mp3|ogg)$/i.test(f.name));
        if (!audioFile) return null;
        return { url: this.getStreamUrl(identifier, audioFile.name), filename: audioFile.name };
      })
    );
  }

  getMetadata(identifier: string): void {
    this.loading.set(true);
    this.http.get<any>('https://archive.org/metadata/' + identifier).subscribe({
      next: (res: any) => {
        const files: ArchiveFile[] = (res.files || []).filter((f: any) => /\\.(mp3|ogg|flac|wav)$/i.test(f.name)).map((f: any) => ({
          name: f.name, format: f.format || '', size: f.size || '0', length: f.length || '0', source: f.source || 'original',
        }));
        this.currentItem.set({ identifier, title: res.metadata?.title || identifier, creator: res.metadata?.creator || 'Unknown',
          date: res.metadata?.date || '', description: res.metadata?.description || '', files });
        this.loading.set(false);
      },
      error: () => { this.currentItem.set(null); this.loading.set(false); },
    });
  }

  getStreamUrl(identifier: string, filename: string): string {
    return 'https://archive.org/download/' + identifier + '/' + encodeURIComponent(filename);
  }
}
