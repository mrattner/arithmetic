/// <reference path="../lib/moment.d.ts" />

module Time {
	/**
	 * Utility for keeping track of game time.
	 */
	export class Timer {
		private startTime:number;
		private stopTime:number;
		private timeLimit:number;

		constructor (maxMinutes?:number) {
			this.startTime = Date.now();
			if (maxMinutes) {
				this.timeLimit = moment.duration({minutes: maxMinutes}).asMilliseconds();
			}
		}

		public stop ():void {
			this.stopTime = Date.now();
		}

		public getElapsedTime ():string {
			var elapsedTime:Duration = moment.duration(this.getElapsedTimeMilliseconds());
			return zeroFill(elapsedTime.hours()) + ":" + zeroFill(elapsedTime.minutes()) + ":" +
					zeroFill(elapsedTime.seconds());
		}

		public getHumanizedTotalTime ():string {
			return humanize(moment.duration(this.getElapsedTimeMilliseconds()));
		}

		private getElapsedTimeMilliseconds ():number {
			var stopTime = this.stopTime ? this.stopTime : Date.now();
			return stopTime - this.startTime;
		}

		public getTimeRemaining ():string {
			if (this.timeLimit) {
				var timeRemaining:Duration = moment.duration(this.timeLimit - this.getElapsedTimeMilliseconds());
				return zeroFill(timeRemaining.hours()) + ":" + zeroFill(timeRemaining.minutes()) + ":" +
						zeroFill(timeRemaining.seconds());
			} else {
				return "";
			}
		}

		public getTimeLimitMilliseconds ():number {
			return this.timeLimit;
		}
	}

	export function humanize (duration:Duration):string {
		var extraHours:number = 0;
		extraHours += duration.years() * 365 * 24;
		extraHours += duration.months() * 30 * 24;
		extraHours += duration.days() * 24;

		var roundUp:boolean = duration.milliseconds() >= 500;
		var numSeconds:number = roundUp ? duration.seconds() + 1 : duration.seconds();

		var hours: string = pluralizeUnit(duration.hours() + extraHours, "hour");
		var minutes: string = pluralizeUnit(duration.minutes(), "minute");
		var seconds: string = pluralizeUnit(numSeconds, "second");

		var timeString:string = "";

		if (seconds) {
			timeString = seconds;
		}
		if (minutes) {
			if (seconds) {
				timeString = minutes + " and " + timeString;
			} else {
				timeString = minutes;
			}
		}
		if (hours) {
			if (minutes && !seconds || seconds && !minutes) {
				timeString = hours + " and " + timeString;
			} else if (minutes && seconds) {
				timeString = hours + ", " + timeString;
			} else {
				timeString = hours;
			}
		}
		if (!timeString) {
			timeString = "0 seconds";
		}

		return timeString;
	}

	function pluralizeUnit (amount: number, unit:string) :string {
		var str :string = amount + " " + unit;
		if (amount === 0) {
			return "";
		}
		if (amount !== 1) {
			str += "s";
		}
		return str;
	}

	function zeroFill (num:number) :string {
		if (num < 10 && num > -10) {
			return "0" + num;
		} else {
			return num.toString();
		}
	}
}