import React from 'react';
import FlexView from 'react-flexview';
import '../styles/Videoset.css';

export default function Videoset() {
    return (
        <FlexView column className={"videoset"} hAlignContent={"center"}>
            <FlexView className={"thumb"} />
            <FlexView className={"title"} >
                {"Baseline"}
            </FlexView>
        </FlexView>
    )
}