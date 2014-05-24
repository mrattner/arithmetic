/// <reference path="Arithmetic.ts" />
/// <reference path="Rand.ts" />
/// <reference path="Time.ts" />
/// <reference path="../lib/backbone.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Model;
(function (Model) {
    var DEFAULT_NUM_PROBLEMS = 20;
    var DEFAULT_ATTEMPTS = 2;
    var DEFAULT_MINUTES = 2;
    var DEFAULT_TYPES = [0 /* ADD */];

    

    

    var Game = (function (_super) {
        __extends(Game, _super);
        function Game() {
            _super.apply(this, arguments);
        }
        /**
        * Specifies the default attributes for the model. When creating an instance of the model, any unspecified
        * attributes will be set to their default value.
        * @return The default settable game attributes
        */
        Game.prototype.defaults = function () {
            return {
                types: DEFAULT_TYPES,
                totalProblems: DEFAULT_NUM_PROBLEMS,
                totalAttempts: DEFAULT_ATTEMPTS,
                minutes: 0,
                endless: false
            };
        };

        /**
        * Override the default get method when getting the time.
        * @param attributeName The attribute whose value to get
        * @return The value of the specified attribute
        */
        Game.prototype.get = function (attributeName) {
            switch (attributeName) {
                case "time":
                    var hasTimeLimit = this.get("minutes") !== 0;
                    var gameIsOver = this.get("gameOver");
                    if (gameIsOver && !hasTimeLimit) {
                        // Return how long the game took.
                        return this.timer.getHumanizedTotalTime();
                    } else if (gameIsOver && hasTimeLimit) {
                        // Return what the time limit was.
                        return this.get("minutes");
                    } else if (!gameIsOver && hasTimeLimit) {
                        // If there is a time limit, we are counting down.
                        return this.timer.getTimeRemaining();
                    } else {
                        // If there is no time limit, we are counting up.
                        return this.timer.getElapsedTime();
                    }
                    break;
                case "types":
                case "totalProblems":
                case "totalAttempts":
                case "minutes":
                case "endless":
                case "currentProblem":
                case "previousProblem":
                case "remainingAttempts":
                case "problemsAnswered":
                case "gameOver":
                    return _super.prototype.get.call(this, attributeName);
                default:
                    throw "Model.Game.get: Invalid attribute name.";
            }
        };

        Game.prototype.setTime = function (timeString) {
            _super.prototype.set.call(this, { time: timeString });
        };

        Game.prototype.setCurrentProblem = function (problem) {
            _super.prototype.set.call(this, { currentProblem: problem });
        };

        Game.prototype.setPreviousProblem = function (problem) {
            _super.prototype.set.call(this, { previousProblem: problem });
        };

        Game.prototype.setRemainingAttempts = function (attempts) {
            _super.prototype.set.call(this, { remainingAttempts: attempts });
        };

        Game.prototype.setProblemsAnswered = function (numAnswered) {
            _super.prototype.set.call(this, { problemsAnswered: numAnswered });
        };

        Game.prototype.setGameOver = function (over) {
            _super.prototype.set.call(this, { gameOver: over });
        };

        /**
        * Invoked when the model is created.
        * @param attributes Initial values to be set on the model
        */
        Game.prototype.initialize = function (attributes) {
            var _this = this;
            this.timer = new Time.Timer(attributes.minutes);
            this.problem = this.newProblem();

            // Set the game's other attributes that were not passed in to the constructor.
            var numAttempts = attributes.totalAttempts ? attributes.totalAttempts : 0;
            var hasTimeLimit = attributes.minutes > 0;
            this.setCurrentProblem(getProblemString(this.problem));
            this.setPreviousProblem({ text: "", correct: false });
            this.setRemainingAttempts(numAttempts);
            this.setProblemsAnswered(0);
            this.setTime(this.generateTimeString(hasTimeLimit));
            this.setGameOver(false);

            // If there is a time limit, end the game after that amount of time.
            if (attributes.minutes) {
                setTimeout(function () {
                    _this.endGame();
                }, this.timer.getTimeLimitMilliseconds());
            }

            // Every second, update the time string.
            setInterval(function () {
                _this.setTime(_this.generateTimeString(hasTimeLimit));
            }, 1000);
        };

        /**
        * Helper function for getting the correct time string based on whether the timer has a time limit.
        * @param hasTimeLimit Whether there is a time limit
        */
        Game.prototype.generateTimeString = function (hasTimeLimit) {
            return hasTimeLimit ? this.timer.getTimeRemaining() : this.timer.getElapsedTime();
        };

        /**
        * Sets the previous problem to the current problem and sets the current problem to a new problem.
        * @param wasCorrect Whether the answer to the most recently answered problem was correct
        */
        Game.prototype.setProblems = function (wasCorrect) {
            var previous = {
                text: getFullProblemString(this.problem),
                correct: wasCorrect
            };
            this.problem = this.newProblem();
            this.setPreviousProblem(previous);
            this.setCurrentProblem(getProblemString(this.problem));

            if (wasCorrect) {
                var previousProblemsAnswered = this.get("problemsAnswered");
                this.setProblemsAnswered(previousProblemsAnswered + 1);
            }

            // Decide whether to continue the game.
            var endlessMode = this.get("endless");
            var maxProblems = this.get("totalProblems");
            var answeredAllProblems = this.get("problemsAnswered") >= maxProblems;
            if ((maxProblems && !endlessMode) && answeredAllProblems) {
                this.endGame();
            }
        };

        /**
        * If the given answer was correct, or if the player is out of attempts, go on to the next problem.
        * @param answer The proposed answer to the current problem
        */
        Game.prototype.evaluateAnswer = function (answer) {
            var isCorrect = (answer === this.problem.answer);

            if (!isCorrect) {
                // Decrement the number of attempts remaining.
                var previousRemainingAttempts = this.get("remainingAttempts");
                this.setRemainingAttempts(previousRemainingAttempts - 1);
            }

            // If total attempts was set as 0, player gets unlimited attempts.
            var totalAttempts = this.get("totalAttempts");
            var giveUp = totalAttempts && this.get("remainingAttempts") <= 0;

            if (isCorrect || giveUp) {
                // Move on to the next problem.
                this.setProblems(isCorrect);

                // Reset the number of attempts to maximum.
                this.setRemainingAttempts(this.get("totalAttempts"));
            }

            return isCorrect;
        };

        /**
        * Generates a new arithmetic problem from one of this game's allowed problem types.
        * @return a random new arithmetic problem
        */
        Game.prototype.newProblem = function () {
            var types = this.get("types");
            var problemType = Rand.choose(types);

            switch (problemType) {
                case 0 /* ADD */:
                    return new Arithmetic.Addition();
                case 1 /* SUBTRACT */:
                    return new Arithmetic.Subtraction();
                case 2 /* MULTIPLY */:
                    return new Arithmetic.Multiplication();
                case 3 /* DIVIDE */:
                    return new Arithmetic.Division();
                default:
                    throw "nextProblem: Invalid problem type";
            }
        };

        Game.prototype.endGame = function () {
            this.timer.stop();
            this.setTime(this.timer.getHumanizedTotalTime());
            this.setGameOver(true);
        };
        return Game;
    })(Backbone.Model);
    Model.Game = Game;

    /**
    * Produces a human-readable representation of an arithmetic problem without an answer.
    * @param problem An arithmetic problem
    * @return Representation of the problem as a string, without including the answer
    */
    function getProblemString(problem) {
        var problemString = "";
        problem.operands.forEach(function (op, index) {
            problemString += op + " ";
            if (index < problem.operands.length - 1) {
                problemString += problem.symbol + " ";
            } else {
                problemString += "=";
            }
        });
        return problemString;
    }

    /**
    * Produces a human-readable representation of an arithmetic problem, including the answer.
    * @param problem An arithmetic problem
    * @return Representation of the problem and answer as a string
    */
    function getFullProblemString(problem) {
        return getProblemString(problem) + " " + problem.answer;
    }

    /**
    * Defines a model for the default values needed by the view. This model does not change its attributes.
    */
    var Defaults = (function (_super) {
        __extends(Defaults, _super);
        function Defaults() {
            _super.apply(this, arguments);
        }
        /**
        * Override to not take any attributes.
        */
        Defaults.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
        };

        Defaults.prototype.defaults = function () {
            return {
                defaultProblems: DEFAULT_NUM_PROBLEMS,
                defaultAttempts: DEFAULT_ATTEMPTS,
                defaultMinutes: DEFAULT_MINUTES
            };
        };
        return Defaults;
    })(Backbone.Model);
    Model.Defaults = Defaults;
})(Model || (Model = {}));
//# sourceMappingURL=Model.js.map
