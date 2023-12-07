import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import neo4j from "neo4j-driver";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {CommonModule} from "@angular/common";
import {D3Neo4jViewerDialogComponent} from "../d3-neo4j-viewer-dialog/d3-neo4j-viewer-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {FormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MatInputModule} from "@angular/material/input";

interface Node {
  id: string;
  name: string;
  comment: string | undefined;
  classes: string[];
  uri: string | undefined;
}

interface Link {
  id: string;
  source: any;
  target: any;
  type: string;
}

@Component({
  selector: 'app-d3-neo4j-viewer',
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule
  ],
  templateUrl: './d3-neo4j-viewer.component.html',
  styleUrl: './d3-neo4j-viewer.component.css'
})
export class D3Neo4jViewerComponent {

  @ViewChild('graphContainer', { static: true }) private graphContainer: ElementRef | undefined;

  private _isLoading = false;
  private _isConnected = false;

  private nodes: Node[] = [];
  private links: Link[] = [];

  public serverUrl = 'bolt://localhost:7687';
  public user = 'neo4j';
  public password = 'password';

  private simulation: any;

  private readonly defaultCypher = "MATCH (n:n4sch__Class)-[r]->(m:n4sch__Class) RETURN * LIMIT 10";
  public cypherQuery = this.defaultCypher;

  private driver: any;

  constructor(public dialog: MatDialog) { }

  async useCredentials() {
    this.driver = neo4j.driver(
      this.serverUrl,
      neo4j.auth.basic(
        this.user,
        this.password
      ), {
        maxTransactionRetryTime: 3000
      }
    );

  //   test the connection
    const session = this.driver.session();
    try {
      await session.run("MATCH (n) RETURN n LIMIT 1");
      this._isConnected = true;
    } catch (e) {
      this._isConnected = false;
    } finally {
      await session.close();
    }

    if(this._isConnected) {
      this.fetchAndRender();
    }
  }

  async fetchAndRender() {
    this._isLoading = true;
    await this.populateNodesAndLinks();
    this._isLoading = false;
    this.drawGraph();
  }

  get isLoading() {
    return this._isLoading;
  }

  get isConnected() {
    return this._isConnected;
  }

  private colorGenerator(): any {
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    color.domain(['', 'n4sch__Class', 'owl__Class', 'n4sch__Class owl__Class' || 'owl__Class n4sch__Class']);
    return (d: any): string => {
      return color(d.classes.join(' '));
    };
  }

  private async populateNodesAndLinks(): Promise<any> {

    const session = this.driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.READ
    });

    this.nodes = [];
    this.links = [];
    let nodeIds = new Set();

    try {
      const result = await session.run(this.cypherQuery);
      const records = result.records;

      records.forEach((record: { get: (arg0: string) => any; }) => {
        const sourceNode = record.get('n');
        const targetNode = record.get('m');
        const relationship = record.get('r');

        const sourceResourceClassIndex = sourceNode.labels.indexOf('Resource');
        const targetResourceClassIndex = targetNode.labels.indexOf('Resource');

        if (sourceResourceClassIndex > -1) {
          sourceNode.labels.splice(sourceResourceClassIndex, 1);
        }

        if (targetResourceClassIndex > -1) {
          targetNode.labels.splice(targetResourceClassIndex, 1);
        }

        const sourceNodeData = {
          id: sourceNode.identity.toString(),
          name: sourceNode.properties['n4sch__name'],
          comment: sourceNode.properties['n4sch__comment'],
          classes: sourceNode.labels,
          uri: sourceNode.properties['uri'],
        };

        const targetNodeData = {
          id: targetNode.identity.toString(),
          name: targetNode.properties['n4sch__name'],
          comment: targetNode.properties['n4sch__comment'],
          classes: targetNode.labels,
          uri: targetNode.properties['uri'],
        };

        // Add source node if not already added
        if (!nodeIds.has(sourceNode.identity.toString())) {
          this.nodes.push(sourceNodeData);
          nodeIds.add(sourceNode.identity.toString());
        }

        // Add target node if not already added
        if (!nodeIds.has(targetNode.identity.toString())) {
          this.nodes.push(targetNodeData);
          nodeIds.add(targetNode.identity.toString());
        }

        // Add the relationship
        this.links.push({
          id: relationship.identity.toString(),
          source: sourceNodeData.id,
          target: targetNodeData.id,
          type: relationship.type,
        });
      });
    } finally {
      await session.close();
    }
  }

  private drawGraph(): void {
    const svg = d3.select(this.graphContainer!.nativeElement)
      .attr('width', 800)
      .attr('height', 600);

    const g = svg.append('g');

    const zoom = d3.zoom()
      .scaleExtent([0.25, 5])  // This sets the limits for zooming (min, max)
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const simulation = d3.forceSimulation(this.nodes as d3.SimulationNodeDatum[])
      // @ts-ignore
      .force('link', d3.forceLink(this.links).id(d => d.id))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('collide', d3.forceCollide(20).strength(1))
      .force('center', d3.forceCenter(800 / 2, 600 / 2));

    this.simulation = simulation;

    const links = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', 'black');

    const nodes = g.append('g')
      .attr("class", "nodes")
      .selectAll("g")
      .data(this.nodes)
      .enter().append("g")
        // @ts-ignore
      .call(d3.drag()
          // @ts-ignore
          .on('start', dragstarted)
          // @ts-ignore
          .on('drag', dragged)
          // @ts-ignore
          .on('end', dragended)
      );

    nodes
      .append('circle')
      .attr('r', 15)
      .attr('class', 'node')
      .attr('fill', this.colorGenerator())

    nodes.append("title")
      .text(d => d.name);

    nodes.on('dblclick', (event, d) => {
      event.preventDefault();
      event.stopPropagation();
      this.dialog.open(D3Neo4jViewerDialogComponent, {
        data: d,
      });
    });

    // // Create a text selection
    // nodes
    //   .append("text")
    //   .text(d => d.name) // Assuming 'name' is the text you want to display
    //   .attr("text-anchor", "middle")
    //   .attr("dy", ".35em") // This centers the text vertically
    //   .style("font-size", "10px"); // Adjust font size to fit inside the circle

    simulation.on('tick', () => {
      links
        // @ts-ignore
        .attr('x1', d => d.source.x)
        // @ts-ignore
        .attr('y1', d => d.source.y)
        // @ts-ignore
        .attr('x2', d => d.target.x)
        // @ts-ignore
        .attr('y2', d => d.target.y);

      // nodes
      //   // @ts-ignore
      //   .attr('cx', d => d.x)
        // @ts-ignore
      //   .attr('cy', d => d.y);

      nodes.attr("transform", d => `translate(${d.x}, ${d.y})`);
    });

    function dragstarted(event: { active: any; }, d: { fx: any; x: any; fy: any; y: any; }) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;

      svg.on('.zoom', null); // Disable zooming
    }

    function dragged(event: { x: any; y: any; }, d: { fx: any; fy: any; }) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: { active: any; }, d: { fx: null; fy: null; }) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;

      svg.call(zoom); // Re-enable zooming
    }
  }

  async submitQuery() {
    this.simulation.stop();
    d3.select('svg').selectChild('g').remove();
    await this.fetchAndRender();
  }

  async reset() {
    this.cypherQuery = this.defaultCypher;
    await this.submitQuery();
  }


  stabilize() {
    this.simulation.alpha(1).restart().tick();
  }

}
