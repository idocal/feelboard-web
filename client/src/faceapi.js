import * as faceapi from 'face-api.js';

export async function loadModels() {
    const MODEL_URL = process.env.PUBLIC_URL + '/models';
    await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
    await faceapi.loadFaceLandmarkTinyModel(MODEL_URL);
    await faceapi.loadFaceRecognitionModel(MODEL_URL);
    await faceapi.loadAgeGenderModel(MODEL_URL);
}

export async function getFullFaceDescription(blob, inputSize = 512) {
    if (blob) {
        // tiny_face_detector options
        let scoreThreshold = 0.5;
        const OPTION = new faceapi.TinyFaceDetectorOptions({
            inputSize,
            scoreThreshold
        });

        // fetch image to api
        let img = await faceapi.fetchImage(blob);

        // detect all faces and generate full description from image
        // including landmark and descriptor of each face
        return await faceapi.detectAllFaces(img, OPTION)
            .withFaceLandmarks(true)
            .withAgeAndGender()
            .withFaceDescriptors();
    }
}

export function isFaceDetectionModelLoaded() {
    return !!faceapi.nets.tinyFaceDetector.params;
}

export function distance(a ,b) {
    return faceapi.euclideanDistance(a ,b);
}