import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-parental-gate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parental-gate.component.html',
  styleUrls: ['./parental-gate.component.scss']
})
export class ParentalGateComponent implements OnInit {
  @Output() verified = new EventEmitter<boolean>();
  @Output() cancelled = new EventEmitter<void>();

  question = '';
  correctAnswer = 0;
  userAnswer = '';
  attempts = 0;
  maxAttempts = 3;
  error = '';

  ngOnInit(): void {
    this.generateQuestion();
  }

  generateQuestion(): void {
    const num1 = Math.floor(Math.random() * 50) + 10;
    const num2 = Math.floor(Math.random() * 50) + 10;
    this.question = `${num1} + ${num2}`;
    this.correctAnswer = num1 + num2;
  }

  verify(): void {
    this.error = '';
    const answer = parseInt(this.userAnswer);

    if (isNaN(answer)) {
      this.error = 'Lütfen geçerli bir sayı girin';
      return;
    }

    if (answer === this.correctAnswer) {
      this.verified.emit(true);
    } else {
      this.attempts++;
      if (this.attempts >= this.maxAttempts) {
        this.error = 'Çok fazla yanlış deneme. Lütfen daha sonra tekrar deneyin.';
        setTimeout(() => {
          this.cancelled.emit();
        }, 2000);
      } else {
        this.error = `Yanlış cevap. Kalan deneme: ${this.maxAttempts - this.attempts}`;
        this.userAnswer = '';
      }
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
