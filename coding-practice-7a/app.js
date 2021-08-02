const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initialiseDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initialiseDbAndServer();

const convertPlayerDetails = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDetails = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};
//API 1 GET players
app.get("/players/", async (request, response) => {
  const getPlayers = `
    SELECT
        *
    FROM
        player_details;`;
  const playersArray = await db.all(getPlayers);
  response.send(
    playersArray.map((eachPlayer) => convertPlayerDetails(eachPlayer))
  );
});

//API 2 GET player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayer = `
    SELECT
        *
    FROM
        player_details
    WHERE
        player_id = ${playerId};`;
  const player = await db.get(getPlayer);
  response.send(convertPlayerDetails(player));
});

//API # Update Player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayer = `
    UPDATE
        player_details
    SET
        player_name = '${playerName}'
    WHERE
        player_id = ${playerId};`;
  await db.run(updatePlayer);
  response.send("Player Details Updated");
});

//API  GET Match
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatch = `
    SELECT
        *
    FROM
        match_details
    WHERE
        match_id = ${matchId};`;
  const match = await db.get(getMatch);
  response.send(convertMatchDetails(match));
});

//API 5 GET Player Mathces
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatches = `
    SELECT
        match_details.match_id,
        match_details.match,
        match_details.year
    FROM
        player_details INNER JOIN player_match_score
        on player_details.player_id = player_match_score.player_id
        INNER JOIN match_details
        on match_details.match_id = player_match_score.match_id
    WHERE
        player_details.player_id = ${playerId};`;
  const playerMatches = await db.all(getPlayerMatches);
  response.send(
    playerMatches.map((eachMatch) => convertMatchDetails(eachMatch))
  );
});

//API 6 GET Match Players
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayers = `
    SELECT
        player_details.player_id,
        player_details.player_name
    FROM
        match_details INNER JOIN player_match_score
        on match_details.match_id = player_match_score.match_id
        INNER JOIN player_details
        on player_details.player_id = player_match_score.player_id
    WHERE
        match_details.match_id = ${matchId};`;
  const MatchPlayers = await db.all(getMatchPlayers);
  response.send(
    MatchPlayers.map((eachMatch) => convertPlayerDetails(eachMatch))
  );
});

//API 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerScore = `
    SELECT
        player_details.player_id,
        player_details.player_name,
        SUM(player_match_score.score) AS totalScore,
        SUM(player_match_score.fours) AS totalFours,
        SUM(player_match_score.sixes) AS totalSixes
    FROM
        player_details INNER JOIN player_match_score
        on player_details.player_id = player_match_score.player_id
    WHERE
        player_details.player_id = ${playerId};`;
  const match_scores = await db.get(getPlayerScore);
  response.send({
    playerId: match_scores.player_id,
    playerName: match_scores.player_name,
    totalScore: match_scores.totalScore,
    totalFours: match_scores.totalFours,
    totalSixes: match_scores.totalSixes,
  });
});
module.exports = app;
