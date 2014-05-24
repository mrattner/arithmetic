module Rand {
	function randomInt (min:number, max:number):number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	export function oneDigit ():number {
		return randomInt(1, 9);
	}

	export function twoDigit ():number {
		return randomInt(10, 99);
	}

	export function multiplier ():number {
		return randomInt(2, 25);
	}

	export function choose<T> (choices:T[]):T {
		var chosenIndex = randomInt(0, choices.length - 1);
		return choices[chosenIndex];
	}
}