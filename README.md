# CalTrack

A calorie and macro tracking web app. Log meals, track daily calories/protein/carbs/fats/fibre against personal goals, review history, and get an email reminder if you forget to log a day.

Built with Express, MongoDB (Mongoose), EJS, and express-session. Missed-meal reminder emails are sent via a daily cron job (node-cron + Nodemailer).

## Features

- Register / login (session-based auth)
- Set daily calorie & macro goals
- Log meals with quantities of tracked food items
- Edit/delete meals and individual meal items
- Meal history view
- Daily "you missed logging meals" email reminder at midnight IST

## Tech stack

- Node.js (ESM) + Express 5
- MongoDB + Mongoose
- EJS + ejs-mate (views)
- express-session (auth)
- node-cron + Nodemailer (missed-meal email reminders)
- Vitest (backend/unit tests) + Playwright (UI tests)

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (developed on Node 22)
- A MongoDB database — either a local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) generated (needed for the missed-meal reminder emails; optional if you don't care about that feature locally)

## Getting started

1. **Clone the repo**
   ```bash
   git clone https://github.com/novakiid1/caltrack.git
   cd caltrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example file and fill in your own values:
   ```bash
   cp .env.example .env
   ```
   | Variable | Required | Notes |
   |---|---|---|
   | `MONGODB_URI` | No | Falls back to `mongodb://localhost:27017/caltrack` if unset |
   | `SESSION_SECRET` | Recommended | Falls back to an insecure default if unset — always set this outside local dev |
   | `GMAIL_USER` | For email reminders | Gmail address used to send missed-meal emails |
   | `GMAIL_APP_PASSWORD` | For email reminders | [Generate one here](https://myaccount.google.com/apppasswords) — not your regular Gmail password |

4. **Start the app**
   ```bash
   npm start
   ```
   The app runs at [http://localhost:8080](http://localhost:8080).

## Running the tests

Backend tests (Vitest, spins up an in-memory MongoDB — no setup needed):
```bash
npm test
```

UI/end-to-end tests (Playwright, also self-contained via an in-memory MongoDB):
```bash
npx playwright install   # first time only, installs browsers
npm run test:ui
```

Tests run automatically on every push/PR via GitHub Actions (see [.github/workflows/test.yaml](.github/workflows/test.yaml)).

## Other scripts

| Command | Description |
|---|---|
| `npm run migrate` | Runs the unit-types migration (`migrations/add-unit-types.js`) |
| `npm run console` | Opens a Node REPL with the app's models pre-loaded |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:ui:headed` | Playwright tests in headed (visible browser) mode |

## Deployment

This app is set up to deploy on [Render](https://render.com):
- Build command: `npm install`
- Start command: `npm start`
- The server reads `process.env.PORT`, so it works with Render's dynamically assigned port
- Set `MONGODB_URI`, `SESSION_SECRET`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` as environment variables in the Render dashboard
- If using MongoDB Atlas, allow access from `0.0.0.0/0` in Network Access, since Render's free tier has no static outbound IP
