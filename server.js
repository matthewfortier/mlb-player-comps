const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

const routes = require("./api/routes");
routes(app);

app.listen(port);

console.log("http://localhost:" + port);
