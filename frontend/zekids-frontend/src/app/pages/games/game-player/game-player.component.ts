import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { GameService } from '../../../services/game.service';
import { ChildService } from '../../../services/child.service';

@Component({
  selector: 'app-game-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-player.component.html',
  styleUrls: ['./game-player.component.scss']
})
export class GamePlayerComponent implements OnInit, OnDestroy {
  gameId: string = '';
  gameUrl: SafeResourceUrl | null = null;
  gameName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private gameService: GameService,
    private childService: ChildService
  ) {}

  ngOnInit(): void {
    this.gameId = this.route.snapshot.params['gameId'];
    const game = this.gameService.games.find(g => g.id === this.gameId);
    
    if (!game) {
      this.router.navigate(['/games']);
      return;
    }

    this.gameName = game.title;
    this.gameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(game.wrapperUrl);

    // Listen for postMessage from game
    window.addEventListener('message', this.handleGameMessage.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleGameMessage.bind(this));
  }

  handleGameMessage(event: MessageEvent): void {
    if (event.data.type === 'game-complete') {
      const selectedChild = this.childService.getSelectedChild();
      if (!selectedChild) return;

      const gameLog = {
        childId: selectedChild.id,
        gameId: this.gameId,
        score: event.data.data.score || 0,
        duration: event.data.data.duration || 0,
        reactionTimes: event.data.data.reactionTimes,
        rawData: event.data.data.rawData
      };

      this.gameService.submitGameLog(gameLog).subscribe({
        next: (response) => {
          alert(`Oyun kaydedildi! MRT: ${response.mrt?.toFixed(2)}ms, RTV: ${response.rtv?.toFixed(2)}ms`);
          this.router.navigate(['/games']);
        },
        error: (error) => {
          console.error('Game log submission error:', error);
          alert('Oyun kaydedilemedi');
        }
      });
    }
  }

  exitGame(): void {
    if (confirm('Oyundan çıkmak istediğinize emin misiniz?')) {
      this.router.navigate(['/games']);
    }
  }
}
