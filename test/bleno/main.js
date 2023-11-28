const bleno = require('@stoprocent/bleno');
const Battery = require('./battery_om');
const BatteryService = require('./battery-service');

const peripheralName = 'HM_B2500_001';
const battery = new Battery();
const batteryService = new BatteryService(Battery);

bleno.on('stateChange', (state) => {
	if (state === 'poweredOn') {
		bleno.startAdvertising(peripheralName, [ batteryService.uuid ], (error) => {
			if (error) {
				console.error(error);
			}
		});
	} else {
		bleno.stopAdvertising();
	}
});

bleno.on('advertisingStart', (error) => {
	if (!error) {
		console.log('Starte Advertising...');
		bleno.setServices([ batteryService ]);
	}
});
