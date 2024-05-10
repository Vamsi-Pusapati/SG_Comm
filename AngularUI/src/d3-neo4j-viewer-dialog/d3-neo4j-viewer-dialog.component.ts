import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-d3-neo4j-viewer-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule
  ],
  templateUrl: './d3-neo4j-viewer-dialog.component.html',
  styleUrl: './d3-neo4j-viewer-dialog.component.css'
})
export class D3Neo4jViewerDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data);
  }
}
