const express = require("express");
const playerController = require("../controllers/playerController");

const router = express.Router();

router.get("/", playerController.player_index);

router.post("/", playerController.player_create_post);

router.get("/create", playerController.player_create_get);

router.get("/create-player", playerController.player_create_get);

router.get("/create-players", playerController.player_create_get);

router.get("/:id", playerController.player_details);

router.delete("/:id", playerController.player_delete);

module.exports = router;