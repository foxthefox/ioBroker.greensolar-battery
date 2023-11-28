'use strict';
const util = require('util');
const bleno = require('@stoprocent/bleno');
const Characteristic = bleno.Characteristic;

module.exports = class BatteryEmitCharacteristic extends Characteristic {
	constructor(currentBattery) {
		super({
			uuid: 'ff02',
			properties: [ 'notify', 'writeWithoutResponse' ]
			/*
			descriptors: [
				new bleno.Descriptor({
					uuid: '2901',
					value: 'Creates the ice cream and sends a notification when done.'
				})
			]
      */
		});
		this._currentBattery = currentBattery;
		this._updateValueCallback = null;
	}
	get currentBattery() {
		return this._currentBattery;
	}
	onWriteRequest(data, offset, withoutResponse, callback) {
		console.log('Emit Write REQ -> ' + data);
		if (offset) {
			return callback(Characteristic.RESULT_ATTR_NOT_LONG);
		} else if (data.length !== 2) {
			return callback(Characteristic.RESULT_INVALID_ATTRIBUTE_LENGTH);
		} else {
			this.currentBattery.once('ready', (result) => {
				if (this._updateValueCallback) {
					let data = new Buffer(1);
					data.writeUInt8(result, 0);
					this._updateValueCallback(data);
				}
			});
			this.currentBattery.prepare();
			return callback(Characteristic.RESULT_SUCCESS);
		}
	}

	onReadRequest(offset, callback) {
		console.log('Emit Read REQ -> ' + offset);
		if (offset) {
			return callback(Characteristic.RESULT_ATTR_NOT_LONG, null);
		} else {
			let data = new Buffer(2);
			data.writeUInt16BE(this.currentBattery.types, 0);
			return callback(Characteristic.RESULT_SUCCESS, data);
		}
	}

	onSubscribe(maxValueSize, updateValueCallback) {
		console.log('EmitCharacteristic - onSubscribe');
		this._updateValueCallback = updateValueCallback;
	}

	onUnsubscribe() {
		console.log('EmitCharacteristic - onUnsubscribe');
		this._updateValueCallback = null;
	}
};
