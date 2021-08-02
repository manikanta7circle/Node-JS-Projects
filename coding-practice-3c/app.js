const express = require("express");
const app = express();

//GET Home Page API
app.get("/", (request, response) => {
  response.send("Home Page");
});

//GET About Page API
app.get("/about", (request, response) => {
  response.send("About Page");
});

app.listen(3000);

module.exports = app;
