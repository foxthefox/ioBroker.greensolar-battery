const idstring = 'type=HMB-3,id=360111504d463037360e6445,mac=c4a64e452319';
// 73,xx,23,04

const ssidstring = 'Hame<.,.>88888888';
// 73,xx,23,05

const statusstring = '731023030000000000003E037C010100010054FF0001430700000000000000';
const statusstring2 = '0000000000003E037C010100010054FF0001430700000000000000';

/*
const fromHexString = (hexString) =>
new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
const uintArray = fromHexString(payload);
const buffer = Buffer.from(uintArray);
*/

function toHex(str) {
	var result = '';
	for (var i = 0; i < str.length; i++) {
		result += str.charCodeAt(i).toString(16);
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

function toArray(hexString) {
	var result = [];
	while (hexString.length >= 2) {
		result.push(hexString.substring(0, 2));
		hexString = hexString.substring(2, hexString.length);
	}
	return result;
}

function toHexArray(hexString) {
	var result = [];
	while (hexString.length >= 2) {
		result.push('0x' + hexString.substr(0, 2));
		hexString = hexString.substring(2, hexString.length);
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

function createPayload(ctrl, payloadStr) {
	const baseArr = [ '73', '06', '23', '08' ];

	if (ctrl !== '03') {
		payloadStr = toHex(payloadStr);
	}

	const payloadArr = toArray(payloadStr);

	let arr = baseArr.concat(payloadArr);
	arr[1] =
		(arr.length + 1).toString(16).length > 1 ? (arr.length + 1).toString(16) : '0' + (arr.length + 1).toString(16); //.toString(16);
	arr[3] = ctrl;
	const crc = xorArray(toHexStrings(arr));
	arr.push(crc);
	return arr.join('');
}

function decodeMsgAndPrepareAnswer(msg) {
	let result = '';
	for (const value of msg) {
		const val = value.toString(16).length == 1 ? '0' + value.toString(16) : value.toString(16);
		result = result + val;
	}
	console.log('res:' + result);
	let msgarr = toArray(result.toString());
	console.log(msgarr);
	console.log(msgarr[3]);
	if (msgarr[3] == '03') {
		result = createPayload('03', statusstring2);
	}
	if (msgarr[3] == '04') {
		result = createPayload('04', idstring);
	}
	if (msgarr[3] == '08') {
		result = createPayload('08', ssidstring);
	}
	return result;
}

const fromHexString = (hexString) => new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

console.log(decodeMsgAndPrepareAnswer(Buffer.from(fromHexString('730623030154'))));
console.log(decodeMsgAndPrepareAnswer(Buffer.from(fromHexString('730623040153'))));
console.log(decodeMsgAndPrepareAnswer(Buffer.from(fromHexString('73062308015f'))));
