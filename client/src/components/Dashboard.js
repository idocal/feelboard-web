import React from 'react';
import FlexView from 'react-flexview';
import Campaign from './Campaign';
import '../styles/Dashboard.css';

export default function Dashboard() {
    return (
        <FlexView column width={"100%"} className={"dashboard"}>
            <Campaign/>
        </FlexView>
    )
}