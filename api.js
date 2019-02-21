const express = require("express"),
  app = express();

const rp = require("request-promise");
const $ = require("cheerio");

// ROUTES
app.get("/", (request, response) => {
  response.send("Hello World");
});

app.get("/player/search/:searchkey", getPlayerIds, (req, res) => {
  console.log(req.players);
  res.json(req.players);
});

app.get(
  "/player/career/batting/:playerId",
  getPlayerCareerBattingStats,
  (req, res) => {
    console.log(req.careerStats);
    res.json(req.careerStats);
  }
);

app.get(
  "/player/:year/batting/:playerId",
  getPlayerYearlyBattingStats,
  (req, res) => {
    console.log(req.yearStats);
    res.json(req.yearStats);
  }
);

// LISTENER
app.listen(process.env.PORT || 3000, () =>
  console.log("Express Server Started")
);

// RETROSHEET MIDDLEWARE
function getPlayerCareerBattingStats(req, res, next) {
  var playerURL = `https://www.retrosheet.org/boxesetc/${req.params.playerId[0].toUpperCase()}/P${
    req.params.playerId
  }.htm`;

  console.log(playerURL);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    console.log($("pre:contains('Batting Record')", html).length);
    // Get the career batting record
    var element = $("pre:contains('Batting Record')", html)[0];
    var careerStats = $(element)
      .text()
      .split("\n")
      .map(element =>
        element
          .trim()
          .split(" ")
          .filter(value => value != "")
      );

    req.careerStats = mapBattingStatsToJson(careerStats.splice(-3, 1)[0]);
    next();
  });
}

function getPlayerYearlyBattingStats(req, res, next) {
  var playerURL = `https://www.retrosheet.org/boxesetc/${req.params.playerId[0].toUpperCase()}/P${
    req.params.playerId
  }.htm`;

  console.log(playerURL);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    console.log($("pre:contains('Batting Record')", html).length);
    // Get the career batting record
    var element = $("pre:contains('Batting Record')", html)[0];
    var careerStats = $(element)
      .text()
      .split("\n")
      .map(element =>
        element
          .trim()
          .split(" ")
          .filter(value => value != "")
      );

    //careerStats.splice(0, 2);
    //careerStats.splice(-3, 3);
    careerStats.forEach((row, index) => {
      if (row[0] == req.params.year) {
        req.yearStats = mapBattingStatsToJson(careerStats[index]);
        next();
      }
    });

    req.yearStats = "No records for this year";
    next();
  });
}

function getPlayerIds(req, res, next) {
  rp(`https://www.retrosheet.org/retroID.htm`).then(function(html) {
    var players = $($("pre", html)[0])
      .text()
      .split("\n")
      .filter(value => value.includes(req.params.searchkey));

    req.players = players;
    next();
  });
}

// RETROSHEET HELPERS
function mapBattingStatsToJson(stats) {
  var startIndex = stats.indexOf("Splits");
  stats = stats.slice(startIndex + 1, 28);
  console.log(stats);
  return {
    G: stats[0],
    AB: stats[1],
    R: stats[2],
    H: stats[3],
    "2B": stats[4],
    "3B": stats[5],
    HR: stats[6],
    RBI: stats[7],
    BB: stats[8],
    IBB: stats[9],
    SO: stats[10],
    HBP: stats[11],
    SH: stats[12],
    SF: stats[13],
    XI: stats[14],
    ROE: stats[15],
    GDP: stats[16],
    SB: stats[17],
    CS: stats[18],
    AVG: stats[19],
    OBP: stats[20],
    SLG: stats[21],
    BFW: stats[22]
  };
}
