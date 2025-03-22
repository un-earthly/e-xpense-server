# E-Xpense Application

This is a fully containerized expense tracking application with all required services included.

## Quick Start

1. Install Docker and Docker Compose on your system if you haven't already.

2. Clone this repository:
   ```
   git clone https://github.com/un-earthly/e-xpense-server.git
   cd e-xpense
   ```

3. Start the application:
   ```
   docker-compose up -d
   ```

4. Access the application:
   - API: http://localhost:3000
   - MongoDB (for development): mongodb://localhost:27017
   - RabbitMQ Management UI: http://localhost:15672 (user: guest, password: guest)

## What's Included

- **API Service**: NestJS backend for expense tracking
- **MongoDB**: Database for storing expense data
- **RabbitMQ**: Message broker for asynchronous processing
- **Persistent Storage**: Your data is preserved between restarts

## Development

To make changes to the application:

1. Stop the containers:
   ```
   docker-compose down
   ```

2. Make your changes to the code

3. Rebuild and restart:
   ```
   docker-compose up --build -d
   ```

## Sharing with Others

Others can use this application by:

1. Installing Docker and Docker Compose
2. Cloning the repository or downloading the docker-compose.yml and Dockerfile
3. Running `docker-compose up -d` in the project directory

No additional configuration is needed!