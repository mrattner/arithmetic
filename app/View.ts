/// <reference path="Model.ts" />
/// <reference path="Arithmetic.ts" />
/// <reference path="../lib/backbone.d.ts" />
/// <reference path="../lib/handlebars.d.ts" />

module View {
	function compile (templateElementName:string):HandlebarsTemplateDelegate {
		return Handlebars.compile($(templateElementName).html());
	}

	function gameTemplate ():HandlebarsTemplateDelegate {
		Handlebars.registerPartial("problems", compile("#problems-partial"));
		Handlebars.registerPartial("message", compile("#message-partial"));
		Handlebars.registerPartial("clock", compile("#clock-partial"));
		return compile("#game-view");
	}

	/**
	 * Logic pertaining to showing the Start and Instructions screens.
	 */
	class StartView extends Backbone.View<Model.Defaults> implements HandlebarsTemplatable {
		template:HandlebarsTemplateDelegate = compile("#start-view");

		render ():Backbone.View<Model.Defaults> {
			// Put the template HTML into a DOM element.
			this.$el.html(this.template(this.model.attributes));
			// Add the view element to the DOM if it isn't there already.
			$("#view-container").append(this.el);
			this.setUp();
			return this;
		}

		public setHidden (hidden:boolean):void {
			this.$el.toggle(!hidden);
		}

		static toggleInstructions (show:boolean):void {
			$("#instructions").toggle(show);
			$("#game-options").toggle(!show);
			$("#help-button").toggle(!show);
			$("#start-button").toggle(!show);
		}

		private setUp ():void {
			StartView.toggleInstructions(false);
			this.configureLimitsInputs();

			// Bind the appropriate listeners to the buttons.
			$("#help-button").click(() => {
				StartView.toggleInstructions(true);
			});
			$("#back-button").click(() => {
				StartView.toggleInstructions(false);
			});

			// Disable the start button if the user hasn't selected at least 1 problem type.
			var problemTypeCheckboxes:JQuery = $("#problem-types-list").find("input");
			problemTypeCheckboxes.change(() => {
				$("#start-button").prop("disabled", !problemTypeCheckboxes.is(":checked"));
			});

			// Clear the Attempts spinner if the value is 0.
			$("#attempts").change(() => {
				var attemptsSpinner = $("#attempts");
				if (attemptsSpinner.prop("value") === 0) {
					attemptsSpinner.prop("value", "");
				}
			});
		}

		private configureLimitsInputs ():void {
			// When "endless" is checked or unchecked, toggle the game limits options (time limit, problems limit).
			var endless:JQuery = $("#endless");
			endless.change(() => {
				var endlessChecked:boolean = endless.is(":checked");
				$("#limits").toggle(!endlessChecked);
			});

			// When "time limit" is checked or unchecked
			var timeLimit:JQuery = $("#time-limit");
			timeLimit.change(() => {
				var timeChecked:boolean = timeLimit.is(":checked");
				var minutesSpinner:JQuery = $("#minutes");
				minutesSpinner.prop("disabled", !timeChecked);
				var newValue:number = timeChecked ? this.model.get("defaultMinutes") : "";
				minutesSpinner.prop("value", newValue);
				this.checkForEndlessMode();
			});

			// When "number of problems" is checked or unchecked
			var problemsLimit:JQuery = $("#problems-limit");
			problemsLimit.change(() => {
				var problemsLimitChecked:boolean = problemsLimit.is(":checked");
				var problemsSpinner:JQuery = $("#num-problems");
				problemsSpinner.prop("disabled", !problemsLimitChecked);
				var newValue:number = problemsLimitChecked ? this.model.get("defaultProblems") : "";
				problemsSpinner.prop("value", newValue);
				this.checkForEndlessMode();
			});

			// When "number of attempts" is checked or unchecked
			var attemptsLimit:JQuery = $("#attempts-limit");
			attemptsLimit.change(() => {
				var attemptsLimitChecked:boolean = attemptsLimit.is(":checked");
				var attemptsSpinner:JQuery = $("#attempts");
				attemptsSpinner.prop("disabled", !attemptsLimitChecked);
				var newValue:number = attemptsLimitChecked ? this.model.get("defaultAttempts") : "";
				attemptsSpinner.prop("value", newValue);
			});
		}

		private checkForEndlessMode ():void {
			var limitsCheckboxes:JQuery = $("#time-limit, #problems-limit");
			var bothLimitsUnchecked:boolean = !limitsCheckboxes.is(":checked");
			if (bothLimitsUnchecked) {
				// Check the "endless" and limits boxes again, triggering change events and resetting the spinners.
				$("#endless").prop("checked", true).change();
				limitsCheckboxes.prop("checked", true).change();
				$("#minutes").prop("value", this.model.get("defaultMinutes"));
				$("#num-problems").prop("value", this.model.get("defaultProblems"));
			}
		}
	}

	/**
	 * Logic that pertains to showing a game session.
	 */
	class GameView extends Backbone.View<Model.Game> implements HandlebarsTemplatable {
		template:HandlebarsTemplateDelegate = gameTemplate();
		problemsTemplate:HandlebarsTemplateDelegate = compile("#problems-partial");
		messageTemplate:HandlebarsTemplateDelegate = compile("#message-partial");
		clockTemplate:HandlebarsTemplateDelegate = compile("#clock-partial");

		/**
		 * Renders the entire game view at once and adds it to the view container.
		 * @return The game view, to allow render chaining
		 */
		render ():Backbone.View<Model.Game> {
			// Put the template HTML into a DOM element.
			var templateHTML:string = this.template(this.model.attributes);
			this.$el.html(templateHTML);

			// Add the view to the DOM.
			$("#view-container").append(this.el);
			this.setUp();

			return this;
		}

		private renderTimer ():Backbone.View<Model.Game> {
			var templateHTML:string = this.clockTemplate(this.model.attributes);
			$("#timer").html(templateHTML);
			return this;
		}

		private renderProblems ():Backbone.View<Model.Game> {
			var templateHTML:string = this.problemsTemplate(this.model.attributes);
			$("#problems").html(templateHTML);
			$("#incorrect").hide();

			// Determine the class (correct or not) of the previous problem.
			var previous = $("#previous");
			previous.show();
			var wasCorrect:boolean = this.model.attributes.previousProblem.correct;
			previous.toggleClass("correct", wasCorrect);

			var answerBox:JQuery = $("#answer-box");
			answerBox.prop("value", ""); // Clear the box.
			answerBox.focus();

			return this;
		}

		private renderIncorrectMessage ():Backbone.View<Model.Game> {
			var templateHTML:string = this.messageTemplate(this.model.attributes);
			var incorrect:JQuery = $("#incorrect");
			incorrect.html(templateHTML);

			var attempts:number = this.model.attributes.remainingAttempts;
			var remainingAttemptsDecreased:boolean = this.model.previous("remainingAttempts") > attempts;
			incorrect.toggle(remainingAttemptsDecreased);

			return this;
		}

		public setUp ():void {
			var view:Backbone.View<Model.Game> = this;
			$("#answer-box").keyup((event:KeyboardEvent) => {
				// If the ENTER key was pressed
				if (event.which === 13) {
					var answer:number = parseInt($("#answer-box").prop("value"));
					view.model.evaluateAnswer(answer);
				}
			});

			// Listen for change events.
			this.listenTo(this.model, "change:time", this.renderTimer);
			this.listenTo(this.model, "change:currentProblem", this.renderProblems);
			this.listenTo(this.model, "change:remainingAttempts", this.renderIncorrectMessage);
			this.listenToOnce(this.model, "change:gameOver", this.remove);
		}
	}

	class EndView extends Backbone.View<Model.Game> implements HandlebarsTemplatable {
		template: HandlebarsTemplateDelegate = compile("#endgame-view");

		initialize ():void {
			// Listen for the game over event.
			this.listenToOnce(this.model, "change:gameOver", () => {
				this.render();
				this.setHidden(false);
			});
		}

		render ():Backbone.View<Model.Game> {
			// Put the template HTML into a DOM element.
			var templateHTML:string = this.template(this.model.attributes);
			this.$el.html(templateHTML);

			// Add the view to the DOM.
			$("#view-container").append(this.el);

			return this;
		}

		public setHidden (hidden:boolean):void {
			this.$el.toggle(!hidden);
		}
	}

	/**
	 * Controls the initial rendering of the views.
	 */
	export class App {
		private startView:StartView;
		private game:GameView;
		private endView:EndView;
		private gameModel:Model.Game;

		constructor () {
			this.startView = new StartView({
				model: new Model.Defaults(),
				id: "start",
				events: {
					"click #start-button": () => {
						this.beginGame();
						this.startView.setHidden(true);
					}
				}
			});
			this.startView.render();
		}

		private endGame ():void {
			this.gameModel.endGame();
			if (this.gameModel.attributes.endless) {
				this.endView.render();
				this.endView.setHidden(false);
			} else {
				this.endView.remove();
				this.startView.setHidden(false);
			}
			this.game.remove();
		}

		private beginGame ():void {
			var checkedElements:JQuery = $("#problem-types-list").find(":checked");
			var problemTypes:Arithmetic.Op[] = [];
			checkedElements.each((index:number, element:Element) => {
				problemTypes.push(Arithmetic.stringToOp(element.getAttribute("id")));
			});

			var endlessMode:boolean = $("#endless").is(":checked");
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
					"click #back-button": () => {
						this.startView.setHidden(false);
						this.endView.remove();
					}
				}
			});
			this.endView.setHidden(true);

			this.game = new GameView({
				model: this.gameModel,
				id: "game",
				events: {
					"click #quit-button": () => {
						this.endGame();
					}
				}
			});
			this.game.render();
			$("#previous").hide();
			$("#incorrect").hide();
			$("#endgame").hide();
			$("#answer-box").focus();
		}
	}
}