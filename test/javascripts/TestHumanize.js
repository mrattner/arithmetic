var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var tsUnit;
(function (tsUnit) {
    var Test = (function () {
        function Test() {
            this.tests = [];
            this.testClass = new TestClass();
        }
        Test.prototype.addTestClass = function (testClass, name) {
            if (typeof name === "undefined") { name = 'Tests'; }
            this.tests.push(new TestDefintion(testClass, name));
        };

        Test.prototype.isReservedFunctionName = function (functionName) {
            for (var prop in this.testClass) {
                if (prop === functionName) {
                    return true;
                }
            }
            return false;
        };

        Test.prototype.run = function () {
            var testContext = new TestContext();
            var testResult = new TestResult();

            for (var i = 0; i < this.tests.length; ++i) {
                var testClass = this.tests[i].testClass;
                var testName = this.tests[i].name;
                for (var prop in testClass) {
                    if (!this.isReservedFunctionName(prop)) {
                        if (typeof testClass[prop] === 'function') {
                            if (typeof testClass['setUp'] === 'function') {
                                testClass['setUp']();
                            }
                            try  {
                                testClass[prop](testContext);
                                testResult.passes.push(new TestDescription(testName, prop, 'OK'));
                            } catch (err) {
                                testResult.errors.push(new TestDescription(testName, prop, err));
                            }
                            if (typeof testClass['tearDown'] === 'function') {
                                testClass['tearDown']();
                            }
                        }
                    }
                }
            }

            return testResult;
        };

        Test.prototype.showResults = function (target, result) {
            var template = '<article>' + '<h1>' + this.getTestResult(result) + '</h1>' + '<p>' + this.getTestSummary(result) + '</p>' + '<section id="tsFail">' + '<h2>Errors</h2>' + '<ul class="bad">' + this.getTestResultList(result.errors) + '</ul>' + '</section>' + '<section id="tsOkay">' + '<h2>Passing Tests</h2>' + '<ul class="good">' + this.getTestResultList(result.passes) + '</ul>' + '</section>' + '</article>';

            target.innerHTML = template;
        };

        Test.prototype.getTestResult = function (result) {
            return result.errors.length === 0 ? 'Test Passed' : 'Test Failed';
        };

        Test.prototype.getTestSummary = function (result) {
            return 'Total tests: <span id="tsUnitTotalCout">' + (result.passes.length + result.errors.length).toString() + '</span>. ' + 'Passed tests: <span id="tsUnitPassCount" class="good">' + result.passes.length + '</span>. ' + 'Failed tests: <span id="tsUnitFailCount" class="bad">' + result.errors.length + '</span>.';
        };

        Test.prototype.getTestResultList = function (testResults) {
            var list = '';
            var group = '';
            var isFirst = true;
            for (var i = 0; i < testResults.length; ++i) {
                var result = testResults[i];
                if (result.testName !== group) {
                    group = result.testName;
                    if (isFirst) {
                        isFirst = false;
                    } else {
                        list += '</li></ul>';
                    }
                    list += '<li>' + result.testName + '<ul>';
                }
                list += '<li>' + result.funcName + '(): ' + this.encodeHtmlEntities(result.message) + '</li>';
            }
            return list + '</ul>';
        };

        Test.prototype.encodeHtmlEntities = function (input) {
            var entitiesToReplace = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
            input.replace(/[&<>]/g, function (entity) {
                return entitiesToReplace[entity] || entity;
            });
            return input;
        };
        return Test;
    })();
    tsUnit.Test = Test;

    var TestContext = (function () {
        function TestContext() {
        }
        TestContext.prototype.setUp = function () {
        };

        TestContext.prototype.tearDown = function () {
        };

        TestContext.prototype.areIdentical = function (a, b) {
            if (a !== b) {
                throw 'areIdentical failed when passed ' + '{' + (typeof a) + '} "' + a + '" and ' + '{' + (typeof b) + '} "' + b + '"';
            }
        };

        TestContext.prototype.areNotIdentical = function (a, b) {
            if (a === b) {
                throw 'areNotIdentical failed when passed ' + '{' + (typeof a) + '} "' + a + '" and ' + '{' + (typeof b) + '} "' + b + '"';
            }
        };

        TestContext.prototype.isTrue = function (a) {
            if (!a) {
                throw 'isTrue failed when passed ' + '{' + (typeof a) + '} "' + a + '"';
            }
        };

        TestContext.prototype.isFalse = function (a) {
            if (a) {
                throw 'isFalse failed when passed ' + '{' + (typeof a) + '} "' + a + '"';
            }
        };

        TestContext.prototype.isTruthy = function (a) {
            if (!a) {
                throw 'isTrue failed when passed ' + '{' + (typeof a) + '} "' + a + '"';
            }
        };

        TestContext.prototype.isFalsey = function (a) {
            if (a) {
                throw 'isFalse failed when passed ' + '{' + (typeof a) + '} "' + a + '"';
            }
        };

        TestContext.prototype.throws = function (a) {
            var isThrown = false;
            try  {
                a();
            } catch (ex) {
                isThrown = true;
            }
            if (!isThrown) {
                throw 'did not throw an error';
            }
        };

        TestContext.prototype.fail = function () {
            throw 'fail';
        };
        return TestContext;
    })();
    tsUnit.TestContext = TestContext;

    var TestClass = (function (_super) {
        __extends(TestClass, _super);
        function TestClass() {
            _super.apply(this, arguments);
        }
        return TestClass;
    })(TestContext);
    tsUnit.TestClass = TestClass;

    var FakeFunction = (function () {
        function FakeFunction(name, delgate) {
            this.name = name;
            this.delgate = delgate;
        }
        return FakeFunction;
    })();
    tsUnit.FakeFunction = FakeFunction;

    var Fake = (function () {
        function Fake(obj) {
            for (var prop in obj) {
                if (typeof obj[prop] === 'function') {
                    this[prop] = function () {
                    };
                } else {
                    this[prop] = null;
                }
            }
        }
        Fake.prototype.create = function () {
            return this;
        };

        Fake.prototype.addFunction = function (name, delegate) {
            this[name] = delegate;
        };

        Fake.prototype.addProperty = function (name, value) {
            this[name] = value;
        };
        return Fake;
    })();
    tsUnit.Fake = Fake;

    var TestDefintion = (function () {
        function TestDefintion(testClass, name) {
            this.testClass = testClass;
            this.name = name;
        }
        return TestDefintion;
    })();

    var TestError = (function () {
        function TestError(name, message) {
            this.name = name;
            this.message = message;
        }
        return TestError;
    })();

    var TestDescription = (function () {
        function TestDescription(testName, funcName, message) {
            this.testName = testName;
            this.funcName = funcName;
            this.message = message;
        }
        return TestDescription;
    })();
    tsUnit.TestDescription = TestDescription;

    var TestResult = (function () {
        function TestResult() {
            this.passes = [];
            this.errors = [];
        }
        return TestResult;
    })();
    tsUnit.TestResult = TestResult;
})(tsUnit || (tsUnit = {}));
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
            return elapsedTime.hours() + ":" + elapsedTime.minutes() + ":" + elapsedTime.seconds();
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
                return timeRemaining.hours() + ":" + zeroFill(timeRemaining.minutes()) + ":" + zeroFill(timeRemaining.seconds());
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
/// <reference path="lib/tsUnit.ts" />
/// <reference path="../app/Time.ts" />
var HumanizeTest = (function (_super) {
    __extends(HumanizeTest, _super);
    function HumanizeTest() {
        _super.apply(this, arguments);
    }
    HumanizeTest.prototype.testYearsEtc = function () {
        var yearsEtc = moment.duration({
            milliseconds: 800,
            seconds: 23,
            minutes: 5,
            hours: 8,
            days: 1,
            months: 1,
            years: 1
        });
        var hours = 24 + 30 * 24 + 365 * 24 + 8;
        this.areIdentical(hours + " hours, 5 minutes and 24 seconds", Time.humanize(yearsEtc));
    };

    HumanizeTest.prototype.testHoursOnly = function () {
        var hoursOnly = moment.duration({ hours: 5 });
        this.areIdentical("5 hours", Time.humanize(hoursOnly));
    };

    HumanizeTest.prototype.testMinutesOnly = function () {
        var minutesOnly = moment.duration({ minutes: 48 });
        this.areIdentical("48 minutes", Time.humanize(minutesOnly));
    };

    HumanizeTest.prototype.testSecondsOnly = function () {
        var secondsOnly = moment.duration({ seconds: 54 });
        this.areIdentical("54 seconds", Time.humanize(secondsOnly));
    };

    HumanizeTest.prototype.testMinutesAndSeconds = function () {
        var minutesAndSeconds = moment.duration({
            minutes: 2,
            seconds: 37
        });
        this.areIdentical("2 minutes and 37 seconds", Time.humanize(minutesAndSeconds));
    };

    HumanizeTest.prototype.testHoursAndSeconds = function () {
        var hoursAndSeconds = moment.duration({
            hours: 3,
            seconds: 28
        });
        this.areIdentical("3 hours and 28 seconds", Time.humanize(hoursAndSeconds));
    };

    HumanizeTest.prototype.testHoursAndMinutes = function () {
        var hoursAndMinutes = moment.duration({
            hours: 21,
            minutes: 4
        });
        this.areIdentical("21 hours and 4 minutes", Time.humanize(hoursAndMinutes));
    };

    HumanizeTest.prototype.testHoursMinutesAndSeconds = function () {
        var hoursMinutesAndSeconds = moment.duration({
            hours: 8,
            minutes: 59,
            seconds: 2
        });
        this.areIdentical("8 hours, 59 minutes and 2 seconds", Time.humanize(hoursMinutesAndSeconds));
    };
    return HumanizeTest;
})(tsUnit.TestClass);

var test = new tsUnit.Test();
test.addTestClass(new HumanizeTest());
test.showResults(document.getElementById("result"), test.run());
//# sourceMappingURL=TestHumanize.js.map
