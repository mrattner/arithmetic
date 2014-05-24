/// <reference path="Rand.ts" />
var Arithmetic;
(function (Arithmetic) {
    (function (Op) {
        Op[Op["ADD"] = 0] = "ADD";
        Op[Op["SUBTRACT"] = 1] = "SUBTRACT";
        Op[Op["MULTIPLY"] = 2] = "MULTIPLY";
        Op[Op["DIVIDE"] = 3] = "DIVIDE";
    })(Arithmetic.Op || (Arithmetic.Op = {}));
    var Op = Arithmetic.Op;

    function stringToOp(operation) {
        switch (operation.toLowerCase()) {
            case "addition":
                return 0 /* ADD */;
            case "subtraction":
                return 1 /* SUBTRACT */;
            case "multiplication":
                return 2 /* MULTIPLY */;
            case "division":
                return 3 /* DIVIDE */;
            default:
                throw "stringToOp: Invalid operation name";
        }
    }
    Arithmetic.stringToOp = stringToOp;

    var Addition = (function () {
        function Addition() {
            this.type = 0 /* ADD */;
            this.symbol = "+";
            var twoAddends = [Rand.twoDigit(), Rand.twoDigit()];
            var threeAddends = [
                Rand.oneDigit(), Rand.oneDigit(),
                Rand.oneDigit()];

            this.operands = Rand.choose([twoAddends, threeAddends]);
            this.answer = this.getSum(this.operands);
        }
        Addition.prototype.getSum = function (addends) {
            var sum = 0;
            addends.forEach(function (addend) {
                sum += addend;
            });
            return sum;
        };
        return Addition;
    })();
    Arithmetic.Addition = Addition;

    var Subtraction = (function () {
        function Subtraction() {
            this.type = 1 /* SUBTRACT */;
            this.symbol = "-";
            var first = Rand.choose([Rand.oneDigit(), Rand.twoDigit()]);
            var second = Rand.twoDigit();
            var minuend = Math.max(first, second);
            var subtrahend = Math.min(first, second);

            this.operands = [minuend, subtrahend];
            this.answer = minuend - subtrahend;
        }
        return Subtraction;
    })();
    Arithmetic.Subtraction = Subtraction;

    var Multiplication = (function () {
        function Multiplication() {
            this.type = 2 /* MULTIPLY */;
            this.symbol = "*";
            var first = Rand.multiplier();
            var second = Rand.multiplier();

            this.operands = [first, second];
            this.answer = first * second;
        }
        return Multiplication;
    })();
    Arithmetic.Multiplication = Multiplication;

    var Division = (function () {
        function Division() {
            this.type = 3 /* DIVIDE */;
            this.symbol = "/";
            var mult = new Multiplication();
            var dividend = mult.answer;
            var divisor = mult.operands[0];
            var quotient = mult.operands[1];

            this.operands = [dividend, divisor];
            this.answer = quotient;
        }
        return Division;
    })();
    Arithmetic.Division = Division;
})(Arithmetic || (Arithmetic = {}));
//# sourceMappingURL=Arithmetic.js.map
