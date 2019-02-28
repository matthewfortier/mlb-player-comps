const rp = require("request-promise");
const $ = require("cheerio");

const svc = require("../services");

const getPlayerCareerBattingStats = (req, res, next) => {
  var playerURL = svc.getPlayerURL(req.params.playerId);
  console.log(playerURL);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var careerStats = {};
    $("#batting_standard tfoot tr:nth-child(1)", html)
      .children()
      .each((index, element) => {
        careerStats[svc.CareerBatting[index]] = $(element)
          .text()
          .includes(",")
          ? $(element)
              .text()
              .split(",")
          : $(element).text();
      });

    res.send(careerStats);
  });
};

const getPlayerYearlyBattingStats = (req, res, next) => {
  var playerURL = svc.getPlayerURL(req.params.playerId);
  console.log(playerURL);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var yearStats = {};
    $(
      `#batting_standard tbody tr th:contains('${req.params.year}')`,
      html
    ).each((_, element) => {
      var tr = $(element).parent();

      console.log($(element).text());
      yearStats[$(tr.children()[2]).text()] = svc.mapStandardBattingStats(
        tr.children()
      );
    });

    if (Object.keys(yearStats).length > 0) {
      return res.send(yearStats);
    } else {
      return res.send("No records for this year");
    }
  });
};

const getPlayerCareerFieldingStats = (req, res, next) => {
  var playerURL = svc.getPlayerURL(req.params.playerId);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var careerStats = svc.getSectionStatsByContains("Fielding Record", html);
    req.careerStats = {};
    careerStats.forEach((row, index) => {
      if (row[0] == "Total") {
        req.careerStats[row[4]] = svc.mapFieldingStatsToJson(
          careerStats[index]
        );
      }
    });

    if (Object.keys(req.careerStats).length > 0) {
      return next();
    }

    req.careerStats = "No records for this year";
    next();
  });
};

const getPlayerYearlyFieldingStats = (req, res, next) => {
  var playerURL = svc.getPlayerURL(req.params.playerId);
  // Get HTML from Retrosheet
  rp(playerURL).then(function(html) {
    // Get the career batting record
    var careerStats = svc.getSectionStatsByContains("Fielding Record", html);

    req.yearStats = {};
    careerStats.forEach((row, index) => {
      if (row[0] == req.params.year) {
        if (req.yearStats[row[1]]) {
          req.yearStats[row[1]].push(
            svc.mapFieldingStatsToJson(careerStats[index])
          );
        } else {
          req.yearStats[row[1]] = [
            svc.mapFieldingStatsToJson(careerStats[index])
          ];
        }
      }
    });

    if (Object.keys(req.yearStats).length > 0) {
      return next();
    }

    req.yearStats = "No records for this year";
    next();
  });
};

const getPlayerIds = (req, res, next) => {
  rp(
    `https://www.baseball-reference.com/search/search.fcgi?search=${req.params.searchkey.toLowerCase()}`
  ).then(function(html) {
    var players = {};

    $(".search-results #players .search-item", html).each((_, element) => {
      var id = $(element)
        .find(".search-item-url")
        .text()
        .trim()
        .split("/")
        .pop()
        .replace(".shtml", "");

      var nameText = $(element)
        .find(".search-item-name")
        .text();

      var teamsText = $(element)
        .find(".search-item-team")
        .text()
        .trim();

      var altsText = $(element)
        .find(".search-item-alt-names")
        .text()
        .trim();

      console.log(nameText.indexOf("(") + " " + nameText.indexOf(")"));

      players[id] = {
        ID: id,
        Name: nameText.substr(0, nameText.indexOf("(")).trim(),
        URL: $(element)
          .find(".search-item-url")
          .text()
          .trim(),
        Years: nameText
          .substring(nameText.indexOf("("), nameText.indexOf(")") + 1)
          .trim(),
        Current: teamsText.includes("Current"),
        AS: nameText.includes("All-Star"),
        Alts: {
          Given: altsText
            .substring(
              altsText.indexOf("given") + 6,
              altsText.includes("nickname")
                ? altsText.indexOf(",")
                : altsText.length - 1
            )
            .trim(),
          Nicknames: altsText.includes("nickname")
            ? altsText
                .substring(altsText.indexOf("nickname") + 9)
                .trim()
                .split(",")
            : []
        },
        Teams: teamsText
          .substring(teamsText.indexOf(":") + 1)
          .trim()
          .split(",")
      };
    });

    res.send(players);
  });
};

module.exports = {
  getPlayerCareerBattingStats,
  getPlayerCareerFieldingStats,
  getPlayerYearlyBattingStats,
  getPlayerYearlyFieldingStats,
  getPlayerIds
};
