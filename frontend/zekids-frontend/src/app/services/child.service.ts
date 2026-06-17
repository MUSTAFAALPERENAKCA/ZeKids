import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment.development';

export interface Child {
  id: string;
  nickname: string;
  age: number;
  gender: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChildService {
  private selectedChildSubject = new BehaviorSubject<Child | null>(null);
  public selectedChild$ = this.selectedChildSubject.asObservable();

  constructor(private http: HttpClient) {}

  getChildren(): Observable<Child[]> {
    return this.http.get<Child[]>(`${environment.apiUrl}/children`);
  }

  createChild(child: { nickname: string; age: number; gender: string }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/children`, child);
  }

  deleteChild(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/children/${id}`);
  }

  selectChild(child: Child): void {
    this.selectedChildSubject.next(child);
    localStorage.setItem('selectedChild', JSON.stringify(child));
  }

  getSelectedChild(): Child | null {
    const stored = localStorage.getItem('selectedChild');
    return stored ? JSON.parse(stored) : null;
  }
}
