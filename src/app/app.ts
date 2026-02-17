import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PlayerService } from './core/services/player.service';
import { SecondsPipe } from './shared/seconds-pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SecondsPipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly player = inject(PlayerService);

  onSeek(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    const time = ratio * this.player.duration();
    this.player.seek(time);
  }
}
