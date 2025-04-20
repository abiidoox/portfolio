import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  loadingTexts: string[] = [
    'Loading...',
    'Please wait...',
    'Almost there...',
    'Just a moment...'
  ];
  currentText: string = this.loadingTexts[0];
  private textIndex: number = 0;

  constructor() { }

  ngOnInit(): void {
    this.startTextRotation();
  }

  private startTextRotation(): void {
    setInterval(() => {
      this.textIndex = (this.textIndex + 1) % this.loadingTexts.length;
      this.currentText = this.loadingTexts[this.textIndex];
    }, 3000);
  }
} 