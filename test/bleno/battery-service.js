'use strict';
const util = require('util');
const bleno = require('@stoprocent/bleno');

const BatteryReceiveCharacteristic = require('./battery_receive_characteristic');
const BatteryEmitCharacteristic = require('./battery_emit_characteristic');
//const BatteryUnknownCharacteristic = require('./battery_unknown_characteristic');

module.exports = class BatteryService extends bleno.PrimaryService {
	constructor(currentBattery) {
		super({
			uuid: 'ff00',
			characteristics: [
				new BatteryReceiveCharacteristic(currentBattery),
				new BatteryEmitCharacteristic(currentBattery)
				//new BatteryUnknownCharacteristic(currentBattery)
			]
		});
		this._currentBattery = currentBattery;
	}
	get currentBattery() {
		return this._currentBattery;
	}
};
