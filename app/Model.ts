/// <reference path="Arithmetic.ts" />
/// <reference path="Rand.ts" />
/// <reference path="Time.ts" />
/// <reference path="../lib/backbone.d.ts" />

module Model {
	var DEFAULT_NUM_PROBLEMS:number = 20;
	var DEFAULT_ATTEMPTS:number = 2;
	var DEFAULT_MINUTES:number = 2;
	var DEFAULT_TYPES:Arithmetic.Op[] = [Arithmetic.Op.ADD];

	/**
	 * Defines the attributes of a Game that may be passed in to the Game constructor and set by the view.
	 */
	export interface SettableGameAttributes {
		types:Arithmetic.Op[];
		totalProblems:number;
		totalAttempts:number;
		minutes:number;
		endless:boolean;
	}

	/**
	 * Defines an object that holds the previous problem's string value and whether the player answered it correctly.
	 */
	export interface PreviousProblem {
		text:string;
		correct:boolean;
	}

	export class Game extends Backbone.Model {
		private timer:Time.Timer;
		private problem:Arithmetic.Problem;

		/**
		 * Specifies the default attributes for the model. When creating an instance of the model, any unspecified
		 * attributes will be set to their default value.
		 * @return The default settable game attributes
		 */
		defaults ():SettableGameAttributes {
			return {
				types: DEFAULT_TYPES,
				totalProblems: DEFAULT_NUM_PROBLEMS,
				totalAttempts: DEFAULT_ATTEMPTS,
				minutes: 0,
				endless: false
			};
		}

		/**
		 * Override the default get method when getting the time.
		 * @param attributeName The attribute whose value to get
		 * @return The value of the specified attribute
		 */
		get (attributeName:string):any {
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
				return super.get(attributeName);
			default:
				throw "Model.Game.get: Invalid attribute name.";
			}
		}

		private setTime (timeString:string):void {
			super.set({time: timeString});
		}

		public setCurrentProblem (problem:string):void {
			super.set({currentProblem: problem});
		}

		public setPreviousProblem (problem:PreviousProblem):void {
			super.set({previousProblem: problem});
		}

		public setRemainingAttempts (attempts:number):void {
			super.set({remainingAttempts: attempts});
		}

		public setProblemsAnswered (numAnswered:number):void {
			super.set({problemsAnswered: numAnswered});
		}

		public setGameOver (over:boolean):void {
			super.set({gameOver: over});
		}

		/**
		 * Invoked when the model is created.
		 * @param attributes Initial values to be set on the model
		 */
		initialize (attributes?:SettableGameAttributes):void {
			this.timer = new Time.Timer(attributes.minutes);
			this.problem = this.newProblem();

			// Set the game's other attributes that were not passed in to the constructor.
			var numAttempts:number = attributes.totalAttempts ? attributes.totalAttempts : 0;
			var hasTimeLimit:boolean = attributes.minutes > 0;
			this.setCurrentProblem(getProblemString(this.problem));
			this.setPreviousProblem({text: "", correct: false});
			this.setRemainingAttempts(numAttempts);
			this.setProblemsAnswered(0);
			this.setTime(this.generateTimeString(hasTimeLimit));
			this.setGameOver(false);

			// If there is a time limit, end the game after that amount of time.
			if (attributes.minutes) {
				setTimeout(() => {
					this.endGame()
				}, this.timer.getTimeLimitMilliseconds());
			}

			// Every second, update the time string.
			setInterval(() => {
				this.setTime(this.generateTimeString(hasTimeLimit))
			}, 1000);
		}

		/**
		 * Helper function for getting the correct time string based on whether the timer has a time limit.
		 * @param hasTimeLimit Whether there is a time limit
		 */
		private generateTimeString (hasTimeLimit:boolean):string {
			return hasTimeLimit ? this.timer.getTimeRemaining() : this.timer.getElapsedTime();
		}

		/**
		 * Sets the previous problem to the current problem and sets the current problem to a new problem.
		 * @param wasCorrect Whether the answer to the most recently answered problem was correct
		 */
		private setProblems (wasCorrect:boolean):void {
			var previous:PreviousProblem = {
				text: getFullProblemString(this.problem),
				correct: wasCorrect
			};
			this.problem = this.newProblem();
			this.setPreviousProblem(previous);
			this.setCurrentProblem(getProblemString(this.problem));

			if (wasCorrect) {
				var previousProblemsAnswered = this.get("problemsAnswered");
				this.setProblemsAnswered(previousProblemsAnswered + 1)
			}

			// Decide whether to continue the game.
			var endlessMode:boolean = this.get("endless");
			var maxProblems:number = this.get("totalProblems");
			var answeredAllProblems:boolean = this.get("problemsAnswered") >= maxProblems;
			if ((maxProblems && !endlessMode) && answeredAllProblems) {
				this.endGame();
			}
		}

		/**
		 * If the given answer was correct, or if the player is out of attempts, go on to the next problem.
		 * @param answer The proposed answer to the current problem
		 */
		public evaluateAnswer (answer:number):boolean {
			var isCorrect = (answer === this.problem.answer);

			if (!isCorrect) {
				// Decrement the number of attempts remaining.
				var previousRemainingAttempts:number = this.get("remainingAttempts");
				this.setRemainingAttempts(previousRemainingAttempts - 1);
			}

			// If total attempts was set as 0, player gets unlimited attempts.
			var totalAttempts:number = this.get("totalAttempts");
			var giveUp:boolean = totalAttempts && this.get("remainingAttempts") <= 0;

			if (isCorrect || giveUp) {
				// Move on to the next problem.
				this.setProblems(isCorrect);
				// Reset the number of attempts to maximum.
				this.setRemainingAttempts(this.get("totalAttempts"));
			}

			return isCorrect;
		}

		/**
		 * Generates a new arithmetic problem from one of this game's allowed problem types.
		 * @return a random new arithmetic problem
		 */
		private newProblem ():Arithmetic.Problem {
			var types:Arithmetic.Op[] = this.get("types");
			var problemType:Arithmetic.Op = Rand.choose(types);

			switch (problemType) {
			case Arithmetic.Op.ADD:
				return new Arithmetic.Addition();
			case Arithmetic.Op.SUBTRACT:
				return new Arithmetic.Subtraction();
			case Arithmetic.Op.MULTIPLY:
				return new Arithmetic.Multiplication();
			case Arithmetic.Op.DIVIDE:
				return new Arithmetic.Division();
			default:
				throw "nextProblem: Invalid problem type";
			}
		}

		public endGame ():void {
			this.timer.stop();
			this.setTime(this.timer.getHumanizedTotalTime());
			this.setGameOver(true);
		}
	}

	/**
	 * Produces a human-readable representation of an arithmetic problem without an answer.
	 * @param problem An arithmetic problem
	 * @return Representation of the problem as a string, without including the answer
	 */
	function getProblemString (problem:Arithmetic.Problem):string {
		var problemString:string = "";
		problem.operands.forEach(
				(op:number, index:number) => {
					problemString += op + " ";
					if (index < problem.operands.length - 1) {
						problemString += problem.symbol + " ";
					} else {
						problemString += "="
					}
				}
		);
		return problemString;
	}

	/**
	 * Produces a human-readable representation of an arithmetic problem, including the answer.
	 * @param problem An arithmetic problem
	 * @return Representation of the problem and answer as a string
	 */
	function getFullProblemString (problem:Arithmetic.Problem):string {
		return getProblemString(problem) + " " + problem.answer;
	}

	/**
	 * Defines a model for the default values needed by the view. This model does not change its attributes.
	 */
	export class Defaults extends Backbone.Model {
		/**
		 * Override to not take any attributes.
		 */
		initialize ():void {
			super.initialize();
		}

		defaults ():Object {
			return {
				defaultProblems: DEFAULT_NUM_PROBLEMS,
				defaultAttempts: DEFAULT_ATTEMPTS,
				defaultMinutes: DEFAULT_MINUTES
			}
		}
	}
}