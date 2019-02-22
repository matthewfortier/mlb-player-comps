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

app.get(
  "/player/career/fielding/:playerId",
  getPlayerCareerFieldingStats,
  (req, res) => {
    console.log(req.careerStats);
    res.json(req.careerStats);
  }
);

app.get(
  "/player/:year/fielding/:playerId",
  getPlayerYearlyFieldingStats,
  (req, res) => {
    console.log(req.yearStats);
    res.json(req.yearStats);
  }
);

// LISTENER
app.listen(process.env.PORT || 5000, () =>
  console.log("Express Server Started")
);

// RETROSHEET MIDDLEWARE
function getPlayerCareerBattingStats(req, res, next) {
  var playerURL = getPlayerURL(req.params.playerId);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var careerStats = getSectionStatsByContains("Batting Record", html);
    req.careerStats = mapBattingStatsToJson(careerStats.splice(-3, 1)[0]);
    next();
  });
}

function getPlayerCareerFieldingStats(req, res, next) {
  var playerURL = getPlayerURL(req.params.playerId);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var careerStats = getSectionStatsByContains("Fielding Record", html);
    //req.careerStats = careerStats.splice(-3, 1)[0];

    req.careerStats = {};
    careerStats.forEach((row, index) => {
      if (row[0] == "Total") {
        req.careerStats[row[4]] = mapFieldingStatsToJson(careerStats[index]);
      }
    });

    if (Object.keys(req.careerStats).length > 0) {
      next();
    }

    req.careerStats = "No records for this year";
    next();
  });
}

function getPlayerYearlyBattingStats(req, res, next) {
  var playerURL = getPlayerURL(req.params.playerId);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var careerStats = getSectionStatsByContains("Batting Record", html);
    req.yearStats = {};
    careerStats.forEach((row, index) => {
      if (row[0] == req.params.year) {
        req.yearStats[row[1]] = mapBattingStatsToJson(careerStats[index]);
      }
    });

    if (Object.keys(req.yearStats).length > 0) {
      next();
    }

    req.yearStats = "No records for this year";
    next();
  });
}

function getPlayerYearlyFieldingStats(req, res, next) {
  var playerURL = getPlayerURL(req.params.playerId);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var careerStats = getSectionStatsByContains("Fielding Record", html);

    req.yearStats = {};
    careerStats.forEach((row, index) => {
      if (row[0] == req.params.year) {
        if (req.yearStats[row[1]]) {
          req.yearStats[row[1]].push(
            mapFieldingStatsToJson(careerStats[index])
          );
        } else {
          req.yearStats[row[1]] = [mapFieldingStatsToJson(careerStats[index])];
        }
      }
    });

    if (Object.keys(req.yearStats).length > 0) {
      next();
    }

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
const positions = [
  "P",
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "RF",
  "CF",
  "OF",
  "DH"
];

function getPlayerURL(playerId) {
  return `https://www.retrosheet.org/boxesetc/${playerId[0].toUpperCase()}/P${playerId}.htm`;
}

function mapBattingStatsToJson(stats) {
  var startIndex =
    stats.indexOf("Splits") == -1
      ? stats.indexOf("Total")
      : stats.indexOf("Splits");

  console.log(startIndex);
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

function mapFieldingStatsToJson(stats) {
  var startIndex = -1;
  for (var i = 0; i < stats.length; i++) {
    if (positions.includes(stats[i])) {
      startIndex = i;
    }
  }

  var position = stats[startIndex];
  stats = stats.slice(startIndex + 1, 15);

  var obj = {};
  obj[position] = {
    G: stats[0],
    GS: stats[1],
    CG: stats[2],
    INN: stats[3],
    PO: stats[4],
    A: stats[5],
    ERR: stats[6],
    DP: stats[7],
    TP: stats[8],
    AVG: stats[9]
  };

  return obj;
}

function getSectionStatsByContains(searchkey, html) {
  var element = $(`pre:contains('${searchkey}')`, html)[0];
  return $(element)
    .text()
    .split("\n")
    .map(element =>
      element
        .trim()
        .split(" ")
        .filter(value => value != "")
    );
}
