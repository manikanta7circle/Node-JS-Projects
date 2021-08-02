const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

//intializing Database and server
const initializeDBAndServer = async (request, response) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const covertDBObjectToResponseObject1 = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
  covertDBObjectToResponseObject1;
};

const convertDBObjectToResponseObject2 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDBObjectToResponseObject3 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//GET all movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
        movie_name
    FROM
        movie;`;
  const movieArray = await db.all(getMoviesQuery);
  response.send(
    movieArray.map((eachPlayer) => covertDBObjectToResponseObject1(eachPlayer))
  );
});

//GET A movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertDBObjectToResponseObject2(movie));
});

// POST A Movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO
        movie(director_id,movie_name,lead_actor)
    VALUES
        (${directorId},'${movieName}','${leadActor}');`;
  const movie = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//PUT Movie
app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;

  const updateMovieQuery = `
    UPDATE 
        movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};`;
  const movie = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
        movie
    WHERE
        movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET Directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
        *
    FROM 
    director;`;
  const directorArray = await db.all(getDirectorsQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDBObjectToResponseObject3(eachDirector)
    )
  );
});

//director movie
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const query = `
    SELECT
        movie.movie_name
    FROM
        movie INNER JOIN director
        on movie.director_id = director.director_id
    WHERE
        director.director_id = ${directorId};`;
  const directors = await db.all(query);
  response.send(
    directors.map((eachItem) => covertDBObjectToResponseObject1(eachItem))
  );
});
module.exports = app;
