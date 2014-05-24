/// <reference path="lib/tsUnit.ts" />
/// <reference path="../app/Time.ts" />

class HumanizeTest extends tsUnit.TestClass {
	testYearsEtc ():void {
		var yearsEtc:Duration = moment.duration({
			milliseconds: 800,
			seconds: 23,
			minutes: 5,
			hours: 8,
			days: 1,
			months: 1,
			years: 1
		});
		var hours = 24 + 30*24 + 365*24 + 8;
		this.areIdentical(hours + " hours, 5 minutes and 24 seconds", Time.humanize(yearsEtc));
	}

	testHoursOnly ():void {
		var hoursOnly:Duration = moment.duration({hours: 5});
		this.areIdentical("5 hours", Time.humanize(hoursOnly));
	}

	testMinutesOnly ():void {
		var minutesOnly:Duration = moment.duration({minutes: 48});
		this.areIdentical("48 minutes", Time.humanize(minutesOnly));
	}

	testSecondsOnly ():void {
		var secondsOnly:Duration = moment.duration({seconds: 54});
		this.areIdentical("54 seconds", Time.humanize(secondsOnly));
	}

	testMinutesAndSeconds ():void {
		var minutesAndSeconds:Duration = moment.duration({
			minutes: 2,
			seconds: 37
		});
		this.areIdentical("2 minutes and 37 seconds", Time.humanize(minutesAndSeconds));
	}

	testHoursAndSeconds ():void {
		var hoursAndSeconds:Duration = moment.duration({
			hours: 3,
			seconds: 28
		});
		this.areIdentical("3 hours and 28 seconds", Time.humanize(hoursAndSeconds));
	}

	testHoursAndMinutes():void {
		var hoursAndMinutes: Duration = moment.duration({
			hours: 21,
			minutes: 4
		});
		this.areIdentical("21 hours and 4 minutes", Time.humanize(hoursAndMinutes));
	}

	testHoursMinutesAndSeconds ():void {
		var hoursMinutesAndSeconds: Duration = moment.duration({
			hours: 8,
			minutes: 59,
			seconds: 2
		});
		this.areIdentical("8 hours, 59 minutes and 2 seconds", Time.humanize(hoursMinutesAndSeconds));
	}
}

var test = new tsUnit.Test();
test.addTestClass(new HumanizeTest());
test.showResults(document.getElementById("result"), test.run());