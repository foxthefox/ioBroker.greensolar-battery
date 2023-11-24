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
	return result;
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

async function storePayload(adapter, stateDictObj, stateObj, topic, payload) {
	if (payload) {
		try {
			for (let channel in payload) {
				for (let state in payload[channel]) {
					if (adapter.config.msgUpdateValueBattery) {
						// adapter.log.debug('topic ' + topic + ' channel ' + channel + ' state ' + state);
					}
					if (stateDictObj[channel][state]) {
						if (stateDictObj[channel][state]['entity'] !== 'icon') {
							let value = convertData(stateDictObj, channel, state, payload[channel][state], stateObj);
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
							'not processed ' + channel + ' state : ' + state + '  value: ' + payload[channel][state]
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
