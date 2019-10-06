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
let RATIO = WIDTH / HEIGHT;
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
            startedTimeoutCounter: false,
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
        let windowWidth = window.innerWidth;
        WIDTH = cameraSize.width;
        HEIGHT = cameraSize.height;
        RATIO = WIDTH / HEIGHT;
        if (windowWidth < WIDTH) {
            WIDTH = windowWidth;
            HEIGHT = WIDTH / RATIO;
        }
        this.setState({loading: false});
    }

    componentDidMount() {
        this.startSession();
    }

    async getUserCameraSize() {
        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({video: true});
        } catch(e) { // No camera access
            alert('This demo requires camera access');
        }

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
        // init session
        this.setState({
            timeout: false,
            startedTimeoutCounter: false,
            fullDesc: null,
            pastDescriptors: [],
            predictions: [],
            finalPredictions: []
        });

        // check for camera input
        this.cameraCheckInterval = setInterval(() => {
            if (!!this.webcam.current && !!this.webcam.current.getScreenshot()) {
                this.startCapture();
                clearInterval(this.cameraCheckInterval);
            }
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async capture() {
        await getFullFaceDescription(
            this.webcam.current.getScreenshot()
        ).then(async fullDesc => {
            this.setState({ fullDesc });

            // init timeout if not initiated
            if (!this.state.startedTimeoutCounter && fullDesc.length) {
                setTimeout(async () => {
                    await this.setState({
                        startedTimeoutCounter: true,
                        timeout: true,
                        finalPredictions: this.getFinalPredictions()
                    });
                }, TIMEOUT * 1000);
                this.setState({ startedTimeoutCounter: true });
            }

            // assign first prediction
            if (!!fullDesc && !this.state.pastDescriptors.length) {
                await this.setState({
                    pastDescriptors: fullDesc.map( desc => { return desc.descriptor } ),
                    predictions: fullDesc.map( desc => {
                        return {
                            age: desc.age,
                            malePredictions: desc.gender === "male" ? 1 : 0,
                            femalePredictions: desc.gender === "female" ? 1 : 0,
                            minAge: desc.age,
                            maxAge: desc.age,
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
    };

    getFinalPredictions() {
        const predictions = this.state.predictions.filter( pred => {return pred.updates > MIN_PREDICTIONS});
        return predictions.map(pred => {
            return {
                age: pred.age,
                gender: pred.malePredictions >= pred.femalePredictions ? "male" : "female",
                minAge: pred.minAge,
                maxAge: pred.maxAge
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
                    let minAge = age < updatedPrediction.minAge ? age : updatedPrediction.minAge;
                    let maxAge = age > updatedPrediction.maxAge ? age : updatedPrediction.maxAge;

                    predictions[candidate] = {
                        age: AGE_ALPHA * updatedPrediction.age + (1 - AGE_ALPHA) * age,
                        malePredictions: gender === "male" ? updatedPrediction.malePredictions + 1 : updatedPrediction.malePredictions,
                        femalePredictions: gender === "female" ? updatedPrediction.femalePredictions + 1 : updatedPrediction.femalePredictions,
                        minAge,
                        maxAge,
                        updates: updatedPrediction.updates + 1
                    };

                    return { predictions }
                })
            } else {
                await this.setState(prevState => {
                    let predictions = prevState.predictions;
                    let pastDescriptors = prevState.pastDescriptors;
                    let prediction = {
                        age,
                        malePredictions: gender === "male" ? 1 : 0,
                        femalePredictions: gender === "female" ? 1 : 0,
                        minAge: age,
                        maxAge: age,
                        updates: 1,
                    };
                    predictions.push(prediction);
                    pastDescriptors.push(descriptor);
                    return { predictions, pastDescriptors }
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
                    <div className='fullscreen'>
                        <FlexView column hAlignContent="center" vAlignContent="top" width="100%" height="100%" style={{background: 'black'}}>
                            <Webcam
                                className="webcam"
                                audio={false}
                                width={WIDTH}
                                height={HEIGHT}
                                ref={this.webcam}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                            />
                            <div className="gradient" style={{width: WIDTH, height: HEIGHT}} />
                            <div className="detecting">Detecting...</div>
                        </FlexView>
                    </div>


                    {!!fullDesc ? (
                        <div className="fullscreen">
                            <FlexView hAlignContent="center" vAlignContent="top" width="100%" height="100%">
                                <FlexView width={WIDTH} height={HEIGHT} >
                                    <DrawBox
                                        fullDesc={fullDesc}
                                        imageWidth={WIDTH}
                                        boxColor={'blue'}
                                    />
                                </FlexView>
                            </FlexView>
                        </div>

                    ) : null}
                </FlexView>;

        let predictions =
            <FlexView column
                      className="predictions"
                      width="100%"
                      height="100%"
                      vAlignContent="center"
                      hAlignContent="center">
                <FlexView hAlignContent="center">
                    {
                        !this.state.finalPredictions.length ?
                            <h2>Feelboard did not detect any person</h2> :
                            <h2>Feelboard detected { this.state.finalPredictions.length === 1 ? "1 person!" :
                                this.state.finalPredictions.length + " persons!" }</h2>
                    }
                </FlexView>

                <FlexView wrap width={WIDTH} hAlignContent="center">
                    {
                        this.state.finalPredictions.map((pred, i) => (
                            <FlexView column key={i} className="icon" hAlignContent="center">
                                <div className={pred.gender === "male" ? "icon-img male" : "icon-img female"} />
                                <FlexView className="info" column hAlignContent="center">
                                    <FlexView className="final-prediction">
                                        { pred.gender === "male" ? "Male, " : "Female, " }
                                        { Math.round(pred.age) }
                                    </FlexView>
                                    <FlexView>
                                        ({ Math.round(pred.minAge) } - { Math.round(pred.maxAge) })
                                    </FlexView>
                                </FlexView>
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