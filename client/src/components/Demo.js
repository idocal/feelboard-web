import React, { Component } from 'react';
import FlexView from 'react-flexview';
import Loader from './Loader';
import Webcam from "react-webcam";
import {loadModels, getFullFaceDescription, distance} from '../faceapi';
import { withRouter } from 'react-router-dom';
import DrawBox from './DrawBox';
import '../styles/Demo.css';

let WIDTH = 640;
let HEIGHT = 480;
const TIMEOUT = 15;
const SIMILAR_THRESHOLD = 0.46;
const AGE_ALPHA = 0.8;
const MIN_PREDICTIONS = 3;

class Demo extends Component {

    constructor(props) {
        super(props);
        this.webcam = React.createRef();
        this.state = {
            timeout: false,
            loading: true,
            fullDesc: null,
            facingMode: null,
            pastDescriptors: [],
            predictions: [],
            finalPredictions: []
        };
        this.updatePrediction = this.updatePrediction.bind(this);
        this.getFinalPredictions = this.getFinalPredictions.bind(this);
        this.startSession = this.startSession.bind(this);
    }

    async componentWillMount() {
        await loadModels();
        let cameraSize = await this.getUserCameraSize();
        WIDTH = cameraSize.width;
        HEIGHT = cameraSize.height;
        await this.setState({
            loading: false
        });
    }

    componentDidMount() {
        this.startSession();
    }

    async getUserCameraSize() {
        let stream = await navigator.mediaDevices.getUserMedia({video: true});
        let {width, height} = stream.getTracks()[0].getSettings();
        return {width, height}
    }

    startCapture() {
        this.interval = setInterval(async () => {
            if (!this.state.timeout) {
                await this.capture();
            } else {
                clearInterval(this.interval);
            }
        }, 300);
    };

    startSession() {
        this.setState({
            timeout: false,
            pastDescriptors: [],
            predictions: [],
            finalPredictions: []
        });
        setTimeout(async () => {
            await this.setState({
                timeout: true,
                finalPredictions: this.getFinalPredictions()
            });
        }, TIMEOUT * 1000);
        this.startCapture();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async capture() {
        if (!!this.webcam.current) {
            await getFullFaceDescription(
                this.webcam.current.getScreenshot()
            ).then(async fullDesc => {
                this.setState({ fullDesc });

                // assign first prediction
                if (!!fullDesc && !this.state.pastDescriptors.length) {
                    await this.setState({
                        pastDescriptors: fullDesc.map( desc => { return desc.descriptor } ),
                        predictions: fullDesc.map( desc => {
                            return {
                                age: desc.age,
                                malePredictions: desc.gender === "male" ? 1 : 0,
                                femalePredictions: desc.gender === "female" ? 1 : 0,
                                updates: 1
                            };
                        })
                    });
                }

                // update prediction for each descriptor
                if (!!fullDesc) {
                    for (const desc of fullDesc) {
                        await this.updatePrediction(desc);
                    }
                }
            });
        }
    };

    getFinalPredictions() {
        const predictions = this.state.predictions.filter( pred => {return pred.updates > MIN_PREDICTIONS});
        return predictions.map(pred => {
            return {
                age: pred.age,
                gender: pred.malePredictions >= pred.femalePredictions ? "male" : "female"
            }
        });
    }

    async updatePrediction(fullDescriptor) {
        let pastDescriptors = this.state.pastDescriptors;
        let descriptor = fullDescriptor.descriptor;
        let age = fullDescriptor.age;
        let gender = fullDescriptor.gender;

        if (pastDescriptors) {
            let distances = pastDescriptors.map( pastDescriptor => { return distance(pastDescriptor, descriptor) } );

            // find most similar face
            let minDist = distances[0];
            let candidate = 0;
            distances.forEach((dist, i) => {
                if (dist < minDist) {
                    minDist = dist;
                    candidate = i;
                }
            });

            // update state
            if (minDist < SIMILAR_THRESHOLD) {
                await this.setState(prevState => {
                    let predictions = prevState.predictions;
                    let updatedPrediction = prevState.predictions[candidate];

                    predictions[candidate] = {
                        age: AGE_ALPHA * updatedPrediction.age + (1 - AGE_ALPHA) * age,
                        malePredictions: gender === "male" ? updatedPrediction.malePredictions + 1 : updatedPrediction.malePredictions,
                        femalePredictions: gender === "female" ? updatedPrediction.femalePredictions + 1 : updatedPrediction.femalePredictions,
                        updates: updatedPrediction.updates + 1
                    };

                    return { predictions }
                })
            } else {
                await this.setState(prevState => {
                    let predictions = prevState.predictions;
                    let prediction = {
                        age,
                        malePredictions: gender === "male" ? 1 : 0,
                        femalePredictions: gender === "female" ? 1 : 0,
                        updates: 1,
                    };
                    predictions.push(prediction);
                    return { predictions }
                });
            }
        }
    }

    render() {
        const { timeout, loading, fullDesc, facingMode } = this.state;
        let videoConstraints = null;

        if (!!facingMode) {
            videoConstraints = {
                width: WIDTH,
                height: HEIGHT,
                facingMode: facingMode
            };
        }

        let webcamWithPredictions =
                <FlexView>
                    <Webcam
                        className="webcam"
                        audio={false}
                        width={WIDTH}
                        height={HEIGHT}

                        ref={this.webcam}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        style={{position: "absolute", top: 0, left: 0}}
                    />

                    {!!fullDesc ? (
                        <DrawBox
                            fullDesc={fullDesc}
                            imageWidth={WIDTH}
                            boxColor={'blue'}
                        />
                    ) : null}
                </FlexView>;

        let predictions =
            <FlexView column>
                <FlexView>
                    Total number of people: { this.state.finalPredictions.length }
                </FlexView>

                <FlexView>
                    {
                        this.state.finalPredictions.map((pred, i) => (
                            <FlexView key={i}>
                                Age: {Math.floor(pred.age)} Gender: {pred.gender}
                            </FlexView>
                        ))
                    }
                </FlexView>

                <FlexView>
                    <button onClick={() => {this.startSession()}}>Try again</button>
                </FlexView>


            </FlexView>;

        return (
            <FlexView className="demo">
                { loading && <Loader/> }
                { !loading && !timeout && webcamWithPredictions }
                { !loading && timeout && predictions }
            </FlexView>
        )
    }

}

export default withRouter(Demo);