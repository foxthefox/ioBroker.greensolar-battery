'use strict';

/*
 * Created with @iobroker/create-adapter v2.3.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require('@iobroker/adapter-core');

// Load your modules here, e.g.:
const myutils = require('./lib/adapter_utils.js');
const bat = require('./lib/battery_utils.js');

class GreensolarBattery extends utils.Adapter {
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: 'greensolar-battery'
		});
		this.msgCountBattery = 0;
		this.msgReconnects = 0;
		this.batteryStates = null;
		this.batteryStatesDict = null;
		this.batteryCmd = null;
		this.batteries = {};
		this.on('ready', this.onReady.bind(this));
		this.on('stateChange', this.onStateChange.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here
		this.log.info('adapter entered ready');
		try {
			this.batteryStates = require('./lib/battery_data.js').batteryStates;
			this.batteryStatesDict = require('./lib/battery_data.js').batteryStatesDict;
			this.batteryCmd = require('./lib/battery_data.js').bleCmd;

			//modify this.batteryStates
			this.log.info('your configration:');
			this.log.info('battery  -> ' + JSON.stringify(this.config.devices));
		} catch (error) {
			this.log.error('read config ' + error);
		}
		try {
			//loop durch alle batteries
			if (this.config.devices.length > 0) {
				for (let batt = 0; batt < this.config.devices.length; batt++) {
					const type = this.config.devices[batt]['deviceType'];
					if (type !== 'none' && type !== '') {
						const id = this.config.devices[batt]['deviceId'];
						const name = this.config.devices[batt]['deviceName'];
						this.batteries[id] = {};
						this.batteries[id]['deviceType'] = type;
						this.batteries[id]['deviceName'] = name;

						let battStates = require('./lib/battery_data.js').batteryStates;
						// manipulation of ranges when 600W version
						if (type !== 'none' && battStates) {
							const battupd = require('./lib/battery_data.js').batteryRanges[type];
							this.log.debug('pstation upd ' + JSON.stringify(battupd));
							if (battupd) {
								if (Object.keys(battupd).length > 0) {
									for (let channel in battupd) {
										for (let type in battupd[channel]) {
											for (let state in battupd[channel][type]) {
												for (let value in battupd[channel][type][state]) {
													this.log.debug(
														'manipulate: ' +
															channel +
															'/' +
															state +
															' old--new ' +
															battStates[channel][type][state][value] +
															' -- ' +
															battupd[channel][type][state][value]
													);
													battStates[channel][type][state][value] =
														battupd[channel][type][state][value];
												}
											}
										}
									}
								} else {
									this.log.error('battery upd not possible');
								}
							} else {
								this.log.warn('did not get batteryupd');
							}
						} else {
							this.log.error(
								'deviceType not set -> ' + type + 'or no batteryStates -> ' + this.batteryStates
							);
						}
						//create battery objects
						const battStatesDict = this.batteryStatesDict[type];

						if (type !== 'none' && battStates && battStatesDict) {
							this.log.info('start battery state creation ->' + type + ' for Id ' + id);
							try {
								if (this.config.msgStateCreationBattery) {
									this.log.debug('____________________________________________');
									this.log.debug('create  device ' + id);
								}
								await this.setObjectNotExistsAsync(id, {
									type: 'device',
									common: {
										name: name,
										role: 'device'
									},
									native: {}
								});
								for (let part in battStatesDict) {
									if (this.config.msgStateCreationBattery) {
										this.log.debug('____________________________________________');
										this.log.debug('create  channel ' + part);
									}
									await myutils.createMyChannel(this, id, part, part, 'channel');
									for (let key in battStatesDict[part]) {
										let type = battStatesDict[part][key]['entity'];
										if (type !== 'icon') {
											if (battStates[part][type][key]) {
												await myutils.createMyState(
													this,
													id,
													part,
													key,
													battStates[part][type][key]
												);
											} else {
												this.log.info(
													'not created/mismatch ->' + part + ' ' + key + ' ' + type
												);
											}
										}
									}
								}
								this.log.info('battery states created for ' + id + ' / ' + type + ' / ' + name);
							} catch (error) {
								this.log.error('create states battery ' + error);
							}
						} else {
							this.log.error(
								'something empty ID->' +
									id +
									'states -> ' +
									battStates +
									' dict -> ' +
									this.batteryStatesDict +
									' type -> ' +
									type
							);
						}
					} else {
						this.log.warn('"none" or no configuration, you can delete the row in the table');
					}
				}
			}
		} catch (error) {
			this.log.error('modification or state creation went wrong ->' + error);
		}
		//additional states for observance
		myutils.createInfoStates(this);

		//BLE communication
		this.log.debug('the batteries are ' + JSON.stringify(this.batteries));
		//Request Device Date
		if (Object.keys(this.batteries).length > 0) {
			this.log.debug('requesting generic device values');
			for (let key in this.batteries) {
				const topic = key;
				this.log.debug('requesting device ' + topic);

				//here add request
				const message =
					'733C2304747970653D484D422D332C69643D3336323131313530346434363131333734362134353931322C6D61633D65383864613661623131383277';

				const msgdecode = bat.decodeMsg(this, message);
				if (this.config.msgUpdateBattery) {
					this.log.debug('battery: ' + JSON.stringify(msgdecode));
				}
				if (msgdecode !== null && typeof msgdecode === 'object') {
					if (Object.keys(msgdecode).length > 0) {
						//storeStreamPayload handles multiple objects
						await bat.storePayload(
							this,
							this.batteryStatesDict['gs_b2500'],
							this.batteryStates,
							topic,
							msgdecode
						);
					}
				}
				this.msgCountBattery++;
				await this.setStateAsync('info.msgCountBattery', {
					val: this.msgCountBattery,
					ack: true
				});
			}
		}

		//Request cyclic data

		if (Object.keys(this.batteries).length > 0) {
			for (let key in this.batteries) {
				const topic = key;

				//here add request
				const message = '0x731023030000000000003E037C010100010054FF0001430700000000000000';

				const msgdecode = bat.decodeMsg(this, message);
				if (this.config.msgUpdateBattery) {
					this.log.debug('battery: ' + JSON.stringify(msgdecode));
				}
				if (msgdecode !== null && typeof msgdecode === 'object') {
					if (Object.keys(msgdecode).length > 0) {
						//storeStreamPayload handles multiple objects
						await bat.storePayload(this, this.batteryStatesDict, this.batteryStates, topic, msgdecode);
					}
				}
				this.msgCountBattery++;
				await this.setStateAsync('info.msgCountBattery', {
					val: this.msgCountBattery,
					ack: true
				});
			}
		}
		this.log.debug('updating cycle ' + this.config.updateCycle);

		// Reset the connection indicator during startup
		this.setState('info.connection', false, true);
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	onMessage(obj) {
		this.log.info('send command');

		if (typeof obj === 'object' && obj.message) {
			if (obj.command === 'send') {
				// e.g. send email or pushover or whatever
				this.log.info('other send command');
				this.log.info('obj msg ' + JSON.stringify(obj.message));
				// Send response in callback if required
				if (obj.callback) this.sendTo(obj.from, obj.command, { result: 'Message received' }, obj.callback);
			}
			switch (obj.command) {
				case 'create':
					this.log.info('send msg create login data');
					this.log.info('obj msg' + JSON.stringify(obj.message));
					// here calling function and value in return will be brought back to admin page
					const resultFromFunction = {
						native: {
							mqttUserId: '1232445564356',
							mqttUserName: 'login.User',
							mqttPwd: 'login.Password',
							mqttClientId: 'login.clientID'
						}
					};
					this.log.debug('obj msg' + JSON.stringify(resultFromFunction));
					this.sendTo(obj.from, obj.command, resultFromFunction, obj.callback);
					// Send response in callback if required
					//this.sendTo(obj.from, obj.command, 'close admin page and reopen', obj.callback);
					//if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
					//if (obj.callback) this.sendTo(obj.from, obj.command, result, obj.callback);
					break;

				case 'test':
					// Try to provide message to admin page
					this.log.info('send msg for text feedback');
					this.log.info('obj msg' + JSON.stringify(obj.message));
					if (obj.callback && obj.message) {
						const url = obj.message.url + ':' + obj.message.port;
						const optionsMqtt = {
							port: obj.message.port || 8883,
							clientId: obj.message.clientId,
							username: obj.message.user,
							password: obj.message.pass
						};
						const text = JSON.stringify(url) + JSON.stringify(optionsMqtt);
						const result = {
							message: text,
							message2: text,
							message3: text,
							message4: text,
							message5: text,
							message6: text,
							message7: text,
							message8: text
						};
						//this.sendTo(obj.from, obj.command, result, obj.callback);
						this.sendTo(
							obj.from,
							obj.command,
							{ error: 'This is not an error, its a message box' + JSON.stringify(result) },
							obj.callback
						);
					}
					break;
			}
		}
	}
}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new GreensolarBattery(options);
} else {
	// otherwise start the instance directly
	new GreensolarBattery();
}
