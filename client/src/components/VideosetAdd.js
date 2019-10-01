import React, { Component } from 'react';
import FlexView from 'react-flexview';
import '../styles/Videoset.css';
import { Colors, Genders, Ages, Variations } from '../config';
import VideoIcon from '../images/video-icon@2x.png';
import { Modal, Button } from 'semantic-ui-react'
import ModalOption from "./ModalOption";

export default class VideosetAdd extends Component {

    constructor(props) {
        super(props);
        this.modalBox = this.modalBox.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    modalBox() {
        return (
            <FlexView column
                      className={"videoset-add"}
                      hAlignContent={"center"}
                      style={{"borderColor": Colors.mainGray}}
                      vAlignContent={"center"}
            >
                <img alt="Add video set" src={VideoIcon} />
            </FlexView>
        )
    }

    handleSubmit() {


    }

    render() {
        return (
            <Modal trigger={this.modalBox()} className={"modal"}>
                <Modal.Header>Rule #1</Modal.Header>
                <Modal.Content>
                    <FlexView className={"options"} vAlignContent={"top"}>
                        <FlexView className={"option"} vAlignContent={"center"}>
                            <ModalOption options={Genders} title={"Gender"} />
                        </FlexView>

                        <FlexView className={"option"} vAlignContent={"center"}>
                            <ModalOption options={Ages} title={"Age"} />
                        </FlexView>

                        <FlexView className={"option"} vAlignContent={"center"}>
                            <ModalOption options={Variations} title={"Variations"} />
                        </FlexView>
                    </FlexView>
                    <FlexView hAlignContent={"right"}>
                        <Button onClick={this.handleSubmit}>Submit</Button>
                    </FlexView>
                </Modal.Content>
            </Modal>
        )
    }

}