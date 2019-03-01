const httpErrors = require("httperrors");
const controllers = require("../controllers");

module.exports = app => {
  app.get("/player/search/:searchkey", controllers.playerCtrl.getPlayerIds);

  app.get(
    "/player/career/batting/:playerId",
    controllers.playerCtrl.getPlayerCareerBattingStats
  );

  app.get(
    "/player/:year/batting/:playerId",
    controllers.playerCtrl.getPlayerYearlyBattingStats
  );

  app.get(
    "/player/career/fielding/:playerId",
    controllers.playerCtrl.getPlayerCareerFieldingStats
  );

  app.get(
    "/player/:year/fielding/:playerId",
    controllers.playerCtrl.getPlayerYearlyFieldingStats
  );

  app.use((req, res, next) => {
    next(new httpErrors.NotFound(`Page Not Found`));
  });
};
