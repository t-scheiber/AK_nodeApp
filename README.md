# Player management app

A practice project: a small Express and EJS web app that lists, creates, shows and deletes player profiles.

Pages are rendered on the server from EJS templates. Players live in MongoDB when `MONGODB_URI` is set, and in a JSON file otherwise.

## Stack

- Node.js 22 in the Nixpacks build (`nixpacks.toml`).
- Express 5.3.0 for routing and the HTTP server
- EJS 7.0.2 templates in `views/`
- Mongoose 9.12.1 for the `Player` model in `models/player.js`
- Morgan 1.12.1 for request logging
- dotenv 18.0.10 loads a `.env` file at startup

`lodash` is listed in `package.json`, but no source file imports it.

## Features and routes

- `GET /` redirects to `/players`.
- `GET /players` lists all players, newest first.
- `GET /players/:id` shows a player's username and bio. In local mode, an unknown ID returns a 404 page. In MongoDB mode, a malformed ID returns a 500 page.
- `GET /players/create` shows the form. `POST /players` saves a player and redirects to the list. A missing username or full name returns the form again with HTTP 400.
- `DELETE /players/:id` removes a player. The trash icon on the details page sends this request.
- `GET /about` shows placeholder text.

There is no edit route. `GET /add-player` creates a placeholder player on every call, and `GET /all-players` and `GET /single-player` return JSON. Template output is HTML-escaped.

## Data storage

`services/playerStore.js` picks the storage mode once, at startup.

- MongoDB mode runs when `MONGODB_URI` is set and `DISABLE_DB` is not `true`. Players are stored in the `players` collection. Changes survive a restart. If the connection fails, the process exits with code 1.
- Local mode runs otherwise. The app loads `data/localPlayers.json` if it exists, and `data/samplePlayers.json` if it does not. Each create or delete rewrites `data/localPlayers.json`, so changes survive a restart. If that write fails, the app logs a warning and the change is lost on restart. `data/localPlayers.json` is gitignored.

## Configuration

| Variable | Default | Effect |
| --- | --- | --- |
| `PORT` | `3000` | HTTP port |
| `MONGODB_URI` | unset | MongoDB connection string. Enables MongoDB mode. |
| `DISABLE_DB` | unset | `true` forces local mode, even when `MONGODB_URI` is set |

## Run it

```bash
npm ci
npm start
```

The app listens on `http://localhost:3000`, or on `PORT` if set.

## Checks

```bash
npm test
npm run validate
```

`npm test` runs the Express app against a temporary copy of the data, plus the Mongoose schema and database startup tests. It does not connect to MongoDB. The application test binds `127.0.0.1:18371`. On Windows, that test fails at its symlink step because of how it builds paths.

`npm run validate` checks the JavaScript syntax, compiles every EJS view, and confirms that `package.json` and the lockfile declare the same dependencies.

## Deployment

`nixpacks.toml` builds with Nixpacks: Node 22, `npm ci --omit=dev`, then `npm start` with `NODE_ENV=production`. Set `MONGODB_URI` in the host's environment to use MongoDB. Without it, the app writes to `data/localPlayers.json`, so the host's disk must keep that file across restarts.

## Project layout

- `index.js` starts Express, connects to MongoDB when configured, and mounts the routes.
- `routes/playerRoutes.js` maps URLs to controller functions.
- `controllers/playerController.js` renders views and calls the store.
- `services/playerStore.js` reads and writes players in either storage mode.
- `models/player.js` defines the schema. `username` and `fullname` are required, `bio` defaults to an empty string, and timestamps are added.
- `views/` holds the EJS pages and partials. `public/` holds the stylesheet and the trash icon.
- `data/` holds the seed file. `docs/` holds four text files with placeholder text that the app does not use.
