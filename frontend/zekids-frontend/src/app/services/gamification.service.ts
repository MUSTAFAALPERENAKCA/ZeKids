import { Injectable } from '@angular/core';

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface UserStats {
  streak: number;
  lastLoginDate: string;
  gamesPlayed: number;
  perfectScores: number;
  uniqueGamesPlayed: number;
  totalPlayTime: number;
}

@Injectable({
  providedIn: 'root'
})
export class GamificationService {
  private readonly STORAGE_KEY_PREFIX = 'zekids_';

  badges: Badge[] = [
    {
      id: 'first-game',
      title: 'İlk Adım',
      description: 'İlk oyununu tamamladın!',
      icon: '🎮',
      unlocked: false
    },
    {
      id: 'streak-3',
      title: '3 Günlük Seri',
      description: 'Üst üste 3 gün giriş yaptın',
      icon: '🔥',
      unlocked: false
    },
    {
      id: 'streak-7',
      title: '7 Günlük Seri',
      description: 'Üst üste 7 gün giriş yaptın',
      icon: '⭐',
      unlocked: false
    },
    {
      id: 'streak-30',
      title: '30 Günlük Seri',
      description: 'Üst üste 30 gün giriş yaptın!',
      icon: '👑',
      unlocked: false
    },
    {
      id: 'games-10',
      title: 'Pratik Yapan',
      description: '10 oyun tamamladın',
      icon: '💪',
      unlocked: false
    },
    {
      id: 'games-50',
      title: 'Dikkat Ustası',
      description: '50 oyun tamamladın',
      icon: '🏆',
      unlocked: false
    },
    {
      id: 'all-games',
      title: 'Oyun Uzmanı',
      description: 'Tüm oyunları oynadın',
      icon: '🌟',
      unlocked: false
    },
    {
      id: 'perfect-score',
      title: 'Mükemmel Performans',
      description: 'Bir oyunda mükemmel skor aldın',
      icon: '💯',
      unlocked: false
    }
  ];

  constructor() {}

  checkDailyLogin(userId: string): void {
    const stats = this.getUserStats(userId);
    const today = new Date().toDateString();
    const lastLogin = stats.lastLoginDate;

    if (lastLogin !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastLogin === yesterdayStr) {
        // Streak devam ediyor
        stats.streak++;
      } else if (lastLogin !== today) {
        // Streak kırıldı
        stats.streak = 1;
      }

      stats.lastLoginDate = today;
      this.saveUserStats(userId, stats);
      this.checkBadges(userId, stats);
    }
  }

  incrementGamesPlayed(userId: string, gameId: string, isPerfect: boolean = false): void {
    const stats = this.getUserStats(userId);
    stats.gamesPlayed++;

    if (isPerfect) {
      stats.perfectScores++;
    }

    // Track unique games
    const playedGames = this.getPlayedGames(userId);
    if (!playedGames.includes(gameId)) {
      playedGames.push(gameId);
      this.savePlayedGames(userId, playedGames);
      stats.uniqueGamesPlayed = playedGames.length;
    }

    this.saveUserStats(userId, stats);
    this.checkBadges(userId, stats);
  }

  checkBadges(userId: string, stats: UserStats): void {
    const unlockedBadges = this.getUnlockedBadges(userId);

    // Check each badge condition
    this.badges.forEach(badge => {
      if (unlockedBadges.includes(badge.id)) {
        return; // Already unlocked
      }

      let shouldUnlock = false;

      switch (badge.id) {
        case 'first-game':
          shouldUnlock = stats.gamesPlayed >= 1;
          break;
        case 'streak-3':
          shouldUnlock = stats.streak >= 3;
          break;
        case 'streak-7':
          shouldUnlock = stats.streak >= 7;
          break;
        case 'streak-30':
          shouldUnlock = stats.streak >= 30;
          break;
        case 'games-10':
          shouldUnlock = stats.gamesPlayed >= 10;
          break;
        case 'games-50':
          shouldUnlock = stats.gamesPlayed >= 50;
          break;
        case 'all-games':
          shouldUnlock = stats.uniqueGamesPlayed >= 5;
          break;
        case 'perfect-score':
          shouldUnlock = stats.perfectScores >= 1;
          break;
      }

      if (shouldUnlock) {
        this.unlockBadge(userId, badge.id);
      }
    });
  }

  unlockBadge(userId: string, badgeId: string): void {
    const unlockedBadges = this.getUnlockedBadges(userId);
    if (!unlockedBadges.includes(badgeId)) {
      unlockedBadges.push(badgeId);
      localStorage.setItem(
        `${this.STORAGE_KEY_PREFIX}badges_${userId}`,
        JSON.stringify(unlockedBadges)
      );
    }
  }

  getUserStats(userId: string): UserStats {
    const stored = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}stats_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      streak: 0,
      lastLoginDate: '',
      gamesPlayed: 0,
      perfectScores: 0,
      uniqueGamesPlayed: 0,
      totalPlayTime: 0
    };
  }

  saveUserStats(userId: string, stats: UserStats): void {
    localStorage.setItem(
      `${this.STORAGE_KEY_PREFIX}stats_${userId}`,
      JSON.stringify(stats)
    );
  }

  getUnlockedBadges(userId: string): string[] {
    const stored = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}badges_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  getBadgesWithStatus(userId: string): Badge[] {
    const unlockedBadges = this.getUnlockedBadges(userId);
    return this.badges.map(badge => ({
      ...badge,
      unlocked: unlockedBadges.includes(badge.id)
    }));
  }

  private getPlayedGames(userId: string): string[] {
    const stored = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}played_${userId}`);
    return stored ? JSON.parse(stored) : [];
  }

  private savePlayedGames(userId: string, games: string[]): void {
    localStorage.setItem(
      `${this.STORAGE_KEY_PREFIX}played_${userId}`,
      JSON.stringify(games)
    );
  }
}
