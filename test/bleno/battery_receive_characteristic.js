'use strict';
const util = require('util');
const bleno = require('@stoprocent/bleno');
const Characteristic = bleno.Characteristic;

module.exports = class BatteryReceiveCharacteristic extends Characteristic {
	constructor(currentBattery) {
		super({
			uuid: 'ff01',
			properties: [ 'notify', 'writeWithoutResponse' ]
			/*
			descriptors: [
				new bleno.Descriptor({
					uuid: '2901',
					value: 'Gets or sets the ice cream types.'
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
		console.log('offset' + offset);
		console.log('withoutResponse' + withoutResponse);
		console.log('RECV Write REQ -> ' + data);
		console.log('RECV Write REQ -> ' + data.readUInt16BE(0));
		const buf2 = Buffer.from(data, 'hex');
		console.log(buf2);
		console.log(buf2.toString());
		if (offset) {
			return callback(Characteristic.RESULT_ATTR_NOT_LONG);
		} else if (data.length !== 2) {
			return callback(Characteristic.RESULT_INVALID_ATTRIBUTE_LENGTH);
		} else {
			this.currentBattery.types = data.readUInt16BE(0);
			return callback(Characteristic.RESULT_SUCCESS);
		}
	}
	onReadRequest(offset, callback) {
		console.log('Receive Read REQ -> ' + offset);
		if (offset) {
			return callback(Characteristic.RESULT_ATTR_NOT_LONG, null);
		} else {
			let data = new Buffer(2);
			data.writeUInt16BE(this.currentBattery.types, 0);
			return callback(Characteristic.RESULT_SUCCESS, data);
		}
	}

	onSubscribe(maxValueSize, updateValueCallback) {
		console.log('ReceiveCharacteristic - onSubscribe');
		this._updateValueCallback = updateValueCallback;
	}

	onUnsubscribe() {
		console.log('EchoCharacteristic - onUnsubscribe');
		this._updateValueCallback = null;
	}
};
