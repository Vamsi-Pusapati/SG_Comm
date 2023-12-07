import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import NeoVis, {NeovisConfig, OldLabelConfig} from "neovis.js";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import neo4j, {Session} from "neo4j-driver";
// import * as popoto from "popoto";
import * as d3 from "d3";
import {drag} from "d3";

interface Node {
  id: string;
  name: string;
  comment: string | undefined;
  uri: string | undefined;
  x: any;
  y: any;
}

interface Link {
  id: string;
  source: Node;
  target: Node;
  type: string;
}

@Component({
  selector: 'app-neo4j',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatButtonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './neo4j.component.html',
  styleUrl: './neo4j.component.css'
})
export class Neo4jComponent implements AfterViewInit {

  @ViewChild('graphContainer', { static: true }) private graphContainer: ElementRef | undefined;

  private readonly defaultCypher = "MATCH (n:n4sch__Class)-[r]->(m:n4sch__Class) RETURN * LIMIT 10";

  nodes: Node[] = [];
  links: Link[] = [];

  // viz: NeoVis | undefined;
  // cypherQuery: string = this.defaultCypher;

  // TODO: Don't leave these past the demo :)
  private serverUrl: string = 'bolt://localhost:7687';
  private user: string = 'neo4j';
  private password: string = 'password';

  private driver = neo4j.driver(
    this.serverUrl,
    neo4j.auth.basic(
      this.user,
      this.password
    ), {
      maxTransactionRetryTime: 3000
    }
  );

  get svg() {
    return d3.select(this.graphContainer?.nativeElement);
  }

  getSession() {
    return this.driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.READ
    });
  }


  async queryDB(query: string): Promise<void> {
    this.nodes = [];
    this.links = [];
    let nodeIds = new Set();

    const session = this.getSession();

    try {
      const result = await session.run(query);
      const records = result.records;

      records.forEach(record => {
        const sourceNode = record.get('n');
        const targetNode = record.get('m');
        const relationship = record.get('r');

        // Add source node if not already added
        if (!nodeIds.has(sourceNode.identity.toString())) {
          this.nodes.push({
            id: sourceNode.identity.toString(),
            name: sourceNode.properties['n4sch__name'],
            comment: sourceNode.properties['n4sch__comment'],
            uri: sourceNode.properties['uri'],
            x: undefined,
            y: undefined,
          });
          nodeIds.add(sourceNode.identity.toString());
        }

        // Add target node if not already added
        if (!nodeIds.has(targetNode.identity.toString())) {
          this.nodes.push({
            id: targetNode.identity.toString(),
            name: sourceNode.properties['n4sch__name'],
            comment: sourceNode.properties['n4sch__comment'],
            uri: sourceNode.properties['uri'],
            x: undefined,
            y: undefined,
          });
          nodeIds.add(targetNode.identity.toString());
        }

        // Add the relationship
        this.links.push({
          id: relationship.identity.toString(),
          source: sourceNode,
          target: targetNode,
          type: relationship.type,
        });
      });
    } finally {
      await session.close();
    }
  }

  forceDirectedGraph() {
    if (!this.graphContainer) {
      throw new Error('Graph container not found');
    }

    const width = this.graphContainer.nativeElement.clientWidth;
    const height = this.graphContainer.nativeElement.clientHeight;

    const svg = d3.select(this.graphContainer.nativeElement)

    const simulation = d3.forceSimulation(this.nodes as d3.SimulationNodeDatum[])
      .force("charge", d3.forceManyBody())
      //@ts-ignore
      .force("link", d3.forceLink(this.links).id(d => d.id))
      .force("center", d3.forceCenter());

    const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(this.links)
      .join("line")

    let node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(this.nodes)
      .join("circle")
      .attr("r", 5)
      .attr("fill", "red")

    node.append("title")
      .text(d => d.name);

    simulation.nodes(this.nodes);
    // @ts-ignore
    simulation.force("link").links(this.links);
    simulation.alpha(1).restart().tick();
    ticked(); // render now!

    function ticked() {
      node.attr("cx", d => d.x)
        .attr("cy", d => d.y);

      link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    }

    // const zoom = d3.zoom()
    //   .on('zoom', (event) => {
    //     this.svg.attr('transform', event.transform);
    //   });
    //
    // this.svg.call(zoom);
  }


  // private config: NeovisConfig = {
  //   containerId: "viz",
  //   consoleDebug: true,
  //   neo4j: {
  //     serverUrl: this.serverUrl,
  //     serverUser: this.user,
  //     serverPassword: this.password,
  //   },
  //   visConfig: {
  //     nodes: {
  //       shape: 'square',
  //       shadow: true,
  //     },
  //   },
  //   labels: {
  //     //@ts-ignore
  //     "n4sch__Class": <OldLabelConfig> {
  //       caption: 'n4sch__name',
  //     }
  //   },
  //   initialCypher: this.defaultCypher,
  // }

  async ngAfterViewInit(): Promise<void> {
    await this.queryDB(this.defaultCypher);

    this.forceDirectedGraph();

    // // Example of adding nodes with hover labels
    // const node = this.g!.selectAll('.node')
    //   .data(nodes)
    //   .enter().append('circle')
    //   .attr('class', 'node')
    //   .attr('r', 5)
    //   // .style('fill', d => colorScale(d.class)) // colorScale based on class
    //   .on('mouseover', function(event, d) {
    //     // Show label popup
    //     // You can use D3 or Angular to create and position the label
    //   })
    //   .on('mouseout', function() {
    //     // Hide label popup
    //   });

    // popoto.runner.DRIVER = this.driver;
    //
    // popoto.provider.node.Provider = {
    //   "n4sch__Class": {
    //     "returnAttributes": ["n4sch__name", "n4sch__comment"],
    //     //@ts-ignore
    //     "constraintAttribute": "n4sch__name",
    //     "autoExpandRelations": true,
    //   }
    // }
    //
    // //@ts-ignore
    // popoto.logger.LEVEL = popoto.logger.LEVEL.DEBUG;
    // this.driver.verifyConnectivity().then(function () {
    //   popoto.start('n4sch__Class');
    // }).catch(function (error) {
    //   // Handle error...
    // })
    // this.viz = new NeoVis(this.config);
    // this.viz.render();
  }
  //
  // reset() {
  //   this.cypherQuery = this.defaultCypher;
  //   this.reload();
  // }
  //
  // reload() {
  //   this.viz?.renderWithCypher(this.cypherQuery);
  //   console.log(this.viz?.nodes.getDataSet());
  // }
  //
  // stabilize() {
  //   if(this.viz) {
  //     this.viz.stabilize();
  //   }
  // }
  //
  // get isLoading() {
  //   return !this.viz || this.viz.network === null;
  // }
}
