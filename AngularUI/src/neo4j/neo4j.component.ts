import {AfterViewInit, Component, ViewChild} from '@angular/core';
import { CommonModule } from '@angular/common';
import NeoVis, {NeovisConfig} from "neovis.js";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";


@Component({
  selector: 'app-neo4j',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatButtonModule, FormsModule, MatProgressSpinnerModule],
  templateUrl: './neo4j.component.html',
  styleUrl: './neo4j.component.css'
})
export class Neo4jComponent implements AfterViewInit {
  @ViewChild('cypher') cypher: any;

  private readonly defaultCypher = "MATCH (n)-[r:INTERACTS]->(m) RETURN * LIMIT 200";

  viz: NeoVis | undefined;
  cypherQuery: string = this.defaultCypher;

  // TODO: Don't leave these past the demo :)
  private serverUrl: string = 'bolt://localhost:7687';
  private user: string = 'neo4j';
  private password: string = 'password';

  private config: NeovisConfig = {
    containerId: "viz",
    neo4j: {
      serverUrl: this.serverUrl,
      serverUser: this.user,
      serverPassword: this.password,
    },
    labels: {
      Character: {
        label: "name",
        value: "pagerank",
        group: "community",
        [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
          cypher: {
            value: 'MATCH (n) WHERE id(n) = $id RETURN n.size',
          },
          function: {
            title: NeoVis.objectToTitleHtml,
          },
        }
      }
    },
    relationships: {
      INTERACTS: {
        value: "weight"
      }
    },
    initialCypher: this.defaultCypher,
  }

  ngAfterViewInit(): void {
    this.viz = new NeoVis(this.config);
    this.viz.render();
  }

  reset() {
    this.cypherQuery = this.defaultCypher;
    this.reload();
  }

  reload() {
    this.viz?.renderWithCypher(this.cypherQuery);
  }

  stabilize() {
    if(this.viz) {
      this.viz.stabilize();
    }
  }

  get isLoading() {
    return !this.viz || this.viz.network === null;
  }
}
