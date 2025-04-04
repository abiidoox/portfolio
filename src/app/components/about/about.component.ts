import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {
  profile = {
    name: 'ABDERRAZZAQ EL ABDOUNI',
    title: 'Ingénieur Full Stack',
    email: 'elabdouni.abderrazzaq@gmail.com',
    phone: '0653539113',
    location: 'Rabat, Maroc',
    bio: 'Je suis un Ingénieur Full Stack passionné basé à Rabat, spécialisé dans le développement web, l\'IoT et le Machine Learning. Je combine expertise technique et innovation pour créer des solutions logicielles performantes et évolutives.'
  };
}