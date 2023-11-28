'use strict';
const util = require('util');
const events = require('events');

const Battery = class Battery extends events.EventEmitter {
	constructor() {
		super();
		this._container = Battery.CONTAINER.CUP;
		this._types = Battery.TYPES.NONE;
	}
	prepare() {
		console.log('Bereite Eis vor.');
		setTimeout(() => {
			let result = Battery.STATUS.READY;
			this.emit('ready', result);
		}, 5000);
	}
	set container(value) {
		this._container = value;
	}
	get container() {
		return this._container;
	}
	set types(value) {
		this._types = value;
	}
	get types() {
		return this._types;
	}
};
// Globale Eigenschaften
Battery.CONTAINER = {
	CUP: 0,
	CONE: 1
};
Battery.TYPES = {
	NONE: 0,
	CHOCOLATE: 1 << 0,
	VANILLA: 1 << 1
};
Battery.STATUS = {
	ORDERED: 0,
	PREPARED: 1,
	READY: 2
};
module.exports = Battery;
