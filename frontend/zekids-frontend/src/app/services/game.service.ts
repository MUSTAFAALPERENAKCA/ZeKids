import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface GameLog {
  childId: string;
  gameId: string;
  score: number;
  duration: number;
  reactionTimes?: number[];
  rawData?: any;
}

@Injectable({
  providedIn: 'root'
})
export class GameService {
  constructor(private http: HttpClient) {}

  submitGameLog(log: GameLog): Observable<any> {
    return this.http.post(`${environment.apiUrl}/gamelogs`, log);
  }

  getChildGameLogs(childId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/gamelogs/child/${childId}`);
  }

  getChildReports(childId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/gamelogs/child/${childId}/reports`);
  }

  games = [
    {
      id: 'ant-test',
      title: 'ANT Test',
      subtitle: 'Dikkat Ağı Testi',
      description: 'Seçici dikkat ve tepki süresini ölçen klinik test',
      wrapperUrl: '/assets/games/wrappers/ant-wrapper.html',
      thumbnail: '🎯'
    },
    {
      id: 'hextris',
      title: 'Hextris',
      subtitle: 'Bilişsel Esneklik',
      description: 'Altıgen renk eşleştirme - Hızlı karar verme',
      wrapperUrl: '/games/wrappers/hextris-wrapper.html',
      thumbnail: '⬡'
    },
    {
      id: 'simon',
      title: 'Simon 2020',
      subtitle: 'Görsel-İşitsel Bellek',
      description: 'Renk ve ses dizilerini hatırlama',
      wrapperUrl: '/games/wrappers/simon-wrapper.html',
      thumbnail: '🎵'
    },
    {
      id: '2048',
      title: '2048',
      subtitle: 'Mantıksal Akıl Yürütme',
      description: 'Sayı bloklarını birleştirme ve planlama',
      wrapperUrl: '/games/wrappers/2048-wrapper.html',
      thumbnail: '🔢'
    },
    {
      id: 'bubble-shooter',
      title: 'Bubble Shooter',
      subtitle: 'Stratejik Planlama',
      description: 'Hedefleme hassasiyeti ve ardışık planlama',
      wrapperUrl: '/games/wrappers/bubble-shooter-wrapper.html',
      thumbnail: '🫧'
    },
    {
      id: 'coin-marksman',
      title: 'Coin Marksman',
      subtitle: 'Dürtü Kontrolü',
      description: 'Hedef belirleme ve dürtü kontrolü',
      wrapperUrl: '/games/wrappers/coin-wrapper.html',
      thumbnail: '🎮'
    },
    {
      id: 'flag-match',
      title: 'FlagMatch',
      subtitle: 'Çalışma Belleği',
      description: 'Görsel hafıza ve eşleştirme',
      wrapperUrl: '/games/wrappers/flag-wrapper.html',
      thumbnail: '🚩'
    },
    {
      id: 'endless-runner',
      title: 'Endless Runner',
      subtitle: 'Sürdürülebilir Dikkat',
      description: 'Uzun süreli dikkat ve refleks',
      wrapperUrl: '/games/endless-runner/index.html',
      thumbnail: '🏃'
    }
  ];
}
