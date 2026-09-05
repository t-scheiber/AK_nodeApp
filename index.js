require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const playerRoutes = require("./routes/playerRoutes");
const playerStore = require("./services/playerStore");

//express app
const app = express();

// Load MongoDB URI from environment variables
const dbURL = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

const startServer = () => {
  app.listen(PORT, () => {
    const mode = playerStore.isDbEnabled ? "MongoDB mode" : "local data mode";
    console.log(`Server running on port ${PORT} (${mode})`);
  });
};

if (playerStore.isDbEnabled) {
  mongoose
    .connect(dbURL)
    .then(startServer)
    .catch((err) => {
      console.error("Failed to connect to MongoDB:", err);
      process.exit(1);
    });
} else {
  console.warn(
    "MONGODB_URI missing or DISABLE_DB=true. Starting in local data mode."
  );
  startServer();
}

//register view engine
app.set("view engine", "ejs");

//middleware and static files
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// mongoose and mongodb sandbox routes
app.get("/add-player", async (req, res) => {
  try {
    const player = await playerStore.create({
      username: "new player 1",
      fullname: "new player fullname",
      bio: "new player bio",
    });
    res.send(player);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unable to create player");
  }
});

app.get("/all-players", async (req, res) => {
  try {
    const players = await playerStore.findAll();
    res.send(players);
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to load players");
  }
});

app.get("/single-player", async (req, res) => {
  try {
    const players = await playerStore.findAll();
    if (!players.length) {
      return res.status(404).send("No players found");
    }
    res.send(players[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to load player");
  }
});

app.get("/", (req, res) => {
  res.redirect("/players");
});

app.get("/create-players", (req, res) => {
  res.redirect("/create");
});

app.get("/create-player", (req, res) => {
  res.redirect("/create");
});
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// player routes

app.use("/players", playerRoutes);

//404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
