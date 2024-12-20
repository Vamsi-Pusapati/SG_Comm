import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecondPageComponent } from './second-page/second-page.component';
import { D3Neo4jViewerComponent } from '../d3-neo4j-viewer/d3-neo4j-viewer.component';

export const routes: Routes = [
  // existing routes
  { path: '', component: D3Neo4jViewerComponent},
  { path: 'second-page', component: SecondPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
