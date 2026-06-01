# PriceWise – Grocery Price Comparison Web App

PriceWise is a full-stack grocery price comparison application that helps users compare product prices across Greek supermarkets. It collects product data through automated scraping, stores it in a PostgreSQL database, and displays the results in a modern React web interface.

The application includes:

* Product search and filtering
* Supermarket price comparison
* Product grouping for similar items
* Shopping list functionality
* Email sending for shopping lists
* Real-time price update notifications using Socket.IO
* Scheduled scraping for updated prices

---

## 1. Project Title & Short Description

# PriceWise

PriceWise is a grocery price comparison tool built with:

* React + TypeScript frontend
* Node.js + Express backend
* PostgreSQL database
* Prisma ORM
* Docker
* Web scraping scripts for supermarket product data

The goal of the project is to help users search for grocery products, compare prices between supermarkets, and create a shopping list.

---

## 2. Prerequisites

Before running the application, install the following tools.

### 2.1 Node.js

Node.js allows the application to run JavaScript/TypeScript code outside the browser.

Install Node.js version 18 or higher.

Recommended: Node.js 20 LTS or newer.

Official download page:

```text
https://nodejs.org/en/download
```

After installing Node.js, open a terminal and check that it works:

```bash
node -v
```

You should see something like:

```bash
v20.x.x
```

Also check npm:

```bash
npm -v
```

npm is installed automatically with Node.js.

---

### 2.2 Docker Desktop

Docker Desktop is recommended because it can run the database and application containers without requiring the user to manually install PostgreSQL.

Official Docker Desktop download page:

```text
https://www.docker.com/products/docker-desktop/
```

Download the correct version for your computer:

* Windows: Docker Desktop for Windows
* macOS Apple Silicon: Mac with M1/M2/M3/M4 chip
* macOS Intel: Older Mac with Intel processor

After installation, open Docker Desktop and keep it running.

To check that Docker works, open a terminal and run:

```bash
docker --version
```

Then check Docker Compose:

```bash
docker compose version
```

Some older systems may use this command instead:

```bash
docker-compose --version
```

---

### 2.3 Git Optional

Git is optional because this project is provided as a ZIP file.

Install Git only if you want to clone the project from a repository.

Official Git download page:

```text
https://git-scm.com/install
```

Check Git installation:

```bash
git --version
```

---

### 2.4 Modern Web Browser

Use one of the following browsers:

* Google Chrome
* Microsoft Edge
* Mozilla Firefox

---

## 3. Download and Extract

If you received the project as a ZIP file, follow these steps.

### Windows

1. Locate the ZIP file, for example:

```text
PriceWise.zip
```

2. Right-click the ZIP file.

3. Select:

```text
Extract All...
```

4. Choose a simple folder location, for example:

```text
C:\Projects\PriceWise
```

5. After extraction, open the extracted folder.

The project should look similar to this:

```text
PriceWise/
├── client-api/
├── frontend/
├── docker-compose.yml
└── README.md
```

---

### macOS

1. Locate the ZIP file in Finder.

2. Double-click the ZIP file.

3. macOS will extract it automatically.

4. Move the extracted folder somewhere simple, for example:

```text
Documents/Projects/PriceWise
```

The project should look similar to this:

```text
PriceWise/
├── client-api/
├── frontend/
├── docker-compose.yml
└── README.md
```

---

## 4. Environment Configuration

The application uses environment variables for database connection settings, backend settings, scraping schedule, and email configuration.

There are two parts:

```text
client-api/
```

This is the backend.

```text
frontend/
```

This is the frontend.

---

### 4.1 Backend Environment File

Create a file named:

```text
.env
```

inside:

```text
client-api/
```

Example path:

```text
PriceWise/client-api/.env
```

Use this example content:

```env
PORT=5000

DATABASE_URL="postgresql://pricewise:pricewise_password@localhost:5433/pricewise"

CORS_ORIGINS="http://localhost:5173,http://localhost:8080"

SCRAPER_CRON="0 0 * * *"
RUN_SCRAPE_ON_START="false"

EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER=""
EMAIL_PASS=""
```

Explanation:

```text
PORT
```

The port used by the backend API. This project uses port 5000.

```text
DATABASE_URL
```

The PostgreSQL database connection string.

```text
CORS_ORIGINS
```

The frontend addresses that are allowed to communicate with the backend.

```text
SCRAPER_CRON
```

Controls when the scraping cycle runs. By default, the scraping cycle runs once per day.

```text
RUN_SCRAPE_ON_START
```

If set to `true`, the backend will run the scrapers immediately when it starts.

```text
EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
```

Used for sending the shopping list by email.

If you do not configure email credentials, the application can still run, but the email shopping list feature will not work.

Important:

Do not share real email passwords publicly. If using Gmail, use a Gmail App Password, not your normal Gmail password.

---

### 4.2 Frontend Environment File

Create a file named:

```text
.env
```

inside:

```text
frontend/
```

Example path:

```text
PriceWise/frontend/.env
```

Use this content:

```env
VITE_API_BASE_URL="http://localhost:5000"
VITE_SOCKET_URL="http://localhost:5000"
```

Explanation:

```text
VITE_API_BASE_URL
```

The address of the backend API.

```text
VITE_SOCKET_URL
```

The address used by Socket.IO for real-time updates.

---

### 4.3 Important Docker Note

The provided Docker setup already defines many environment variables inside:

```text
docker-compose.yml
```

For Docker, the backend uses the internal database address:

```env
DATABASE_URL=postgresql://pricewise:pricewise_password@database:5432/pricewise
```

For local non-Docker development, the backend uses the host address:

```env
DATABASE_URL=postgresql://pricewise:pricewise_password@localhost:5433/pricewise
```

This difference is normal.

---

## 5. Running the Application with Docker Recommended

This is the easiest and recommended method.

Docker will run:

* PostgreSQL database
* Node.js backend
* React frontend served through Nginx

The first build may take several minutes because Docker needs to download images, install dependencies, build the frontend, build the backend, and install browser dependencies for scraping.

---

### 5.1 Start Docker Desktop

1. Open Docker Desktop.
2. Wait until Docker says it is running.
3. Keep Docker Desktop open.

---

### 5.2 Open a Terminal in the Project Root Folder

The project root folder is the folder that contains:

```text
docker-compose.yml
```

Example:

```text
PriceWise/
├── client-api/
├── frontend/
└── docker-compose.yml
```

---

### Windows

Open the project folder, click the address bar, type:

```text
cmd
```

Then press Enter.

A terminal will open in the correct folder.

You can check that you are in the correct folder by running:

```bash
dir
```

You should see:

```text
client-api
frontend
docker-compose.yml
```

---

### macOS

Open Terminal.

Move into the project folder. Example:

```bash
cd ~/Documents/Projects/PriceWise
```

Check the files:

```bash
ls
```

You should see:

```text
client-api
frontend
docker-compose.yml
```

---

### 5.3 Build and Start the Application

From the project root folder, run:

```bash
docker compose up --build
```

If your system uses the older Docker Compose command, run:

```bash
docker-compose up --build
```

Wait until the containers finish building and starting.

The first build can take several minutes.

---

### 5.4 Prepare the Database

After the containers are running, open a second terminal in the same project root folder.

Run:

```bash
docker exec -it pricewise-backend npx prisma db push
```

This creates the database tables from the Prisma schema.

Then generate the Prisma client if needed:

```bash
docker exec -it pricewise-backend npx prisma generate
```

---

### 5.5 Access the Application

In Docker mode, this project uses these addresses:

Frontend:

```text
http://localhost:8080
```

Backend API:

```text
http://localhost:5000
```

To test the backend, open this in your browser:

```text
http://localhost:5000
```

You should see a JSON message similar to:

```json
{
  "message": "PriceWise API is running"
}
```

---

### 5.6 Stop the Application

To stop the application, press:

```text
CTRL + C
```

inside the terminal running Docker.

Then run:

```bash
docker compose down
```

If using the older command:

```bash
docker-compose down
```

---

### 5.7 Reset Everything Including Database Data

Only use this if you want to delete the database data completely.

```bash
docker compose down -v
```

Then start again:

```bash
docker compose up --build
```

And run:

```bash
docker exec -it pricewise-backend npx prisma db push
```

---

## 6. Alternative: Running without Docker Advanced Users

This method is for advanced users who want to run the backend and frontend manually.

You will need:

* Node.js
* npm
* PostgreSQL installed locally or a remote PostgreSQL database

---

### 6.1 Set Up PostgreSQL

Create a PostgreSQL database with these example details:

```text
Database name: pricewise
Username: pricewise
Password: pricewise_password
Port: 5432
```

Example local database URL:

```env
DATABASE_URL="postgresql://pricewise:pricewise_password@localhost:5432/pricewise"
```

If you use the Docker database only, the mapped port is:

```text
5433
```

So the local connection string becomes:

```env
DATABASE_URL="postgresql://pricewise:pricewise_password@localhost:5433/pricewise"
```

---

### 6.2 Install Backend Dependencies

Open a terminal in the project root folder.

Move into the backend folder:

```bash
cd client-api
```

Install dependencies:

```bash
npm install
```

Create or update the backend `.env` file:

```text
client-api/.env
```

Example:

```env
PORT=5000
DATABASE_URL="postgresql://pricewise:pricewise_password@localhost:5432/pricewise"
CORS_ORIGINS="http://localhost:5173"
SCRAPER_CRON="0 0 * * *"
RUN_SCRAPE_ON_START="false"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER=""
EMAIL_PASS=""
```

Generate Prisma client:

```bash
npx prisma generate
```

Create database tables:

```bash
npx prisma db push
```

Start the backend:

```bash
npm run dev
```

The backend should run on:

```text
http://localhost:5000
```

Leave this terminal open.

---

### 6.3 Install Frontend Dependencies

Open a second terminal.

Go to the project root folder again, then move into the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create or update the frontend `.env` file:

```text
frontend/.env
```

Example:

```env
VITE_API_BASE_URL="http://localhost:5000"
VITE_SOCKET_URL="http://localhost:5000"
```

Start the frontend:

```bash
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

Open this address in your browser:

```text
http://localhost:5173
```

---

## 7. How to Use the Application

1. Open the frontend in your browser.

Docker mode:

```text
http://localhost:8080
```

Local development mode:

```text
http://localhost:5173
```

2. Use the search bar to search for grocery products.

Example searches:

```text
milk
bread
coffee
pasta
```

3. Use the filters to narrow results by:

* Supermarket
* Category
* Product type

4. Click on a product group to compare prices between supermarkets.

5. Add products to your shopping list.

6. Open the shopping list page to review selected products.

7. If email settings are configured, enter your email address and send the shopping list to yourself.

Important:

Price data depends on the scraping cycle. By default, scraping runs once per day, so new prices may not appear immediately after starting the application.

---

## 8. Troubleshooting

### 8.1 Port Already in Use

You may see an error like:

```text
Port 5000 is already in use
```

or:

```text
Port 8080 is already in use
```

This means another program is already using that port.

Docker ports used by this project:

```text
Frontend: 8080
Backend: 5000
Database: 5433
```

Local development ports:

```text
Frontend: 5173
Backend: 5000
Database: 5432 or 5433
```

Fix option 1:

Close the other program using the port.

Fix option 2:

Stop Docker containers:

```bash
docker compose down
```

Fix option 3:

Change the port mapping in `docker-compose.yml`.

Example:

```yaml
ports:
  - "8081:80"
```

Then access the frontend at:

```text
http://localhost:8081
```

---

### 8.2 Docker Is Not Starting

If Docker Desktop does not start:

1. Restart Docker Desktop.
2. Restart your computer.
3. On Windows, make sure WSL 2 is enabled.
4. Make sure virtualization is enabled in BIOS/UEFI.
5. Reopen Docker Desktop and wait until it says it is running.

Then try again:

```bash
docker compose up --build
```

---

### 8.3 Database Tables Do Not Exist

If the backend starts but product routes fail, the database tables may not have been created yet.

Run:

```bash
docker exec -it pricewise-backend npx prisma db push
```

Then restart the containers:

```bash
docker compose restart
```

---

### 8.4 Scraping Fails or Data Is Not Updated Immediately

The scraping system collects products from supermarket websites.

Important notes:

* Scraping runs once per day by default.
* New prices may not appear immediately.
* Some supermarket websites may block or change their pages.
* Scraping may take several minutes.
* If the internet connection is unstable, scraping may fail.
* If one supermarket scraper fails, the others may still continue.

The schedule is controlled by:

```env
SCRAPER_CRON="0 0 * * *"
```

To run scraping when the backend starts, set:

```env
RUN_SCRAPE_ON_START="true"
```

Then restart the backend.

Docker:

```bash
docker compose restart backend
```

Local development:

```bash
npm run dev
```

Note:

Running scraping on startup can make the first startup much slower.

---

### 8.5 Email Sending Is Not Working

If sending the shopping list by email does not work, check the backend `.env` file.

Required variables:

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

If these are empty, email sending will not work.

For Gmail, you usually need a Gmail App Password.

Do not use your normal Gmail password.

If email is not configured, the rest of the application can still work normally.

---

### 8.6 Frontend Cannot Connect to Backend

Check the frontend `.env` file:

```env
VITE_API_BASE_URL="http://localhost:5000"
VITE_SOCKET_URL="http://localhost:5000"
```

Check that the backend is running:

```text
http://localhost:5000
```

If the backend is working, you should see:

```json
{
  "message": "PriceWise API is running"
}
```

---

### 8.7 Docker Build Takes a Long Time

This is normal during the first build.

Docker needs to:

* Download Node.js images
* Download PostgreSQL image
* Install npm dependencies
* Build the backend
* Build the frontend
* Install Playwright browser dependencies for scraping

Future builds are usually faster because Docker caches previous steps.

---

## 9. Folder Structure

The project structure is:

```text
PriceWise/
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
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── client/
│   │   └── i18n/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── vite.config.ts
│   └── .env
│
├── docker-compose.yml
└── README.md
```

Important folders:

```text
client-api/
```

Contains the backend API, database configuration, Prisma schema, scraping logic, email sending logic, and Socket.IO server.

```text
client-api/prisma/schema.prisma
```

Defines the PostgreSQL database structure.

```text
client-api/src/scrapers/
```

Contains scraper files for supermarket product data.

```text
client-api/src/controllers/
```

Contains backend logic for products and email.

```text
frontend/
```

Contains the React frontend application.

```text
frontend/client/
```

Contains frontend source files.

```text
docker-compose.yml
```

Defines the Docker setup for the database, backend, and frontend.

---

## 10. License & Credits

This project is an academic project.

No commercial use is intended.

Created as part of a software development / web application project to demonstrate:

* Full-stack development
* React frontend development
* Node.js backend development
* PostgreSQL database integration
* Prisma ORM usage
* Docker deployment
* Web scraping
* Real-time updates with Socket.IO

---
