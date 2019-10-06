import React from 'react';
import FlexView from 'react-flexview';
import '../styles/CameraError.css'
import {Link} from "react-router-dom";

export default function CameraError() {
    return (
        <FlexView column className="camera-error" width="100%" height="100%" vAlignContent="center" hAlignContent="center">
            <div className="camera" />
            <h1>Oops!</h1>
            <h2>Feelboard could not grant access to your camera. Please try again.</h2>
            <Link to='/'>
                <button>Go back</button>
            </Link>
        </FlexView>
    )
}