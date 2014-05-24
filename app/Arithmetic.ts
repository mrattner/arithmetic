/// <reference path="Rand.ts" />

module Arithmetic {
	export enum Op {
		ADD,
		SUBTRACT,
		MULTIPLY,
		DIVIDE
	}

	export function stringToOp (operation:string):Op {
		switch (operation.toLowerCase()) {
		case "addition":
			return Op.ADD;
		case "subtraction":
			return Op.SUBTRACT;
		case "multiplication":
			return Op.MULTIPLY;
		case "division":
			return Op.DIVIDE;
		default:
			throw "stringToOp: Invalid operation name";
		}
	}

	export interface Problem {
		type:Op;
		symbol:string;
		operands:number[];
		answer:number;
	}

	export class Addition implements Problem {
		type:Op = Op.ADD;
		symbol:string = "+";
		operands:number[];
		answer:number;

		constructor () {
			var twoAddends:number[] = [Rand.twoDigit(), Rand.twoDigit()];
			var threeAddends:number[] = [Rand.oneDigit(), Rand.oneDigit(),
				Rand.oneDigit()];

			this.operands = Rand.choose([twoAddends, threeAddends]);
			this.answer = this.getSum(this.operands);
		}

		private getSum (addends:number[]):number {
			var sum:number = 0;
			addends.forEach(function (addend:number):void {
				sum += addend;
			});
			return sum;
		}
	}

	export class Subtraction implements Problem {
		type:Op = Op.SUBTRACT;
		symbol:string = "-";
		operands:number[];
		answer:number;

		constructor () {
			var first:number = Rand.choose([Rand.oneDigit(), Rand.twoDigit()]);
			var second:number = Rand.twoDigit();
			var minuend:number = Math.max(first, second);
			var subtrahend:number = Math.min(first, second);

			this.operands = [minuend, subtrahend];
			this.answer = minuend - subtrahend;
		}
	}

	export class Multiplication implements Problem {
		type:Op = Op.MULTIPLY;
		symbol:string = "*";
		operands:number[];
		answer:number;

		constructor () {
			var first:number = Rand.multiplier();
			var second:number = Rand.multiplier();

			this.operands = [first, second];
			this.answer = first * second;
		}
	}

	export class Division implements Problem {
		type:Op = Op.DIVIDE;
		symbol:string = "/";
		operands:number[];
		answer:number;

		constructor () {
			var mult:Multiplication = new Multiplication();
			var dividend:number = mult.answer;
			var divisor:number = mult.operands[0];
			var quotient:number = mult.operands[1];

			this.operands = [dividend, divisor];
			this.answer = quotient;
		}
	}
}