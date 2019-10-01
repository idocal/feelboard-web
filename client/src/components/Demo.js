import React, { Component } from 'react';
import FlexView from 'react-flexview';
import Loader from './Loader';
import Webcam from "react-webcam";
import { loadModels, getFullFaceDescription } from '../faceapi';
import { withRouter } from 'react-router-dom';
import DrawBox from './DrawBox';
import '../styles/Demo.css';

let WIDTH = 640;
let HEIGHT = 480;

class Demo extends Component {

    constructor(props) {
        super(props);
        this.webcam = React.createRef();
        this.state = {
            loading: true,
            fullDesc: null,
            facingMode: null
        };
    }

    async componentWillMount() {
        this.startCapture();
        await loadModels();
        let cameraSize = await this.getUserCameraSize();
        WIDTH = cameraSize.width;
        HEIGHT = cameraSize.height;
        await this.setState({
            loading: false
        });
    }

    async getUserCameraSize() {
        let stream = await navigator.mediaDevices.getUserMedia({video: true});
        let {width, height} = stream.getTracks()[0].getSettings();
        return {width, height}
    }

    startCapture() {
        this.interval = setInterval(async () => {
            await this.capture();
        }, 300);
    };

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async capture() {
        if (!!this.webcam.current) {
            await getFullFaceDescription(
                this.webcam.current.getScreenshot()
            ).then(fullDesc => {
                this.setState({ fullDesc })
            });
        }
    };

    render() {
        const { loading, fullDesc, facingMode } = this.state;
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

        return (
            <FlexView className="demo">
                {
                    loading ? <Loader/> : webcamWithPredictions
                }
            </FlexView>
        )
    }

}

export default withRouter(Demo);