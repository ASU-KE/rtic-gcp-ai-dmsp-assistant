# DMP AI Assistant Proof-of-Concept

This is an Express service that provides authorization functionality and includes separate folders for features.
It also uses Sequelize ORM with SQLite as the database, along with the JSON Web Token (JWT) and AJV libraries.

## Project Structure

- `index.js`: The main entry point of the application.
- `config.js`: Contains configuration files for the application.
- `authorization`
  - `controllers`: Controller files for authentication endpoints.
  - `schemas`: JSON Schemas against which the body of various routes will be validated.
  - `routes.js`: Registers all the authentication routes.
- `dmp`
  - `controllers`: Controller files for the DMP Assistant endpoints.
  - `schemas`: JSON Schemas against which the body of various routes will be validated.
  - `services`: Service files for accessing and processing DMPTool API endpoints and data.
  - `routes.js`: Registers all the product CRUD routes.
- `users`
  - `controllers`: Controller files for user master CRUD endpoints.
  - `schemas`: JSON Schemas against which the body of various routes will be validated.
  - `routes.js`: Registers all the user CRUD routes.
- `common`
  - `middlewares`: Various middlewares that can be used in various routes like (isAuthenticated, CheckPermissions etc.)
  - `models`: Sequelise models for the User Table
- `storage`: Local storage, that stores all the SQLite tables.

## Prerequisites

Before running the application, make sure you have the following installed:

1. NodeJS (v18)
2. NPM (v9)

## Installation

1. Clone the repository: `git clone https://github.com/ASU-KE/dmp-ai-assistant-poc`
2. Navigate to the project directory: `cd dmp-ai-assistant-poc`
3. Install the dependencies: `npm install`

## Usage

To start the service, run the following command:

```shell
npm start
```
