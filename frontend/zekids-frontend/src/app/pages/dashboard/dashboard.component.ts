import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChildService, Child } from '../../services/child.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  children: Child[] = [];
  selectedChild: Child | null = null;
  showAddChild = false;
  newChild = { nickname: '', age: 0, gender: 'Erkek' };

  constructor(
    private authService: AuthService,
    private childService: ChildService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadChildren();
  }

  loadChildren(): void {
    this.childService.getChildren().subscribe({
      next: (children) => {
        this.children = children;
        if (children.length > 0 && !this.selectedChild) {
          this.selectChild(children[0]);
        }
      }
    });
  }

  selectChild(child: Child): void {
    this.selectedChild = child;
    this.childService.selectChild(child);
  }

  addChild(): void {
    this.childService.createChild(this.newChild).subscribe({
      next: () => {
        this.loadChildren();
        this.showAddChild = false;
        this.newChild = { nickname: '', age: 0, gender: 'Erkek' };
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
