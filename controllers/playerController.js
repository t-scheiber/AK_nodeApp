const playerStore = require("../services/playerStore");

// player_index player details, player_create_get, player_create_post, player_delete

const player_index = async (req, res) => {
  try {
    const players = await playerStore.findAll();
    res.render("players/index", { title: "All Players", players });
  } catch (error) {
    console.error("Failed to load players", error);
    res.status(500).render("404", { title: "Unable to load players" });
  }
};

const player_details = async (req, res) => {
  const id = req.params.id;
  try {
    const player = await playerStore.findById(id);
    if (!player) {
      return res.status(404).render("404", { title: "Player not found" });
    }
    res.render("players/details", { player, title: "Player Details" });
  } catch (error) {
    console.error("Failed to load player", error);
    res.status(500).render("404", { title: "Unable to load player" });
  }
};
const player_create_get = (req, res) => {
  res.render("players/create", { title: "Create" });
};
const player_create_post = async (req, res) => {
  try {
    await playerStore.create(req.body);
    res.redirect("/players/");
  } catch (error) {
    console.error("Failed to create player", error);
    res.status(400).render("players/create", {
      title: "Create",
      error: "Unable to create player. Please check your input.",
    });
  }
};
const player_delete = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await playerStore.remove(id);
    if (!result) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.json({ redirect: "/" });
  } catch (error) {
    console.error("Failed to delete player", error);
    res.status(500).json({ error: "Unable to delete player" });
  }
};
module.exports = {
  player_index,
  player_details,
  player_create_get,
  player_create_post,
  player_delete,
};
