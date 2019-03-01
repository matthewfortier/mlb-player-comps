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

const getPlayerURL = playerId => {
  return `https://www.baseball-reference.com/players/${
    playerId[0]
  }/${playerId}.shtml`;
};

const mapStandardBattingStats = (stats, labels) => {
  var obj = {};
  for (var i = 0; i < stats.length; i++) {
    obj[labels[i]] = $(stats[i])
      .text()
      .includes(",")
      ? $(stats[i])
          .text()
          .split(",")
      : $(stats[i]).text();
  }
  return obj;
};

module.exports = {
  positions,
  CareerBatting,
  getPlayerURL,
  mapStandardBattingStats
};
