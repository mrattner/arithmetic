/// <reference path="Model.ts" />
/// <reference path="Arithmetic.ts" />
/// <reference path="../lib/backbone.d.ts" />
/// <reference path="../lib/handlebars.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var View;
(function (View) {
    function compile(templateElementName) {
        return Handlebars.compile($(templateElementName).html());
    }

    function gameTemplate() {
        Handlebars.registerPartial("problems", compile("#problems-partial"));
        Handlebars.registerPartial("message", compile("#message-partial"));
        Handlebars.registerPartial("clock", compile("#clock-partial"));
        return compile("#game-view");
    }

    /**
    * Logic pertaining to showing the Start and Instructions screens.
    */
    var StartView = (function (_super) {
        __extends(StartView, _super);
        function StartView() {
            _super.apply(this, arguments);
            this.template = compile("#start-view");
        }
        StartView.prototype.render = function () {
            // Put the template HTML into a DOM element.
            this.$el.html(this.template(this.model.attributes));

            // Add the view element to the DOM if it isn't there already.
            $("#view-container").append(this.el);
            this.setUp();
            return this;
        };

        StartView.prototype.setHidden = function (hidden) {
            this.$el.toggle(!hidden);
        };

        StartView.toggleInstructions = function (show) {
            $("#instructions").toggle(show);
            $("#game-options").toggle(!show);
            $("#help-button").toggle(!show);
            $("#start-button").toggle(!show);
        };

        StartView.prototype.setUp = function () {
            StartView.toggleInstructions(false);
            this.configureLimitsInputs();

            // Bind the appropriate listeners to the buttons.
            $("#help-button").click(function () {
                StartView.toggleInstructions(true);
            });
            $("#back-button").click(function () {
                StartView.toggleInstructions(false);
            });

            // Disable the start button if the user hasn't selected at least 1 problem type.
            var problemTypeCheckboxes = $("#problem-types-list").find("input");
            problemTypeCheckboxes.change(function () {
                $("#start-button").prop("disabled", !problemTypeCheckboxes.is(":checked"));
            });

            // Clear the Attempts spinner if the value is 0.
            $("#attempts").change(function () {
                var attemptsSpinner = $("#attempts");
                if (attemptsSpinner.prop("value") === 0) {
                    attemptsSpinner.prop("value", "");
                }
            });
        };

        StartView.prototype.configureLimitsInputs = function () {
            var _this = this;
            // When "endless" is checked or unchecked, toggle the game limits options (time limit, problems limit).
            var endless = $("#endless");
            endless.change(function () {
                var endlessChecked = endless.is(":checked");
                $("#limits").toggle(!endlessChecked);
            });

            // When "time limit" is checked or unchecked
            var timeLimit = $("#time-limit");
            timeLimit.change(function () {
                var timeChecked = timeLimit.is(":checked");
                var minutesSpinner = $("#minutes");
                minutesSpinner.prop("disabled", !timeChecked);
                var newValue = timeChecked ? _this.model.get("defaultMinutes") : "";
                minutesSpinner.prop("value", newValue);
                _this.checkForEndlessMode();
            });

            // When "number of problems" is checked or unchecked
            var problemsLimit = $("#problems-limit");
            problemsLimit.change(function () {
                var problemsLimitChecked = problemsLimit.is(":checked");
                var problemsSpinner = $("#num-problems");
                problemsSpinner.prop("disabled", !problemsLimitChecked);
                var newValue = problemsLimitChecked ? _this.model.get("defaultProblems") : "";
                problemsSpinner.prop("value", newValue);
                _this.checkForEndlessMode();
            });

            // When "number of attempts" is checked or unchecked
            var attemptsLimit = $("#attempts-limit");
            attemptsLimit.change(function () {
                var attemptsLimitChecked = attemptsLimit.is(":checked");
                var attemptsSpinner = $("#attempts");
                attemptsSpinner.prop("disabled", !attemptsLimitChecked);
                var newValue = attemptsLimitChecked ? _this.model.get("defaultAttempts") : "";
                attemptsSpinner.prop("value", newValue);
            });
        };

        StartView.prototype.checkForEndlessMode = function () {
            var limitsCheckboxes = $("#time-limit, #problems-limit");
            var bothLimitsUnchecked = !limitsCheckboxes.is(":checked");
            if (bothLimitsUnchecked) {
                // Check the "endless" and limits boxes again, triggering change events and resetting the spinners.
                $("#endless").prop("checked", true).change();
                limitsCheckboxes.prop("checked", true).change();
                $("#minutes").prop("value", this.model.get("defaultMinutes"));
                $("#num-problems").prop("value", this.model.get("defaultProblems"));
            }
        };
        return StartView;
    })(Backbone.View);

    /**
    * Logic that pertains to showing a game session.
    */
    var GameView = (function (_super) {
        __extends(GameView, _super);
        function GameView() {
            _super.apply(this, arguments);
            this.template = gameTemplate();
            this.problemsTemplate = compile("#problems-partial");
            this.messageTemplate = compile("#message-partial");
            this.clockTemplate = compile("#clock-partial");
        }
        /**
        * Renders the entire game view at once and adds it to the view container.
        * @return The game view, to allow render chaining
        */
        GameView.prototype.render = function () {
            // Put the template HTML into a DOM element.
            var templateHTML = this.template(this.model.attributes);
            this.$el.html(templateHTML);

            // Add the view to the DOM.
            $("#view-container").append(this.el);
            this.setUp();

            return this;
        };

        GameView.prototype.renderTimer = function () {
            var templateHTML = this.clockTemplate(this.model.attributes);
            $("#timer").html(templateHTML);
            return this;
        };

        GameView.prototype.renderProblems = function () {
            var templateHTML = this.problemsTemplate(this.model.attributes);
            $("#problems").html(templateHTML);
            $("#incorrect").hide();

            // Determine the class (correct or not) of the previous problem.
            var previous = $("#previous");
            previous.show();
            var wasCorrect = this.model.attributes.previousProblem.correct;
            previous.toggleClass("correct", wasCorrect);

            var answerBox = $("#answer-box");
            answerBox.prop("value", ""); // Clear the box.
            answerBox.focus();

            return this;
        };

        GameView.prototype.renderIncorrectMessage = function () {
            var templateHTML = this.messageTemplate(this.model.attributes);
            var incorrect = $("#incorrect");
            incorrect.html(templateHTML);

            var attempts = this.model.attributes.remainingAttempts;
            var remainingAttemptsDecreased = this.model.previous("remainingAttempts") > attempts;
            incorrect.toggle(remainingAttemptsDecreased);

            return this;
        };

        GameView.prototype.setUp = function () {
            var view = this;
            $("#answer-box").keyup(function (event) {
                // If the ENTER key was pressed
                if (event.which === 13) {
                    var answer = parseInt($("#answer-box").prop("value"));
                    view.model.evaluateAnswer(answer);
                }
            });

            // Listen for change events.
            this.listenTo(this.model, "change:time", this.renderTimer);
            this.listenTo(this.model, "change:currentProblem", this.renderProblems);
            this.listenTo(this.model, "change:remainingAttempts", this.renderIncorrectMessage);
            this.listenToOnce(this.model, "change:gameOver", this.remove);
        };
        return GameView;
    })(Backbone.View);

    var EndView = (function (_super) {
        __extends(EndView, _super);
        function EndView() {
            _super.apply(this, arguments);
            this.template = compile("#endgame-view");
        }
        EndView.prototype.initialize = function () {
            var _this = this;
            // Listen for the game over event.
            this.listenToOnce(this.model, "change:gameOver", function () {
                _this.render();
                _this.setHidden(false);
            });
        };

        EndView.prototype.render = function () {
            // Put the template HTML into a DOM element.
            var templateHTML = this.template(this.model.attributes);
            this.$el.html(templateHTML);

            // Add the view to the DOM.
            $("#view-container").append(this.el);

            return this;
        };

        EndView.prototype.setHidden = function (hidden) {
            this.$el.toggle(!hidden);
        };
        return EndView;
    })(Backbone.View);

    /**
    * Controls the initial rendering of the views.
    */
    var App = (function () {
        function App() {
            var _this = this;
            this.startView = new StartView({
                model: new Model.Defaults(),
                id: "start",
                events: {
                    "click #start-button": function () {
                        _this.beginGame();
                        _this.startView.setHidden(true);
                    }
                }
            });
            this.startView.render();
        }
        App.prototype.endGame = function () {
            this.gameModel.endGame();
            if (this.gameModel.attributes.endless) {
                this.endView.render();
                this.endView.setHidden(false);
            } else {
                this.endView.remove();
                this.startView.setHidden(false);
            }
            this.game.remove();
        };

        App.prototype.beginGame = function () {
            var _this = this;
            var checkedElements = $("#problem-types-list").find(":checked");
            var problemTypes = [];
            checkedElements.each(function (index, element) {
                problemTypes.push(Arithmetic.stringToOp(element.getAttribute("id")));
            });

            var endlessMode = $("#endless").is(":checked");
            var numProblems = endlessMode ? 0 : $("#num-problems").prop("value");
            var timeLimit = endlessMode ? 0 : $("#minutes").prop("value");

            this.gameModel = new Model.Game({
                types: problemTypes,
                totalProblems: numProblems,
                totalAttempts: $("#attempts").prop("value"),
                minutes: timeLimit,
                endless: endlessMode
            });

            this.endView = new EndView({
                model: this.gameModel,
                id: "endgame",
                events: {
                    "click #back-button": function () {
                        _this.startView.setHidden(false);
                        _this.endView.remove();
                    }
                }
            });
            this.endView.setHidden(true);

            this.game = new GameView({
                model: this.gameModel,
                id: "game",
                events: {
                    "click #quit-button": function () {
                        _this.endGame();
                    }
                }
            });
            this.game.render();
            $("#previous").hide();
            $("#incorrect").hide();
            $("#endgame").hide();
            $("#answer-box").focus();
        };
        return App;
    })();
    View.App = App;
})(View || (View = {}));
//# sourceMappingURL=View.js.map
