import { ComponentFixture, TestBed } from '@angular/core/testing';

import { D3Neo4jViewerDialogComponent } from './d3-neo4j-viewer-dialog.component';

describe('D3Neo4jViewerDialogComponent', () => {
  let component: D3Neo4jViewerDialogComponent;
  let fixture: ComponentFixture<D3Neo4jViewerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [D3Neo4jViewerDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(D3Neo4jViewerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
