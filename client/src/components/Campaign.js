import React from 'react';
import FlexView from 'react-flexview';
import { Colors } from '../config';
import Videoset from './Videoset';
import VideosetAdd from './VideosetAdd';

export default function Campaign() {
    return (
        <FlexView column width={"100%"}>
            <h1 style={{"color": Colors.mainGray}}>Campaign</h1>
            <FlexView className={"videosets"} style={{"marginTop": '25px'}}>
                <Videoset/>
                <VideosetAdd />
            </FlexView>
        </FlexView>
    )
}