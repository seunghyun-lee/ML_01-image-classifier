let net;
const webcamElement = document.getElementById('webcam');
const classifier = knnClassifier.create();

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

	// load the model it called mobilenet
	net = await mobilenet.load();
	console.log('Successfully load model');

	// Make a prediction through the model on our image
	// const imgEl = document.getElementById('img');
	// const result = await net.classify(imgEl);
	// console.log(result);

	await setupWebcam();
	// read an image from the webcam and associcates it with a specific class index
	const addExample = classId => {
		// Get the intermediate activation of mobilenet 'conv_preds' and pass that to the KNN classifier
		const activation = net.infer(webcamElement, 'conv_preds');
		classifier.addExample(activation, classId);
	};
	// When clicking a button, add an example for that class.
	document.getElementById('class-a').addEventListener('click', () => addExample(0));
	document.getElementById('class-b').addEventListener('click', () => addExample(1));
	document.getElementById('class-c').addEventListener('click', () => addExample(2));

	while (true) {
		if (classifier.getNumClasses() > 0) {
			// get the activation from mobilenet from the webcam.
			const activation = net.infer(webcamElement, 'conv_preds');
			// get the most likely class and confidences from the classifier module.
			const result = await classifier.predictClass(activation);

			const classes = ['A', 'B', 'C'];
			document.getElementById('console').innerText = `
			prediction: ${classes[result.classIndex]}\n
			probability: ${result.confidences[result.classIndex]}
			`;
		}

		await tf.nextFrame();
	}
}

app();