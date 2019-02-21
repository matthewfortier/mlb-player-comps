const rp = require("request-promise");
const url = "https://www.retrosheet.org/boxesetc/B/Pbettm001.htm";
const $ = require("cheerio");

function getPlayerCareerBattingStats(playerURL) {
  // Get HTML from Retrosheet
  rp(playerURL)
    .then(function(html) {
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

      careerStats.splice(0, 2);
      careerStats.splice(-3, 3);
      console.log(careerStats);
    })
    .catch(function(err) {
      //handle error
    });
}

function getPlayerIds(searchkey) {
  rp(`https://www.retrosheet.org/retroID.htm`)
    .then(function(html) {
      //console.log(html);
      return $($("pre", html)[0])
        .text()
        .split("\n")
        .filter(value => value.includes(searchkey));
    })
    .catch(function(err) {
      //handle error
    });
}

//getPlayerCareerBattingStats(url);
getPlayerIds("Mookie");
