# PriceWise — Grocery Price Comparison Web App

PriceWise is a full-stack grocery price comparison application built as my **BSc (Hons) Computing (Software Development) thesis project**.

It collects product data from Greek supermarket websites, normalises and stores it in PostgreSQL, groups comparable products, and presents price comparisons through a React interface.

The project combines full-stack development, web scraping, database design, scheduled data collection, real-time updates, multilingual UI, and privacy-conscious product decisions.

## Live Application

**Live demo:**  
https://pricewise-web-production.up.railway.app

**Portfolio case study:**  
https://emmatsak.github.io/portfolio/projects/pricewise

**Repository:**  
https://github.com/EmmaTsak/pricewise-app

---

## What I Built

PriceWise includes:

- Product search and filtering
- Supermarket price comparison
- Product grouping for comparable items
- Scheduled supermarket-specific scraping
- PostgreSQL data storage with Prisma
- Shopping list functionality
- Local shopping-list storage without mandatory accounts
- Optional shopping-list delivery by email
- English and Greek interface with `react-i18next`
- Socket.IO notifications after product-data refreshes
- Dockerized frontend, backend, and PostgreSQL database

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Query
- react-i18next
- Socket.IO Client
- React Router
- Tailwind CSS

### Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Socket.IO
- Nodemailer
- node-cron
- node-cache

### Data Collection

- Playwright
- Cheerio
- Axios
- Puppeteer
- Source-specific supermarket scrapers

### Infrastructure

- Docker
- Docker Compose
- Nginx
- PostgreSQL 16

---

## Architecture

```text
Supermarket websites
        ↓
Source-specific scrapers
        ↓
Data cleaning / normalisation
        ↓
PostgreSQL + Prisma
        ↓
Node.js / Express API
        ↓
React + TypeScript frontend
        ↓
Search · Comparison · Shopping list
```

The scheduled update flow works separately from normal user searches:

```text
Scheduled scraper job
        ↓
Collect supermarket data
        ↓
Normalise and store products
        ↓
Database refresh
        ↓
Socket.IO event
        ↓
Connected frontend refresh
```

---

## Engineering Decisions

### Scheduled Scraping Instead of Per-Search Scraping

Scraping supermarket websites during every user search would make the application slow and tightly couple user requests to external website availability.

PriceWise instead collects supermarket data through scheduled jobs and stores the results in PostgreSQL.

Users search the stored data rather than waiting for external websites to respond during every request.

This also allows scraping frequency to be controlled independently from normal application traffic.

---

### Account-Free Shopping List

The main PriceWise workflow does not require user accounts.

Shopping-list data is stored locally in the browser so users can use the core feature without providing personal information or creating credentials.

Email delivery is optional.

This keeps the application simpler while reducing unnecessary personal-data collection.

---

### Product Grouping

Products collected from different supermarkets do not share one universal product identifier.

The application therefore needs to normalise product information and group similar products before useful price comparisons can be shown.

This introduces challenges such as:

- different product naming conventions
- brand variations
- different quantities
- inconsistent categories
- different supermarket page structures

Product grouping is therefore a separate part of the data-processing workflow rather than only a frontend presentation concern.

---

### Source-Specific Scrapers

Supermarket websites use different HTML structures and loading strategies.

PriceWise therefore uses source-specific scraper logic rather than assuming that one generic scraper can reliably process every website.

Dynamic websites can require browser automation with Playwright, while other content can be processed with HTTP requests and HTML parsing.

---

### Real-Time UI Refresh

Socket.IO is used to notify connected clients when product data has been refreshed.

This allows the frontend to react to backend data updates without requiring users to manually reload the page.

---

## Testing and Evaluation

The thesis evaluation primarily used **manual testing**.

The application was checked for:

- frontend navigation and behaviour
- product search
- filtering
- supermarket comparison
- adding and removing shopping-list items
- local shopping-list persistence
- optional email delivery
- English/Greek language switching
- backend API endpoints
- database connectivity
- scraper behaviour
- Socket.IO refresh behaviour
- error handling

### Playwright

Playwright is used in this project for **dynamic web scraping**.

It is not presented as end-to-end frontend test automation.

Automated unit and integration testing was identified as an important future improvement.

Potential automated test areas include:

- product normalisation
- product grouping
- scraper data cleaning
- API endpoints
- shopping-list logic
- frontend utility functions

---

## Project Status

PriceWise is a **functional academic prototype**.

The project demonstrates the complete flow from external supermarket data collection through backend processing and database storage to the user-facing comparison interface.

Because supermarket websites are external dependencies, scraper selectors and collection logic may require maintenance when those websites change.

---

# Local Setup

The easiest way to run PriceWise locally is with Docker.

## Prerequisites

Install:

- Git
- Docker Desktop
- Docker Compose

For development without Docker, you will also need:

- Node.js
- npm
- PostgreSQL

The backend Docker image uses Node.js 20.

The frontend build uses Node.js 22.

---

## Clone the Repository

```bash
git clone https://github.com/EmmaTsak/pricewise-app.git
cd pricewise-app
```

The main project structure is:

```text
pricewise-app/
├── client-api/
├── frontend/
├── docker-compose.yml
└── README.md
```

---

# Running with Docker

Docker runs:

- PostgreSQL
- the Node.js/Express backend
- the React frontend through Nginx

## 1. Configure the Backend Environment

The repository contains:

```text
client-api/.env.example
```

Copy it to:

```text
client-api/.env
```

### Windows PowerShell

```powershell
Copy-Item client-api/.env.example client-api/.env
```

### macOS / Linux

```bash
cp client-api/.env.example client-api/.env
```

The example configuration is:

```env
PORT=5000

POSTGRES_USER=pricewise
POSTGRES_PASSWORD=your_database_password_here
POSTGRES_DB=pricewise

DATABASE_URL=postgresql://pricewise:your_database_password_here@database:5432/pricewise

CORS_ORIGINS=http://localhost:8080

SCRAPER_CRON=0 */24 * * *
ENABLE_SCRAPERS=false
RUN_SCRAPE_ON_START=false

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here
```

Change:

```env
POSTGRES_PASSWORD=your_database_password_here
```

to a local development password.

Use the same password inside:

```env
DATABASE_URL
```

For example:

```env
POSTGRES_PASSWORD=pricewise_local_password

DATABASE_URL=postgresql://pricewise:pricewise_local_password@database:5432/pricewise
```

Do not commit your real `.env` file.

---

## Environment Variables

### `PORT`

Backend API port.

Default:

```text
5000
```

### `POSTGRES_USER`

PostgreSQL username used by the Docker database.

### `POSTGRES_PASSWORD`

Password for the PostgreSQL user.

Use a development value locally and do not commit real credentials.

### `POSTGRES_DB`

Name of the PostgreSQL database.

Default:

```text
pricewise
```

### `DATABASE_URL`

Prisma database connection string.

Inside Docker, the PostgreSQL service is available through the Docker service name:

```text
database
```

Example:

```env
DATABASE_URL=postgresql://pricewise:pricewise_local_password@database:5432/pricewise
```

### `CORS_ORIGINS`

Frontend origins allowed to communicate with the API.

Docker frontend:

```env
CORS_ORIGINS=http://localhost:8080
```

### `SCRAPER_CRON`

Controls the scheduled scraper job.

Example:

```env
SCRAPER_CRON=0 */24 * * *
```

### `ENABLE_SCRAPERS`

Controls whether scheduled scraping is enabled.

For normal local development:

```env
ENABLE_SCRAPERS=false
```

### `RUN_SCRAPE_ON_START`

Controls whether scraping should begin when the backend starts.

For normal development:

```env
RUN_SCRAPE_ON_START=false
```

### Email Variables

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here
```

These are used only for optional shopping-list email delivery.

If you use Gmail, use an **App Password**, not your normal Gmail password.

The rest of the application can run without email delivery being configured.

---

## 2. Build and Start the Application

From the repository root:

```bash
docker compose up --build
```

Docker starts three services:

```text
pricewise-database
pricewise-backend
pricewise-frontend
```

The first build can take longer because the backend image installs Playwright and Chromium dependencies.

---

## 3. Prepare the Database

After the containers are running, open another terminal in the project root.

Run:

```bash
docker exec -it pricewise-backend npx prisma db push
```

This applies the Prisma schema to PostgreSQL.

The Prisma client is already generated during the backend Docker build, but it can also be generated manually if needed:

```bash
docker exec -it pricewise-backend npx prisma generate
```

---

## 4. Access the Application

Frontend:

```text
http://localhost:8080
```

Backend API:

```text
http://localhost:5000
```

PostgreSQL is exposed to the host on:

```text
localhost:5433
```

Inside the Docker network, the backend connects to PostgreSQL using:

```text
database:5432
```

---

## 5. Stop the Application

Press:

```text
CTRL + C
```

in the terminal running Docker Compose.

Then run:

```bash
docker compose down
```

---

## Reset the Local Database

To stop the application and remove its persistent PostgreSQL volume:

```bash
docker compose down -v
```

Then rebuild:

```bash
docker compose up --build
```

Recreate the database schema:

```bash
docker exec -it pricewise-backend npx prisma db push
```

> `docker compose down -v` deletes local database data.

---

# Running Without Docker

You can also run the frontend and backend directly during development.

You will need:

- Node.js
- npm
- PostgreSQL

---

## Backend Setup

Move into the backend:

```bash
cd client-api
```

Install dependencies:

```bash
npm install
```

Copy the environment example:

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS / Linux

```bash
cp .env.example .env
```

For local non-Docker development, change the `DATABASE_URL`.

The Docker configuration uses:

```env
DATABASE_URL=postgresql://pricewise:your_database_password_here@database:5432/pricewise
```

For PostgreSQL installed directly on your machine, use:

```env
DATABASE_URL=postgresql://pricewise:your_database_password_here@localhost:5432/pricewise
```

Also allow the Vite development frontend:

```env
CORS_ORIGINS=http://localhost:5173
```

Generate Prisma:

```bash
npm run prisma:generate
```

Apply the schema:

```bash
npx prisma db push
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```text
http://localhost:5000
```

---

## Frontend Setup

Open another terminal.

Move into:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

The repository contains:

```text
frontend/.env.example
```

Copy it:

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### macOS / Linux

```bash
cp .env.example .env
```

For local development, change the values to:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Start Vite:

```bash
npm run dev
```

The development frontend runs at:

```text
http://localhost:5173
```

---

# Using PriceWise

Once the application is running:

1. Open the frontend.
2. Search for a grocery product.
3. Use the available filters to narrow the results.
4. Open a comparable product group.
5. Compare supermarket prices.
6. Add a product to the shopping list.
7. Open the shopping-list page to review saved products.
8. Optionally send the shopping list by email if email settings are configured.

The shopping list does not require an account.

---

# Scraping

PriceWise collects product data from external supermarket websites.

Scraping is deliberately separated from normal user searches.

By default, the example environment disables scraper execution:

```env
ENABLE_SCRAPERS=false
RUN_SCRAPE_ON_START=false
```

This is useful for normal local development.

If scraper execution is enabled, keep in mind that:

- external supermarket websites can change
- HTML selectors may become outdated
- dynamically loaded pages may require browser automation
- network failures can interrupt scraping
- an individual scraper may fail while others continue
- collection can take significantly longer than normal API requests

Scraping should be used responsibly and at a controlled frequency.

---

# Email Delivery

Shopping-list email delivery is optional.

Required variables:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here
```

If these values are not configured, the rest of PriceWise can still be used normally.

Do not commit real SMTP credentials.

---

# Troubleshooting

## Port Already in Use

Docker uses:

```text
Frontend: 8080
Backend: 5000
Database host port: 5433
```

Vite local development uses:

```text
Frontend: 5173
```

If a port is already in use, stop the conflicting application or change the relevant port mapping.

For example:

```yaml
ports:
  - "8081:80"
```

would make the Docker frontend available at:

```text
http://localhost:8081
```

---

## Docker Does Not Start

Check:

1. Docker Desktop is running.
2. WSL2 is available if using Docker Desktop on Windows.
3. Hardware virtualisation is enabled.
4. No existing container is already using the configured ports.

Then retry:

```bash
docker compose up --build
```

---

## Database Tables Do Not Exist

Run:

```bash
docker exec -it pricewise-backend npx prisma db push
```

Then restart the backend if necessary:

```bash
docker compose restart backend
```

---

## Backend Cannot Connect to PostgreSQL

For Docker, `DATABASE_URL` must use:

```text
database:5432
```

not:

```text
localhost:5433
```

because `database` is the PostgreSQL service name inside the Docker network.

Example:

```env
DATABASE_URL=postgresql://pricewise:pricewise_local_password@database:5432/pricewise
```

When running the backend directly on the host machine instead, use:

```text
localhost:5432
```

or the port used by your local PostgreSQL installation.

---

## Frontend Cannot Reach the Backend

For local Vite development:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

For the Docker frontend, these values are supplied as build arguments by `docker-compose.yml`.

Confirm that the backend is running on:

```text
http://localhost:5000
```

---

## Email Sending Does Not Work

Check the backend `.env`:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here
```

For Gmail, use a Gmail App Password rather than your normal account password.

---

## Scraper Data Is Not Updating

Check:

```env
ENABLE_SCRAPERS
RUN_SCRAPE_ON_START
SCRAPER_CRON
```

Also remember that supermarket websites are external dependencies.

Changes to their page structure can require updates to scraper selectors or data-extraction logic.

---

## Docker Build Takes a Long Time

This can be normal on the first backend build.

The backend Docker image installs Chromium and the browser dependencies required by Playwright.

Later builds can be faster because Docker reuses cached layers.

---

# Folder Structure

A simplified view of the repository:

```text
pricewise-app/
├── client-api/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── scrapers/
│   │   ├── services/
│   │   ├── sockets/
│   │   └── utils/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── client/
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## Backend

```text
client-api/
```

Contains:

- Express API
- Prisma configuration
- PostgreSQL integration
- scraper orchestration
- product processing
- email delivery
- Socket.IO server
- scheduled jobs

---

## Prisma Schema

```text
client-api/prisma/schema.prisma
```

Defines the PostgreSQL data model.

---

## Scrapers

```text
client-api/src/scrapers/
```

Contains supermarket-specific collection logic.

---

## Controllers and Routes

```text
client-api/src/controllers/
client-api/src/routes/
```

Contain the backend request-handling and API routing logic.

---

## Frontend

```text
frontend/
```

Contains the React + TypeScript application.

The frontend is built with Vite and served through Nginx in the Docker environment.

---

# Security and Privacy Notes

PriceWise was designed to minimise unnecessary user-data collection.

The core comparison and shopping-list workflow does not require an account.

Repository rules:

- real `.env` files should not be committed
- database credentials should remain outside source control
- SMTP credentials should remain outside source control
- Gmail App Passwords should never be committed
- production credentials should be managed by the deployment platform

The environment files included in the repository contain placeholders only.

---

# Known Limitations

PriceWise is an academic prototype rather than a commercial price-comparison platform.

Current limitations include:

- scraper reliability depends on external supermarket websites
- changes to supermarket HTML can require scraper maintenance
- matching similar products across supermarkets is inherently imperfect
- product data is not guaranteed to be continuously real-time
- automated unit and integration test coverage is a future improvement
- some production-level monitoring and operational tooling is outside the project scope

---

# Future Improvements

Potential next iterations include:

- stronger product matching and normalisation
- automated unit tests
- automated integration tests
- more supermarket sources
- historical price tracking
- price-change notifications
- improved scraper monitoring
- additional usability testing
- offline-friendly mobile shopping-list functionality
- further performance optimisation

---

# Academic Context

PriceWise was developed as part of my **BSc (Hons) Computing (Software Development)** work.

The project allowed me to apply:

- full-stack software development
- frontend development with React and TypeScript
- REST API development
- relational database design
- Prisma ORM
- web scraping
- data normalisation
- scheduled background processing
- Docker
- real-time communication with Socket.IO
- UI/UX research and design
- multilingual interface development
- manual software testing
- privacy-conscious application design

The associated case study and thesis provide more detail about the research, requirements, implementation, testing, and design decisions.

---

# Author

**Emmanouela Tsakalidou**

GitHub:  
https://github.com/EmmaTsak

Portfolio:  
https://emmatsak.github.io/portfolio

---

## Disclaimer

PriceWise is an academic and portfolio project.

Supermarket names, websites, product information, and pricing data belong to their respective owners.

The project is not affiliated with or endorsed by the supermarkets whose publicly available product information may be processed by the application.
