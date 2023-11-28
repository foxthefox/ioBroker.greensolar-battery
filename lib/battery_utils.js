function toArray(hexString) {
	var result = [];
	while (hexString.length >= 2) {
		result.push(hexString.substring(0, 2));
		hexString = hexString.substring(2, hexString.length);
	}
	return result;
}

function xorArray(arr) {
	let result = arr[0];
	for (let i = 1; i < arr.length; i++) {
		result = result ^ arr[i];
	}
	return result.toString(16);
}

function toHex(str) {
	var result = '';
	for (var i = 0; i < str.length; i++) {
		result += str.charCodeAt(i).toString(16);
	}
	return result;
}

function toHexStrings(arr) {
	var result = [];
	for (let i = 0; i < arr.length; i++) {
		result.push('0x' + arr[i]);
	}
	return result;
}

function makeCdCmd(val1, val2) {
	val1 = val1 === true ? '1' : '0';
	val2 = val2 === true ? '1' : '0';
	const res = ((parseInt(val2) << 1) + parseInt(val1)).toString(16);
	return res.length > 1 ? res : '0' + res;
}

function makeTunCmd(val) {
	let left, right;
	if (val < 256) {
		right = 0;
		left = val;
	} else {
		right = val >> 8;
		left = val - 256;
	}
	left = left.toString(16).length === 1 ? '0' + left.toString(16) : left.toString(16);
	right = right.toString(16).length === 1 ? '0' + right.toString(16) : right.toString(16);
	return left + right;
}

async function createBlePayload(adapter, devicetype, device, channel, item, value, cmdObj) {
	let ctrl = '';
	let payloadArr = [];
	//Sonderbehandlung für cd 1/cd2 und überführung in cd

	switch (item) {
		case 'cd1':
			const cd2val = await adapter.getStateAsync(device + '.' + channel + '.cd2').catch((e) => {
				adapter.log.warn('did not get ' + device + '.' + channel + '.cd2 ->' + e);
			});
			ctrl = cmdObj['ble'][devicetype][channel]['cd']['ctrl'];
			payloadArr.push(makeCdCmd(value, cd2val.val));
			break;

		case 'cd2':
			const cd1val = await adapter.getStateAsync(device + '.' + channel + '.cd1').catch((e) => {
				adapter.log.warn('did not get ' + device + '.' + channel + '.cd1 ->' + e);
			});
			ctrl = cmdObj['ble'][devicetype][channel]['cd']['ctrl'];
			payloadArr.push(makeCdCmd(cd1val.val, value));
			break;

		case 'lv':
			ctrl = cmdObj['ble'][devicetype][channel][item]['ctrl'];
			payloadArr.push(value.toString(16));
			break;

		case 'tun':
			ctrl = cmdObj['ble'][devicetype][channel][item]['ctrl'];
			payloadArr = toArray(makeTunCmd(value));
			break;

		case 'cs':
			ctrl = cmdObj['ble'][devicetype][channel][item]['ctrl'];
			payloadArr.push(value === true ? '01' : '00');
			break;

		case 'update':
		case 'deviceinfo':
		case 'getssid':
			ctrl = cmdObj['ble'][devicetype][channel][item]['ctrl'];
			payloadArr.push('01');
			break;

		default:
			//setssid '05', ssid<.,.>pwd
			// mqttadresse '14', url<.,.>port
			//item ist ctrl
			ctrl = item;
			payloadArr = toArray(toHex(value));
			break;
	}
	const baseArr = [ '73', '06', '23', '08' ];

	let arr = baseArr.concat(payloadArr);
	arr[1] =
		(arr.length + 1).toString(16).length > 1 ? (arr.length + 1).toString(16) : '0' + (arr.length + 1).toString(16);
	arr[3] = ctrl;
	const crc = xorArray(toHexStrings(arr));
	adapter.log.debug('crc ' + crc);
	arr.push(crc);
	return arr;
}

function decodeMsg(adapter, msg) {
	let result = {};
	let msgarr = toArray(msg.replace('0x', ''));
	console.log(msgarr[3]);
	if (msgarr[3] == '03') {
		result['p1'] = parseInt(msgarr[4], 16);
		result['p2'] = parseInt(msgarr[5], 16);
		result['w1'] = parseInt(msgarr[6], 16) + (parseInt(msgarr[7], 16) << 8);
		result['w2'] = parseInt(msgarr[8], 16) + (parseInt(msgarr[9], 16) << 8);
		result['pe'] = +((parseInt(msgarr[10], 16) + (parseInt(msgarr[11], 16) << 8)) * 0.1).toFixed(1);
		result['vv'] = parseInt(msgarr[12], 16);
		result['cs'] = parseInt(msgarr[13], 16) === 1 ? true : false;
		result['cd'] = parseInt(msgarr[14], 16);
		result['cd1'] = (parseInt(msgarr[14], 16) & 1) === 1 ? true : false;
		result['cd2'] = ((parseInt(msgarr[14], 16) >> 1) & 1) === 1 ? true : false;
		result['am'] = parseInt(msgarr[15], 16);
		result['o1'] = parseInt(msgarr[16], 16);
		result['o2'] = parseInt(msgarr[17], 16);
		result['lv'] = parseInt(msgarr[18], 16);
		result['tun'] = parseInt(msgarr[19], 16) + (parseInt(msgarr[20], 16) << 8);
		result['cj'] = parseInt(msgarr[21], 16);
		result['kn'] = parseInt(msgarr[22], 16) + (parseInt(msgarr[23], 16) << 8);
		result['g1'] = parseInt(msgarr[24], 16) + (parseInt(msgarr[25], 16) << 8);
		result['g2'] = parseInt(msgarr[26], 16) + (parseInt(msgarr[27], 16) << 8);
		result['b1'] = parseInt(msgarr[28], 16);
		result['b2'] = parseInt(msgarr[29], 16);
		result['country'] = parseInt(msgarr[30], 16);
	}
	if (msgarr[3] == '04') {
		msgarr.pop();
		let msg = msgarr.slice(4);
		const str = msg.join('').toString();
		const buf = Buffer.from(str, 'hex');
		const strarr = buf.toString().split(',');
		result['type'] = strarr[0].replace('type=', '');
		result['id'] = strarr[1].replace('id=', '');
		result['mac'] = strarr[2].replace('mac=', '');
	}
	if (msgarr[3] == '08') {
		msgarr.pop();
		let msg = msgarr.slice(4);
		const str = msg.join('').toString();
		const buf = Buffer.from(str, 'hex');
		result['ssid'] = buf.toString();
	}
	return { battery: result };
}

/**
 * @param {object} stateDictObj
 * @param {string} channel
 * @param {string} state
 * @param {string | number | boolean} value
 * @param {object} stateObj
 */
function convertData(stateDictObj, channel, state, value, stateObj) {
	let key = stateDictObj[channel][state]['entity'];
	switch (key) {
		case 'number':
		case 'level':
			//convert number
			value = parseFloat(value) * stateObj[channel][key][state]['mult'];
			break;
		case 'string':
			value = value.toString();
			break;
		case 'switch':
			//convert false/treue
			value = value == 0 || value == false ? false : true;
			break;
		case 'diagnostic':
			//convert string to item
			if (stateObj[channel][key][state][state][value]) {
				value = stateObj[channel][key][state][state][value].toString();
			} else {
				value = value + ' not part of array';
			}
			break;
		default:
			break;
	}
	return value;
}

async function storePayload(adapter, stateDictObj, stateObj, topic, payloadArr) {
	if (payloadArr) {
		try {
			for (let channel in payloadArr) {
				for (let state in payloadArr[channel]) {
					if (adapter.config.msgUpdateValueBattery) {
						// adapter.log.debug('topic ' + topic + ' channel ' + channel + ' state ' + state);
					}
					if (stateDictObj[channel][state]) {
						if (stateDictObj[channel][state]['entity'] !== 'icon') {
							let value = convertData(stateDictObj, channel, state, payloadArr[channel][state], stateObj);
							// adapter.log.debug('converted value ' + value);
							let old = await adapter.getStateAsync(topic + '.' + channel + '.' + state).catch((e) => {
								adapter.log.warn(
									'did not get old value ' + topic + '.' + channel + '.' + state + ' ->' + e
								);
							});
							//adapter.log.debug('old ' + JSON.stringify(old));
							if (!old) {
								await adapter.setStateAsync(topic + '.' + channel + '.' + state, {
									val: value,
									ack: true
								});
							} else {
								if (old.val !== value) {
									if (adapter.config.msgUpdateValueBattery) {
										adapter.log.debug(
											'stream update ' +
												'.' +
												channel +
												'.' +
												state +
												' ' +
												old.val +
												' -> ' +
												value
										);
									}
									await adapter.setStateAsync(topic + '.' + channel + '.' + state, {
										val: value,
										ack: true
									});
								}
							}
						}
					} else {
						adapter.log.debug(
							'not processed ' + channel + ' state : ' + state + '  value: ' + payloadArr[channel][state]
						);
					}
				}
			}
		} catch (error) {
			adapter.log.debug('store payload ' + error);
		}
	} else {
		adapter.log.debug('nothing to process');
	}
}

exports.decodeMsg = decodeMsg;
exports.storePayload = storePayload;
exports.createBlePayload = createBlePayload;
