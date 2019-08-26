let net;
const webcamElement = document.getElementById('webcam');

async function setupWebcam() {
	return new Promise((resolve, reject) => {
		const navigatorAny = navigator;
		navigator.getUserMedia = navigator.getUserMedia || 
			navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUSerMedia ||
			navigatorAny.mozGetUSerMedia;
			if(navigator.getUserMedia) {
				navigator.getUserMedia({video: true},
					stream => {
						webcamElement.srcObject = stream;
						webcamElement.addEventListener('loadeddata', () => resolve(), false);
					},
					error => reject());
			}else{
				reject();
			}
	});
}

async function app() {
	console.log('Loading mobilenet...');

	// load the model
	net = await mobilenet.load();
	console.log('Successfully load model');

	// Make a prediction through the model on our image
	// const imgEl = document.getElementById('img');
	// const result = await net.classify(imgEl);
	// console.log(result);

	await setupWebcam();
	while (true) {
		const result = await net.classify(webcamElement);

		document.getElementById('console').innerText = `
			prediction: ${result[0].className}\n
			probability: ${result[0].probability}
		`;

		await tf.nextFrame();
	}
}

app();