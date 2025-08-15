rename server.js -> index.js to align with Rafi's repo?
simplify the contents

This component is now done




Order file structure

├── .gitignore
├── Dockerfile
├── Jenkinsfile
├── README.md
├── docker-compose.yml
├── k8s/
│   ├── deployment.yml
│   └── service.yml
├── package.json
└── src/
    └── server.js (or index.js)

Database file structure

├── .gitignore
├── Dockerfile
├── Jenkinsfile
├── README.md
├── docker-compose.yml
├── init.sql
├── k8s/
│   ├── deployment.yml
│   ├── pvc.yml
│   └── service.yml
└── terraform/
    ├── main.tf
    ├── outputs.tf
    └── variables.tf