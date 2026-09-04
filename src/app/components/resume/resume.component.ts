import { Component } from '@angular/core';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.scss']
})
export class ResumeComponent {
  error = false;

  downloadResume(): void {
    const filePath = 'assets/Abderrazzaq_El_Abdouni_CV.pdf';
    const fileName = 'Abderrazzaq_El_Abdouni_CV.pdf';

    const link = document.createElement('a');
    link.href = filePath;
    link.download = fileName;

    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error('CV not found');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => {
        this.error = true;
      });
  }
}
