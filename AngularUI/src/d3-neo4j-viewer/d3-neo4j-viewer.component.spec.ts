import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3Neo4jViewerComponent } from './d3-neo4j-viewer.component';

describe('D3Neo4jViewerComponent', () => {
  let component: D3Neo4jViewerComponent;
  let fixture: ComponentFixture<D3Neo4jViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3Neo4jViewerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(D3Neo4jViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
