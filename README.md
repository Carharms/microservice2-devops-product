## Product Service Overview ##
Repository for the REST API that manages the product catalog for our e-commerce platform.

## Setup ##
Install Docker and Docker Compose on your local system.

1. Clone this repository:
git clone <your-repo-url>

2. Navigate to the project directory:
cd product-service

3. Build the Docker image and start the service and its dependencies (like the database) using Docker Compose. The --build flag ensures a fresh image is created.
docker-compose up --build

The service will be available at http://localhost:8080 (or the port specified in the docker-compose.yml file).

## Project Architecture ##
Technology Stack: This service is a RESTful API built with a backend framework.

Database: It connects to a PostgreSQL database to persist product data. The connection details are managed through environment variables to keep sensitive information out of the codebase.

Key Functionality: The API exposes endpoints for managing the product catalog, including operations like:

GET /products: Retrieve a list of all products.

GET /products/{id}: Get details for a specific product.

POST /products: Add a new product to the catalog.

PUT /products/{id}: Update an existing product.

## CI/CD Pipeline ##
The Jenkins pipeline for this service automates the entire process from code commit to deployment:

Build & Test: Code is compiled, and a full suite of unit and integration tests are run.

Containerization: The application is containerized into a Docker image and tagged with a consistent versioning scheme (e.g., v1.2.3 or git-commit-hash).

Image Push: The newly created Docker image is pushed to our Docker Hub container registry.

Deployment: The pipeline then triggers a deployment to the appropriate Kubernetes environment (dev, staging, prod) based on the Git Flow branch that was updated.