import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../../environments/environment.development';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  metrics: any = null;
  users: any[] = [];
  gameStats: any = null;
  loading = true;

  // Revenue Chart
  revenueChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'Aylık Gelir (TL)',
      data: [],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 2
    }]
  };

  revenueChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Aylık Gelir Trendi'
      }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMetrics();
    this.loadUsers();
    this.loadGameStats();
  }

  loadMetrics(): void {
    this.http.get(`${environment.apiUrl}/admin/metrics`).subscribe({
      next: (data: any) => {
        this.metrics = data;
        this.processRevenueChart(data.revenueByMonth);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.http.get(`${environment.apiUrl}/admin/users?page=1&pageSize=10`).subscribe({
      next: (data: any) => {
        this.users = data.users;
      }
    });
  }

  loadGameStats(): void {
    this.http.get(`${environment.apiUrl}/admin/game-stats`).subscribe({
      next: (data: any) => {
        this.gameStats = data;
      }
    });
  }

  processRevenueChart(revenueData: any[]): void {
    const labels: string[] = [];
    const data: number[] = [];

    revenueData.forEach(item => {
      const monthName = this.getMonthName(item.month);
      labels.push(`${monthName} ${item.year}`);
      data.push(item.revenue);
    });

    this.revenueChartData.labels = labels;
    this.revenueChartData.datasets[0].data = data;
  }

  getMonthName(month: number): string {
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return months[month - 1];
  }
}
