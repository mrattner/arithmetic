/// <reference path="../lib/moment.d.ts" />
var Time;
(function (Time) {
    /**
    * Utility for keeping track of game time.
    */
    var Timer = (function () {
        function Timer(maxMinutes) {
            this.startTime = Date.now();
            if (maxMinutes) {
                this.timeLimit = moment.duration({ minutes: maxMinutes }).asMilliseconds();
            }
        }
        Timer.prototype.stop = function () {
            this.stopTime = Date.now();
        };

        Timer.prototype.getElapsedTime = function () {
            var elapsedTime = moment.duration(this.getElapsedTimeMilliseconds());
            return zeroFill(elapsedTime.hours()) + ":" + zeroFill(elapsedTime.minutes()) + ":" + zeroFill(elapsedTime.seconds());
        };

        Timer.prototype.getHumanizedTotalTime = function () {
            return humanize(moment.duration(this.getElapsedTimeMilliseconds()));
        };

        Timer.prototype.getElapsedTimeMilliseconds = function () {
            var stopTime = this.stopTime ? this.stopTime : Date.now();
            return stopTime - this.startTime;
        };

        Timer.prototype.getTimeRemaining = function () {
            if (this.timeLimit) {
                var timeRemaining = moment.duration(this.timeLimit - this.getElapsedTimeMilliseconds());
                return zeroFill(timeRemaining.hours()) + ":" + zeroFill(timeRemaining.minutes()) + ":" + zeroFill(timeRemaining.seconds());
            } else {
                return "";
            }
        };

        Timer.prototype.getTimeLimitMilliseconds = function () {
            return this.timeLimit;
        };
        return Timer;
    })();
    Time.Timer = Timer;

    function humanize(duration) {
        var extraHours = 0;
        extraHours += duration.years() * 365 * 24;
        extraHours += duration.months() * 30 * 24;
        extraHours += duration.days() * 24;

        var roundUp = duration.milliseconds() >= 500;
        var numSeconds = roundUp ? duration.seconds() + 1 : duration.seconds();

        var hours = pluralizeUnit(duration.hours() + extraHours, "hour");
        var minutes = pluralizeUnit(duration.minutes(), "minute");
        var seconds = pluralizeUnit(numSeconds, "second");

        var timeString = "";

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
    Time.humanize = humanize;

    function pluralizeUnit(amount, unit) {
        var str = amount + " " + unit;
        if (amount === 0) {
            return "";
        }
        if (amount !== 1) {
            str += "s";
        }
        return str;
    }

    function zeroFill(num) {
        if (num < 10 && num > -10) {
            return "0" + num;
        } else {
            return num.toString();
        }
    }
})(Time || (Time = {}));
//# sourceMappingURL=Time.js.map
