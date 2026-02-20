import { Page } from '@playwright/test';

export async function mockMusicAPIs(page: Page) {
  await page.route('**/musicbrainz.org/ws/2/artist?query=**', route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        artists: [
          { id: 'test-1', name: 'Johann Sebastian Bach', type: 'Person', country: 'DE', disambiguation: 'Baroque composer' },
          { id: 'test-2', name: 'Ludwig van Beethoven', type: 'Person', country: 'DE', disambiguation: 'Classical composer' },
        ],
      }),
    })
  );

  await page.route('**/musicbrainz.org/ws/2/artist/test-*?**', route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-1', name: 'Johann Sebastian Bach', type: 'Person', country: 'DE',
        releases: [
          { id: 'rel-1', title: 'The Well-Tempered Clavier', date: '1722', status: 'Official' },
          { id: 'rel-2', title: 'Brandenburg Concertos', date: '1721', status: 'Official' },
        ],
      }),
    })
  );

  await page.route('**/musicbrainz.org/ws/2/release/rel-*?**', route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        id: 'rel-1', title: 'The Well-Tempered Clavier', date: '1722',
        media: [{ 'track-count': 2, tracks: [
          { id: 't1', number: '1', title: 'Prelude No. 1', length: 180000, recording: { id: 'r1', title: 'Prelude No. 1', length: 180000 } },
          { id: 't2', number: '2', title: 'Fugue No. 1', length: 240000, recording: { id: 'r2', title: 'Fugue No. 1', length: 240000 } },
        ] }],
      }),
    })
  );

  await page.route('**/archive.org/advancedsearch.php**', route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        response: { docs: [
          { identifier: 'test-archive-1', title: 'Classical Music Collection', creator: 'Various', date: '2020' },
          { identifier: 'test-archive-2', title: 'Piano Sonatas', creator: 'Beethoven', date: '2019' },
        ] },
      }),
    })
  );

  await page.route('**/archive.org/metadata/**', route =>
    route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({
        metadata: { title: 'Classical Music Collection', creator: 'Various' },
        files: [
          { name: 'track1.mp3', format: 'VBR MP3', title: 'Track 1', length: '3:00' },
          { name: 'track2.mp3', format: 'VBR MP3', title: 'Track 2', length: '4:00' },
        ],
      }),
    })
  );
}
