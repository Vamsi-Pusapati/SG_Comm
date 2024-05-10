import { Component } from '@angular/core';

@Component({
  selector: 'app-second-page',
  standalone: true,
  imports: [],
  templateUrl: './second-page.component.html',
  styleUrl: './second-page.component.css'
})
export class SecondPageComponent {
  async normalFlow() {
    try {
      const response = await fetch('https://2fjtc2nkql.execute-api.us-east-1.amazonaws.com/network', {
      method:"POST",  
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify ({
        "data": "1.43861873,-0.80526251,-0.91147814,0.75783641,0.84713723,0.20614859,-0.3015729,-1.3622899,-0.72425452,1.54724184,0.95580832,0.03321888",
       })
      });
      const data = await response.json();
      console.log(data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  async attackFlow() {
    try {
      const response = await fetch('https://2fjtc2nkql.execute-api.us-east-1.amazonaws.com/network', {
      method:"POST",  
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify (
        {
          "data": "1.43861873,-0.80526251,-0.91147814,0.75783641,0.84713723,0.20614859,-0.3015729,-1.3622899,-0.72425452,1.54724184,0.95580832,0.03321888"
       })
      });
      const data = await response.json();
      console.log(data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

}
