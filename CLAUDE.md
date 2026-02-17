# pd-music

Public domain music explorer powered by MusicBrainz and Internet Archive. Browse artists, albums, and recordings with audio streaming. Angular 21 standalone app deployed to GitHub Pages.

## APIs

- MusicBrainz: https://musicbrainz.org/ws/2/ (requires User-Agent header, 1 req/sec limit)
- Internet Archive: https://archive.org/ (search, metadata, audio streaming)
- No auth required for either

## Verification

npx ng build --base-href /pd-music/
npx ng test --no-watch

## Stack

- Angular 21 (standalone components, signals, new control flow)
- TypeScript strict mode
- CSS custom properties for design tokens
- Mobile-first responsive design
