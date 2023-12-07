import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {NavBarComponent} from "../nav-bar/nav-bar.component";
import {D3Neo4jViewerComponent} from "../d3-neo4j-viewer/d3-neo4j-viewer.component";
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavBarComponent, D3Neo4jViewerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
