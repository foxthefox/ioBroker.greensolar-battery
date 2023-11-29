const noble = require('@stoprocent/noble');

noble.on('stateChange', (state) => {
	if (state === 'poweredOn') {
		console.log('Started scanning');
		noble.startScanning([], false);
	} else {
		noble.stopScanning();
		console.log('Is Bluetooth on?');
	}
});
noble.on('scanStart', () => {
	console.log('Scanning started ...');
});
noble.on('scanStop', () => {
	console.log('Scanning stopped.');
});
noble.on('unsupported', () => {
	console.log('unsupported');
});
noble.on('unauthorized', () => {
	console.log('unathorized');
});
noble.on('poweredOff', () => {
	console.log('powered OFF');
});
process.on('SIGINT', function() {
	console.log('Caught interrupt signal');
	noble.stopScanning(() => process.exit());
});

process.on('SIGQUIT', function() {
	console.log('Caught interrupt signal');
	noble.stopScanning(() => process.exit());
});

process.on('SIGTERM', function() {
	console.log('Caught interrupt signal');
	noble.stopScanning(() => process.exit());
});

var connected = false;

noble.on('discover', (peripheral) => {
	// connect to the first peripheral that is scanned
	if (peripheral.advertisement.localName == 'HM_B2500_001') {
		noble.stopScanning();
		const name = peripheral.advertisement.localName;
		console.log(`Connecting to '${name}' ${peripheral.id}`);
		if (connected === false) {
			connectAndSetUp(peripheral);
		}
	} else {
		console.log('found a different device with UUID ' + peripheral.advertisement.localName);
	}
});

function connectAndSetUp(peripheral) {
	connected = true;
	peripheral.connect((error) => {
		if (error) {
			console.error(error);
			return;
		}

		console.log('Connected to', peripheral.id);

		// specify the services and characteristics to discover
		var serviceUUIDs = [ 'ff00' ];
		var characteristicUUIDs = [ 'ff01', 'ff02' ];

		peripheral.discoverSomeServicesAndCharacteristics(
			serviceUUIDs,
			characteristicUUIDs,
			onServicesAndCharacteristicsDiscovered
		);
	});

	peripheral.on('disconnect', () => console.log('disconnected'));
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {
	if (error) {
		console.error(error);
		return;
	}

	console.log('Discovered services and characteristics');
	const readCharacteristic = characteristics[1];
	const writeCharacteristic = characteristics[0];

	if (writeCharacteristic.uuid === 'ff01' && readCharacteristic.uuid === 'ff02') {
		// subscribe to be notified whenever the peripheral update the characteristic
		readCharacteristic.subscribe((error) => {
			if (error) {
				console.error('Error subscribing to readCharacteristic');
			} else {
				console.log('Subscribed for readCharacteristic notifications');
			}
		});
		// data callback receives notifications
		readCharacteristic.on('read', (data, isNotification) => {
			console.log(`NOTIFICATION: "${isNotification}"`);
			console.log(`Received: "${data}"`);
			let result = '';
			for (const value of data) {
				const val = value.toString(16).length == 1 ? '0' + value.toString(16) : value.toString(16);
				result = result + val;
			}
			console.log('Received: ' + result);
		});
		readCharacteristic.once('notify', (state) => {
			console.log('notification is', state);
		});

		// create an interval to send data to the service
		let count = 0;
		setInterval(() => {
			if (count > 3) {
				readCharacteristic.unsubscribe();
				writeCharacteristic.unsubscribe();
				process.exit(0);
			} else {
				const payload = [ '730623040153', '730623030154', '73062305015f', '730623030154' ];
				console.log(payload[count]);
				const fromHexString = (hexString) =>
					new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
				const uintArray = fromHexString(payload[count]);
				const buffer = Buffer.from(uintArray);

				console.log('Sending:' + buffer);
				writeCharacteristic.write(buffer, true, (err) => {
					if (!err) {
						console.log('write sent ...timer');
						console.log(buffer);
					} else {
						console.log(error);
					}
				});
			}
			count++;
		}, 2500);
	}
}
