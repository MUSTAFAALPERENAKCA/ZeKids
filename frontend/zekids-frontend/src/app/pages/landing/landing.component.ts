import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  features = [
    {
      title: 'Klinik Onaylı Testler',
      description: 'ANT (Attention Network Test) ve bilimsel araştırmalarla desteklenen oyunlaştırılmış dikkat ölçümleri',
      icon: '🎯'
    },
    {
      title: 'Detaylı Analiz Raporları',
      description: 'MRT ve RTV metrikleri ile çocuğunuzun dikkat gelişimini grafikler üzerinden takip edin',
      icon: '📊'
    },
    {
      title: 'Güvenli ve Şifreli',
      description: 'Tüm çocuk verileri AES-256 şifreleme ile korunur. KVKK ve GDPR uyumlu platform',
      icon: '🔒'
    },
    {
      title: 'Oyunlaştırılmış Deneyim',
      description: 'Çocuklar oyun oynarken, siz bilimsel veriler toplarsınız. Eğlenceli ve etkili',
      icon: '🎮'
    },
    {
      title: 'Gelişim Takibi',
      description: 'Haftalık ve aylık ilerleme raporları ile dikkat tutarlılığındaki değişimleri görün',
      icon: '📈'
    },
    {
      title: 'Uzman Desteği',
      description: 'Klinik psikologlar tarafından tasarlanan testler ve yorumlama sistemi',
      icon: '👨‍⚕️'
    }
  ];
}
