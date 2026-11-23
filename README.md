# ☁️ Intent-Based Cloud Network Orchestrator

**Transforming Natural Language Instructions into Cloud Routing Operations**

An intent-based cloud network automation platform that simplifies routing management through natural-language commands. Built using React, Node.js, AWS Lambda and Amazon DynamoDB, it enables users to manage regional server assignments, perform automated rerouting and rollback operations, and monitor changes through an interactive dashboard.

---

## 🚀 Project Overview

Managing cloud network configurations can involve complex operational procedures. This project explores an intent-based approach where users can express routing requirements in simple natural language instead of manually interacting with backend infrastructure.

The system interprets user commands, validates routing instructions and invokes AWS Lambda to perform the requested operations. Amazon DynamoDB maintains routing information and persistent audit records, while the React dashboard displays the current routing state and operation history.

## ✨ Key Features

- **Natural Language Command Processing:** Convert simple text instructions into routing operations using a rule-based NLP parser.
- **Automated Rerouting:** Change server assignments for supported geographical regions.
- **Rollback Mechanism:** Restore a previous routing configuration using recorded operation history.
- **Persistent Audit Logging:** Store routing changes and rollback records in Amazon DynamoDB.
- **Live Routing Dashboard:** Retrieve and display current routing information from AWS.
- **Network Topology Visualization:** Visualize regional routing assignments and available server destinations.
- **Input Validation:** Validate regions, server names and supported operations before execution.
- **AWS Integration:** Execute cloud automation through AWS Lambda and the AWS SDK.

## 🏗️ System Architecture

```text
              USER
                |
                v
       REACT DASHBOARD
                |
                v
       NATURAL LANGUAGE
          COMMAND PARSER
                |
                v
        NODE.JS / EXPRESS
             BACKEND
                |
                v
          AWS LAMBDA
     NetworkAutomationController
                |
          +-----+-----+
          |           |
          v           v
     DYNAMODB     DYNAMODB
   Routing Table  Audit Log
          |           |
          +-----+-----+
                |
                v
       RESPONSE TO DASHBOARD
                |
                v
       UPDATED ROUTING STATE
       AND AUDIT HISTORY
```

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript |
| UI Styling | CSS, Lucide React |
| Backend | Node.js, Express.js |
| Cloud Platform | Amazon Web Services |
| Serverless Compute | AWS Lambda |
| Database | Amazon DynamoDB |
| AWS Integration | AWS SDK for JavaScript |
| Version Control | Git and GitHub |

## 🌐 Supported Routing Configuration

**Regions**
- Europe
- Asia

**Available Servers**
- Server-Alpha-Primary
- Server-Beta-Primary
- Server-Omega

**Supported Operations**
- REROUTE
- ROLLBACK
- GET_STATE

## 💻 Getting Started

### Prerequisites

- Node.js and npm
- Git
- AWS account with access to the required services
- AWS CLI configured with suitable permissions

### 1. Clone the Repository

```bash
git clone https://github.com/raahithya08/Intent-based-cloud-network-orchestrator.git
```

### 2. Navigate to the Project

```bash
cd Intent-based-cloud-network-orchestrator
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

```bash
cd server
npm install
```

### 5. Configure AWS Access

Configure AWS CLI authentication locally with permissions to invoke the existing Lambda function.

Ensure the AWS region is set to:

```text
ap-southeast-2
```

Never store AWS access keys or secret credentials in frontend code or commit them to GitHub.

### 6. Start the Backend

From the `server` directory:

```bash
node index.js
```

The backend runs at:

```text
http://localhost:3001
```

### 7. Start the Frontend

Open another terminal in the project root:

```bash
npm run dev -- --port 5180
```

Open the local Vite URL:

```text
http://localhost:5180
```

## 🧪 Example Commands

**Reroute Europe**

```text
Shift Europe to Server-Omega
```

**Reroute Asia**

```text
Move Asia to Server-Beta-Primary
```

**Rollback Europe**

```text
Rollback Europe
```

## 🖥️ Project Screenshots

### Dashboard Overview
![Dashboard Overview](screenshots/dashboard-overview.png)

### Network Topology
![Network Topology](screenshots/network-topology.png)

### Audit History
![Audit History](screenshots/audit-history.png)

The application validates commands, communicates with the backend and displays the operation result.

## 📊 Dashboard Modules

1. **Network Operations:** Overview of the cloud routing environment.
2. **Regional Routing:** Displays current server assignments.
3. **Command Centre:** Accepts natural-language routing instructions.
4. **Network Topology:** Visualizes logical connections between regions and server destinations.
5. **Audit History:** Displays recorded routing operations and rollback history.

## 🔐 Security Considerations

- AWS credentials are maintained outside the frontend.
- Backend validation restricts supported regions, actions and server destinations.
- AWS Lambda uses an execution role to access the required DynamoDB resources.
- Local development credentials should never be committed to the repository.

## ⚠️ Project Scope

This project is a working prototype demonstrating intent-based routing orchestration and cloud automation. Routing decisions are stored in DynamoDB; the prototype does not configure actual network routes or deploy physical network infrastructure.

## 🔮 Future Enhancements

- Advanced NLP-based intent recognition.
- Multi-region cloud infrastructure support.
- Role-based access control.
- Enhanced monitoring and operational analytics.
- Integration with actual cloud networking resources.

## 👩‍💻 Author

** Raahithya Pampana**

B.Tech – Computer Science and Engineering

GitHub: [@raahithya08](https://github.com/raahithya08)

---

⭐ If you find this project interesting, consider giving the repository a star!

**Built with curiosity, cloud technology and a passion for automation.**
