import React from 'react';
import FlexView from 'react-flexview';
import { Colors } from '../config';
import '../styles/Profile.css';

export default function Profile() {
    return (
        <FlexView
            width={430}
            height={"100%"}
            className={"profile-panel"}
            hAlignContent={"center"}
            style={{"background": Colors.mainBlue}}
        >

            <FlexView column hAlignContent={"center"} className={"profile"}>
                <FlexView
                    className={"profile-pic-frame"}
                    vAlignContent={"center"}
                    hAlignContent={"center"}
                >
                    <FlexView className={"profile-pic"} />
                </FlexView>
                <FlexView className={"username"}>
                    Ido Calman
                </FlexView>
                <FlexView className={"company"} style={{"color": Colors.fadeBlue}}>
                    feelboard.ai
                </FlexView>
            </FlexView>



        </FlexView>
    )
}