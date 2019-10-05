import React, { Component } from 'react';

export default class DrawBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            detections: null,
            ages: null,
            genders: null,
            descriptors: null,
        };
    }

    componentDidMount() {
        this.getDescription();
    }

    componentWillReceiveProps(newProps) {
        this.getDescription(newProps);
    }

    getDescription = async (props = this.props) => {
        const { fullDesc } = props;
        if (!!fullDesc) {
            await this.setState({
                detections: fullDesc.map( desc => { return desc.detection } ),
                ages: fullDesc.map( desc => { return desc.age } ),
                genders: fullDesc.map( desc => { return desc.gender } ),
                descriptors: fullDesc.map( desc => { return desc.descriptor } )
            });
        }
    };

    render() {
        const { imageWidth, boxColor } = this.props;
        const { detections } = this.state;
        let box = null;

        if (!!detections) {
            box = detections.map((detection, i) => {
                const relativeBox = detection.relativeBox;
                const dimension = detection._imageDims;
                let _X = imageWidth * relativeBox._x;
                let _Y =
                    (relativeBox._y * imageWidth * dimension._height) / dimension._width;
                let _W = imageWidth * relativeBox.width;
                let _H =
                    (relativeBox.height * imageWidth * dimension._height) /
                    dimension._width;
                return (
                    <div key={i}>
                        <div
                            style={{
                                border: 'solid',
                                borderColor: boxColor,
                                height: _H,
                                width: _W,
                                transform: `translate(${_X}px,${_Y}px)`
                            }}
                        >
                            <div className="predictions">
                                <div className="gender">{ this.state.genders[i]}</div>
                                <div className="age">{ Math.floor(this.state.ages[i]) }</div>
                            </div>
                        </div>
                    </div>
                );
            });
        }

        return <div>{box}</div>;
    }
}