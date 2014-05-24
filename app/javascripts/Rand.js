var Rand;
(function (Rand) {
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function oneDigit() {
        return randomInt(1, 9);
    }
    Rand.oneDigit = oneDigit;

    function twoDigit() {
        return randomInt(10, 99);
    }
    Rand.twoDigit = twoDigit;

    function multiplier() {
        return randomInt(2, 25);
    }
    Rand.multiplier = multiplier;

    function choose(choices) {
        var chosenIndex = randomInt(0, choices.length - 1);
        return choices[chosenIndex];
    }
    Rand.choose = choose;
})(Rand || (Rand = {}));
//# sourceMappingURL=Rand.js.map
