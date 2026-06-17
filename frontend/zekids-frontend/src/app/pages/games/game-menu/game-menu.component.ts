import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GameService } from '../../../services/game.service';
import { ChildService } from '../../../services/child.service';

@Component({
  selector: 'app-game-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss']
})
export class GameMenuComponent {
  games: any[] = [];

  constructor(
    private gameService: GameService,
    private childService: ChildService,
    private router: Router
  ) {
    this.games = this.gameService.games;
  }

  playGame(gameId: string): void {
    const selectedChild = this.childService.getSelectedChild();
    if (!selectedChild) {
      alert('Lütfen önce bir çocuk profili seçin');
      this.router.navigate(['/dashboard']);
      return;
    }
    this.router.navigate(['/games/play', gameId]);
  }
}
