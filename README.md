# Smart Grid Communication & Knowledge Graph (SG_Comm)

A comprehensive repository for knowledge graph work in Power Grid Systems, focusing on cybersecurity threat detection, link prediction, and semantic analysis of smart grid communications.

## 🎯 Project Overview

This repository contains a complete framework for building and analyzing knowledge graphs in power grid systems, with specific focus on:
- **Cybersecurity threat detection** using knowledge graphs
- **Link prediction** for identifying potential attack vectors
- **Semantic analysis** of smart grid communications
- **Power grid ontology** modeling and validation
- **Attack pattern analysis** using MITRE ATT&CK framework

## 📁 Repository Structure

```
SG_Comm/
├── AngularUI/                    # Angular-based web interface
├── Attack-detection/             # ML models for attack detection
├── KG_Link_Pred/                 # Knowledge graph link prediction
│   ├── Ontology/                 # Power grid ontologies
│   ├── Security_KG/              # Security knowledge graphs
│   ├── Power_Grid_Ontologies/    # OWL/RDF ontologies
│   └── attack-stix-data/         # MITRE ATT&CK STIX data
├── neo4j/                        # Neo4j database setup
├── ontopowsys/                   # Power system ontologies
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Neo4j Database 4.4+
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/SG_Comm.git
   cd SG_Comm
   ```

2. **Set up Python environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Install Neo4j dependencies**
   ```bash
   # Copy jars to Neo4j plugins directory
   cp neo4j/jars/*.jar $NEO4J_HOME/plugins/
   ```

4. **Set up Angular UI**
   ```bash
   cd AngularUI
   npm install
   ng serve
   ```

5. **Load Neo4j database**
   ```bash
   # Load the pre-built database
   neo4j-admin database load --from-path=neo4j/neo4j.dump
   ```

## 📊 Knowledge Graph Components

### 1. Power Grid Ontology
- **Core Ontology**: Basic power system components (substations, equipment, connections)
- **Generation Ontology**: Power generation units and plants
- **Prosumers Ontology**: Distributed energy resources and smart devices
- **Wire Ontology**: Network topology and electrical connections

### 2. Security Knowledge Graph
- **MITRE ATT&CK Integration**: Complete enterprise attack patterns
- **Attack Embeddings**: Vector representations of attack techniques
- **Malware Analysis**: Software-based attack vectors
- **Campaign Tracking**: Coordinated attack campaigns

### 3. Link Prediction Models
- **Node Embeddings**: Using Node2Vec, DeepWalk, and GraphSAGE
- **Similarity Analysis**: Cosine similarity and Jaccard index
- **ML Models**: Random Forest, XGBoost, and Neural Networks
- **Validation**: Cross-validation and AUC-ROC metrics

## 🔧 Key Features

### Knowledge Graph Construction
- **STIX Data Integration**: Automated ingestion of MITRE ATT&CK data
- **Ontology Mapping**: Semantic alignment between power grid and security concepts
- **Graph Embeddings**: High-dimensional vector representations
- **Temporal Analysis**: Time-based attack pattern evolution

### Attack Detection
- **Anomaly Detection**: Unsupervised learning for unknown threats
- **Signature-based Detection**: Known attack pattern matching
- **Behavioral Analysis**: User and entity behavior analytics (UEBA)
- **Real-time Monitoring**: Stream processing for live threat detection

### Visualization & Analysis
- **Interactive Graphs**: D3.js-based network visualizations
- **Temporal Views**: Time-series analysis of attacks
- **Geospatial Mapping**: Geographic threat distribution
- **Risk Scoring**: Quantitative risk assessment

## 📈 Usage Examples

### Loading Security Knowledge Graph
```python
from py2neo import Graph
from KG_Link_Pred.Security_KG_Loading import load_security_kg

# Connect to Neo4j
graph = Graph("bolt://localhost:7687", auth=("neo4j", "password"))

# Load MITRE ATT&CK data
load_security_kg(graph, "attack-stix-data/enterprise-attack/")
```

### Running Link Prediction
```python
from KG_Link_Pred.Possible_Link_Prediction import predict_links

# Predict potential attack vectors
predictions = predict_links(
    graph=graph,
    source_node="T1566.001",
    embedding_file="embeddings.csv"
)
```

### Attack Detection Pipeline
```python
from Attack_detection.Dataset1 import detect_attacks

# Run attack detection
results = detect_attacks(
    dataset="smart_grid_stability_augmented.csv",
    model_type="xgboost"
)
```

## 🎨 Web Interface

The Angular-based web interface provides:
- **Interactive Knowledge Graph Visualization**
- **Attack Pattern Explorer**
- **Real-time Threat Dashboard**
- **Ontology Browser**
- **Link Prediction Interface**

Access at: `http://localhost:4200`

## 📊 Datasets

### Power Grid Data
- **Power Grid Stability**: 10,000+ grid stability measurements
- **Network Topology**: Complete power grid network structure
- **Load Profiles**: Historical load consumption data
- **Generation Data**: Renewable and traditional generation sources

### Security Data
- **MITRE ATT&CK**: Complete enterprise attack matrix
- **STIX Objects**: Structured threat intelligence
- **Attack Campaigns**: Coordinated attack scenarios
- **Malware Signatures**: Software-based attack indicators

## 🔍 Research Applications



### Use Cases
- **Utility Companies**: Grid security monitoring
- **Research Institutions**: Power system cybersecurity research
- **Government Agencies**: Critical infrastructure protection
- **Cybersecurity Vendors**: Threat intelligence platforms

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MITRE ATT&CK Team** for comprehensive threat intelligence
- **Neo4j Team** for graph database technology
- **Power Grid Community** for ontology standards
- **Open Source Contributors** for various libraries and tools

---

**Note**: This is an active research project. Features and APIs may change between versions. Please check the [releases] for stable versions.
