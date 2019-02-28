const $ = require("cheerio");

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
    obj[StandardBatting[i]] = $(stats[i])
      .text()
      .includes(",")
      ? $(stats[i])
          .text()
          .split(",")
      : $(stats[i]).text();
  }
  return obj;
}

module.exports = {
  positions,
  StandardBatting,
  CareerBatting,
  getPlayerURL,
  mapStandardBattingStats
};
