const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const Player = require("../models/player");

const dataDir = path.join(__dirname, "..", "data");
const seedFile = path.join(dataDir, "samplePlayers.json");
const localFile = path.join(dataDir, "localPlayers.json");

const isDbEnabled =
  Boolean(process.env.MONGODB_URI) && process.env.DISABLE_DB !== "true";

let memoryPlayers = [];

if (!isDbEnabled) {
  memoryPlayers = loadPlayersFromDisk();
}

function loadPlayersFromDisk() {
  try {
    if (fs.existsSync(localFile)) {
      return JSON.parse(fs.readFileSync(localFile, "utf8"));
    }
    if (fs.existsSync(seedFile)) {
      return JSON.parse(fs.readFileSync(seedFile, "utf8"));
    }
  } catch (error) {
    console.warn("Could not load cached player data:", error.message);
  }
  return [];
}

function persistPlayers() {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(localFile, JSON.stringify(memoryPlayers, null, 2));
  } catch (error) {
    console.warn("Could not persist local players:", error.message);
  }
}

function sortPlayers(list) {
  return list.slice().sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

function findAll() {
  if (isDbEnabled) {
    return Player.find().sort({ createdAt: -1 });
  }
  return Promise.resolve(sortPlayers(memoryPlayers));
}

function findById(id) {
  if (isDbEnabled) {
    return Player.findById(id);
  }
  const player = memoryPlayers.find((item) => item._id === id);
  return Promise.resolve(player || null);
}

function create(data) {
  if (isDbEnabled) {
    const player = new Player(data);
    return player.save();
  }
  if (!data.username || !data.fullname) {
    return Promise.reject(
      new Error("username and fullname are required to create a player")
    );
  }
  const now = new Date().toISOString();
  const player = {
    _id: randomUUID(),
    username: data.username,
    fullname: data.fullname,
    bio: data.bio || "",
    createdAt: now,
    updatedAt: now,
  };
  memoryPlayers.unshift(player);
  persistPlayers();
  return Promise.resolve(player);
}

function remove(id) {
  if (isDbEnabled) {
    return Player.findByIdAndDelete(id);
  }
  const index = memoryPlayers.findIndex((item) => item._id === id);
  if (index === -1) {
    return Promise.resolve(null);
  }
  const [removed] = memoryPlayers.splice(index, 1);
  persistPlayers();
  return Promise.resolve(removed);
}

module.exports = {
  isDbEnabled,
  findAll,
  findById,
  create,
  remove,
};

