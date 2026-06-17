import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChildService } from '../../../services/child.service';
import { GameService } from '../../../services/game.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  childId: string = '';
  childName: string = '';
  reportData: any = null;
  loading = true;

  // MRT Chart
  mrtChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'Ortalama Tepki Süresi (ms)',
      data: [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  mrtChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'MRT Trend Grafiği'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Milisaniye (ms)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Oyun Tarihi'
        }
      }
    }
  };

  // RTV Chart
  rtvChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      label: 'Tepki Süresi Değişkenliği (ms)',
      data: [],
      borderColor: 'rgb(236, 72, 153)',
      backgroundColor: 'rgba(236, 72, 153, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  rtvChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: true,
        text: 'RTV Trend Grafiği (Dikkat Tutarlılığı)'
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Milisaniye (ms)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Oyun Tarihi'
        }
      }
    }
  };

  constructor(
    private route: ActivatedRoute,
    private childService: ChildService,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    const selectedChild = this.childService.getSelectedChild();
    if (selectedChild) {
      this.childId = selectedChild.id;
      this.childName = selectedChild.nickname;
      this.loadReports();
    }
  }

  loadReports(): void {
    this.gameService.getChildReports(this.childId).subscribe({
      next: (data) => {
        this.reportData = data;
        this.processChartData(data.logs);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reports:', error);
        this.loading = false;
      }
    });
  }

  processChartData(logs: any[]): void {
    const labels: string[] = [];
    const mrtData: number[] = [];
    const rtvData: number[] = [];

    logs.forEach((log, index) => {
      const date = new Date(log.createdAt);
      labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      mrtData.push(log.mrt || 0);
      rtvData.push(log.rtv || 0);
    });

    this.mrtChartData.labels = labels;
    this.mrtChartData.datasets[0].data = mrtData;

    this.rtvChartData.labels = labels;
    this.rtvChartData.datasets[0].data = rtvData;
  }

  getInterpretationColor(interpretation: string): string {
    if (interpretation.includes('Mükemmel')) return 'text-green-600';
    if (interpretation.includes('İyi')) return 'text-blue-600';
    if (interpretation.includes('Orta')) return 'text-yellow-600';
    return 'text-orange-600';
  }

  getInterpretationIcon(interpretation: string): string {
    if (interpretation.includes('Mükemmel')) return '🌟';
    if (interpretation.includes('İyi')) return '👍';
    if (interpretation.includes('Orta')) return '💪';
    return '📈';
  }
}
