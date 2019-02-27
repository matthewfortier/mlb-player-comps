const express = require("express"),
  app = express();
router = express.Router();

const rp = require("request-promise");
const $ = require("cheerio");

// ROUTES
router.get("/", (req, res) => {
  return res.send("MLB Player Comparisons");
});

router.get("/player/search/:searchkey", getPlayerIds, (req, res) => {
  console.log(req.players);
  res.json(req.players);
});

router.get(
  "/player/career/batting/:playerId",
  getPlayerCareerBattingStats,
  (req, res) => {
    console.log(req.careerStats);
    res.json(req.careerStats);
  }
);

router.get(
  "/player/:year/batting/:playerId",
  getPlayerYearlyBattingStats,
  (req, res) => {
    console.log(req.yearStats);
    res.json(req.yearStats);
  }
);

router.get(
  "/player/career/fielding/:playerId",
  getPlayerCareerFieldingStats,
  (req, res) => {
    console.log(req.careerStats);
    res.json(req.careerStats);
  }
);

router.get(
  "/player/:year/fielding/:playerId",
  getPlayerYearlyFieldingStats,
  (req, res) => {
    console.log(req.yearStats);
    res.json(req.yearStats);
  }
);

app.use("/", router);

// LISTENER
app.listen(process.env.PORT || 5000, () =>
  console.log("Express Server Started")
);

// Baseball Reference MIDDLEWARE

// Batting Requests
function getPlayerCareerBattingStats(req, res, next) {
  var playerURL = getPlayerURL(req.params.playerId);
  console.log(playerURL);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var careerStats = {};
    $("#batting_standard tfoot tr:nth-child(1)", html)
      .children()
      .each((index, element) => {
        careerStats[CareerBatting[index]] = $(element).text();
      });

    req.careerStats = careerStats;
    next();
  });
}

function getPlayerYearlyBattingStats(req, res, next) {
  var playerURL = getPlayerURL(req.params.playerId);
  console.log(playerURL);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    req.yearStats = {};
    $(
      `#batting_standard tbody tr th:contains('${req.params.year}')`,
      html
    ).each((_, element) => {
      var tr = $(element).parent();

      console.log($(element).text());
      req.yearStats[$(tr.children()[2]).text()] = mapStandardBattingStats(
        tr.children()
      );
    });

    if (Object.keys(req.yearStats).length > 0) {
      return next();
    }

    req.yearStats = "No records for this year";
    next();
  });
}

function getPlayerCareerFieldingStats(req, res, next) {
  var playerURL = getPlayerURL(req.params.playerId);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var careerStats = getSectionStatsByContains("Fielding Record", html);
    req.careerStats = {};
    careerStats.forEach((row, index) => {
      if (row[0] == "Total") {
        req.careerStats[row[4]] = mapFieldingStatsToJson(careerStats[index]);
      }
    });

    if (Object.keys(req.careerStats).length > 0) {
      return next();
    }

    req.careerStats = "No records for this year";
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
      return next();
    }

    req.yearStats = "No records for this year";
    next();
  });
}

function getPlayerIds(req, res, next) {
  rp(
    `https://www.baseball-reference.com/players/${req.params.searchkey[0].toLowerCase()}/`
  ).then(function(html) {
    console.log(html);

    var players = {};
    $(`#div_players_ a:contains('${req.params.searchkey}')`, html).each(
      (_, element) => {
        var id = $(element)
          .attr("href")
          .split("/")
          .pop()
          .replace(".shtml", "");

        players[id] = {
          ID: id,
          Name: $(element).text(),
          URL: $(element).attr("href"),
          Current:
            $(element)
              .parent()
              .prop("tagName") == "B"
        };
      }
    );
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

const CareerBatting = [
  "Yrs",
  "G",
  "PA",
  "AB",
  "R",
  "H",
  "2B",
  "3B",
  "HR",
  "RBI",
  "SB",
  "CS",
  "BB",
  "SO",
  "BA",
  "OBP",
  "SLG",
  "OPS",
  "OPS+",
  "TB",
  "GDP",
  "HBP",
  "SH",
  "SF",
  "IBB",
  "Pos",
  "Awards"
];

const StandardBatting = [
  "Year",
  "Age",
  "Tm",
  "Lg",
  "G",
  "PA",
  "AB",
  "R",
  "H",
  "2B",
  "3B",
  "HR",
  "RBI",
  "SB",
  "CS",
  "BB",
  "SO",
  "BA",
  "OBP",
  "SLG",
  "OPS",
  "OPS+",
  "TB",
  "GDP",
  "HBP",
  "SH",
  "SF",
  "IBB",
  "Pos",
  "Awards"
];

function getPlayerURL(playerId) {
  return `https://www.baseball-reference.com/players/${
    playerId[0]
  }/${playerId}.shtml`;
}

function mapStandardBattingStats(stats) {
  var obj = {};
  for (var i = 0; i < stats.length; i++) {
    obj[StandardBatting[i]] = $(stats[i]).text();
  }
  return obj;
}
