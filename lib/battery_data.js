const batteryModels = {
	gs_b2500: {
		identifiers: 'HMB-3',
		manufacturer: 'Green Solar',
		model: 'B2500',
		name: 'Plug & Play Balkonkraftwerk Basisspeicher 2,2kWh',
		page: 'https://greensolar.de/produkt/plug-play-balkonkraftwerk-batteriespeicher-basisspeicher-22-kwh'
	},
	bc_b2500: {
		identifiers: 'HMB-3',
		manufacturer: 'Be Cool',
		model: 'BC-B2500',
		name: 'Balkonspeicher 2,24kWh',
		page: 'https://www.enercab.at/balkonakkusysteme/1472-be-cool-bc-b2500-balkonspeicher-224kwh.html'
	},
	ps_b2500: {
		identifiers: 'HMB-3',
		manufacturer: 'plenti Solar',
		model: 'PSHAB2500',
		name: 'Plug & Play Balkonkraftwerk Batteriespeicher 2,2 kWh',
		page: ''
	},
	mt_b2500: {
		identifiers: 'HMB-3',
		manufacturer: 'Marstek',
		model: 'B2500',
		name: 'B2500',
		page: 'https://de.marstekenergy.com/products/marstek-b2500-balkonkraftwerk'
	},

	bp_b2500: {
		identifiers: 'HMB-3',
		manufacturer: 'bluepalm',
		model: 'BP-B2500',
		name: 'Balkonkraftwerkspeicher 2240Wh',
		page: 'https://schuss-home.at/de/energie/balkonkraftwerk/balkonkraftwerkspeicher-2240wh'
	}
};

const batteryStates = {
	battery: {
		number: {
			w1: {
				min: 0,
				max: 500,
				unit_of_measurement: 'W',
				mult: 1,
				entity_type: 'sensor',
				device_class: 'power',
				name: 'PV1 input power',
				role: 'indicator',
				subrole: 'number'
			},
			w2: {
				min: 0,
				max: 500,
				unit_of_measurement: 'W',
				mult: 1,
				entity_type: 'sensor',
				device_class: 'power',
				name: 'PV2 input power',
				role: 'indicator',
				subrole: 'number'
			},
			pe: {
				min: 0,
				max: 100,
				unit_of_measurement: '%',
				mult: 0.1,
				entity_type: 'sensor',
				device_class: 'battery',
				name: 'Battery state of charge',
				role: 'indicator',
				subrole: 'number'
			},
			g1: {
				min: 0,
				max: 500,
				unit_of_measurement: 'W',
				mult: 1,
				entity_type: 'sensor',
				device_class: 'power',
				name: 'Output power 1',
				role: 'indicator',
				subrole: 'number'
			},
			g2: {
				min: 0,
				max: 500,
				unit_of_measurement: 'W',
				mult: 1,
				entity_type: 'sensor',
				device_class: 'power',
				name: 'Output power 2',
				role: 'indicator',
				subrole: 'number'
			},
			kn: {
				min: 0,
				max: 6600,
				unit_of_measurement: 'Wh',
				mult: 1,
				entity_type: 'sensor',
				device_class: 'energy',
				name: 'Nattery capacity',
				role: 'indicator',
				subrole: 'number'
			},
			rssi: {
				min: -100,
				max: 10,
				unit_of_measurement: 'dBm',
				mult: 1,
				entity_type: 'sensor',
				device_class: 'signal_strength',
				name: 'signal strength',
				role: 'indicator',
				subrole: 'number'
			}
		},
		level: {
			tun: {
				min: 0,
				max: 800,
				unit_of_measurement: 'W',
				mult: 0.1,
				step: 1,
				entity_type: 'sensor',
				device_class: 'power',
				name: 'Solar power threshold',
				role: 'value',
				subrole: 'power'
			},
			lv: {
				min: 0,
				max: 100,
				unit_of_measurement: '%',
				mult: 1,
				entity_type: 'sensor',
				device_class: 'battery',
				name: 'Depth of discharge (DoD)',
				icon: 'mdi:speedometer',
				role: 'value',
				subrole: 'lowlimit'
			}
		},
		diagnostic: {
			p1: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'PV1  state',
				role: 'info',
				p1: { '0': 'off', '1': 'charging', '2': 'transparent for inverter' }
			},
			p2: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'PV2  state',
				role: 'info',
				p2: { '0': 'off', '1': 'charging', '2': 'transparent for inverter' }
			},
			am: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'additional monitoring',
				role: 'info',
				am: {
					'0': 'WIFI not working',
					'1': 'WIFI OK, MQTT not connected',
					'2': 'WIFI OK, MQTT connect OK'
				}
			},
			o1: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'OUT1 state',
				role: 'info',
				o1: { '0': 'off', '1': 'discharge' }
			},
			o2: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'OUT2 state',
				role: 'info',
				o2: { '0': 'off', '1': 'discharge' }
			},
			cd: {
				entity_type: 'text',
				device_class: 'diagnostic',
				payload_off: 'supply prio',
				payload_on: 'charge prio',
				name: 'Discharge selection',
				role: 'switch',
				cd: { '0': 'OUT1 & OUT2 blocked', '1': 'only OUT1', '2': 'only OUT2', '3': 'OUT1 & OUT2' }
			},
			cj: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'scenario',
				role: 'info',
				cj: {
					'0': 'day, enough solar power',
					'1': 'night, no solar power',
					'2': 'morning/evening, weak solar power'
				}
			},
			b1: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'Power supply 1 state',
				role: 'info',
				b1: { '0': 'no accupack connected', '1': 'connect power supply' }
			},
			b2: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'Power supply 2 state',
				role: 'info',
				b2: { '0': 'no accupack connected', '1': 'connect power supply' }
			},
			country: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'Power supply 2 state',
				role: 'info',
				country: { '0': 'EU', '1': 'China', '2': 'non-EU' }
			}
		},
		string: {
			vv: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'Device version',
				role: 'info'
			},
			type: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'Device Type',
				role: 'info'
			},
			id: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'Device ID',
				role: 'info'
			},
			mac: {
				entity_type: 'text',
				entity_category: 'diagnostic',
				name: 'Device MAC',
				role: 'info'
			}
		},
		switch: {
			cs: {
				entity_type: 'switch',
				device_class: 'switch',
				payload_off: 'pass through PV2',
				payload_on: 'charge prio',
				name: 'Charge selection',
				role: 'switch',
				cs: { '0': 'PV1 charging, PV2 pass through', '1': 'full charge and discharge' }
			},
			cd1: {
				entity_type: 'switch',
				device_class: 'switch',
				payload_off: 'off',
				payload_on: 'on',
				name: 'Discharge Out 1 enable',
				role: 'switch',
				cd1: { '0': 'off', '1': 'on' }
			},
			cd2: {
				entity_type: 'switch',
				device_class: 'switch',
				payload_off: 'off',
				payload_on: 'on',
				name: 'Discharge Out 2 enable',
				role: 'switch',
				cd2: { '0': 'off', '1': 'on' }
			}
		}
	}
};

const batteryStatesDict = {
	gs_b2500: {
		battery: {
			w1: { entity: 'number' },
			w2: { entity: 'number' },
			g1: { entity: 'number' },
			g2: { entity: 'number' },
			kn: { entity: 'number' },
			rssi: { entity: 'number' },
			tun: { entity: 'level' },
			lv: { entity: 'level' },
			p1: { entity: 'diagnostic' },
			p2: { entity: 'diagnostic' },
			am: { entity: 'diagnostic' },
			o1: { entity: 'diagnostic' },
			o2: { entity: 'diagnostic' },
			cj: { entity: 'diagnostic' },
			cd: { entity: 'diagnostic' },
			b1: { entity: 'diagnostic' },
			b2: { entity: 'diagnostic' },
			country: { entity: 'diagnostic' },
			vv: { entity: 'string' },
			type: { entity: 'string' },
			id: { entity: 'string' },
			mac: { entity: 'string' },
			cs: { entity: 'switch' },
			cd1: { entity: 'switch' },
			cd2: { entity: 'switch' }
		}
	}
};

const batteryRanges = {
	gs_b2500: {
		battery: {
			number: {
				w1: { max: 500 },
				w2: { max: 500 }
			},
			level: {
				tun: { max: 800 }
			}
		}
	}
};

const mqttCmd = {
	gs_b2500: {
		battery: {
			// Payload: cd=05,md=Wert // md=0-100
			lv: { msg: { cd: '05', md: 100 } },
			// cd=06,md=0 //md=0-500
			tun: { msg: { cd: '06', md: 300 } },
			/*
            Payload: cd=04,md=0 // md=0 bedeutet OUT1 & OUT2 deaktivieren 
            Payload: cd=04,md=1 // md=1 bedeutet nur OUT1 aktivieren 
            Payload: cd=04,md=2 // md=2 bedeutet nur OUT2 aktivieren 
            Payload: cd=04,md=3 // md=3 bedeutet OUT1 & OUT2 aktivieren
            */
			cd: { msg: { cd: '04', md: 0 } },
			cd1: { cmd: 'cd' },
			cd2: { cmd: 'cd' },
			/*
            Payload: cd=03,md=0 // md=0 bedeutet PV1 Aufladung PV2 Durchleitung
            Payload: cd=03,md=1 // md=1 bedeutet Volles Laden und Entladen 
			*/
			cs: { msg: { cd: '03', md: 0 } },
			update: { msg: { cd: 1 } }
		}
	}
};

const bleCmd = {
	gs_b2500: {
		battery: {
			lv: { ctrl: '0b', val: '64' }, //0-100%
			tun: { ctrl: '0c', val: '6400' }, //0-500W
			cd: { ctrl: '0e', val: '01' },
			cd1: { cmd: 'cd' },
			cd2: { cmd: 'cd' },
			cs: { ctrl: '0d', val: '01' },
			update: { ctrl: '03', val: '01' },
			deviceinfo: { ctrl: '04', val: '01' },
			getssid: { ctrl: '08', val: '01' }
		}
	}
};

module.exports = {
	batteryStates,
	batteryStatesDict,
	batteryRanges,
	bleCmd
};
