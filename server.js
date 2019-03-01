const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  return res.sendFile(path.join(__dirname, "index.html"));
});

const routes = require("./api/routes");
routes(app);

app.listen(port);

console.log("http://localhost:" + port);
