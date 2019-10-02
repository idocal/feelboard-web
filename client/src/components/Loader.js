import React from 'react';
import '../styles/Loader.css';
import FlexView from 'react-flexview';

const Loader = function() {
    return (
        <FlexView hAlignContent="center" vAlignContent="center" height="100%" width="100%">
            <div className="boxes">
                <div className="box">
                    <div />
                    <div />
                    <div />
                    <div />
                </div>
                <div className="box">
                    <div />
                    <div />
                    <div />
                    <div />
                </div>
                <div className="box">
                    <div />
                    <div />
                    <div />
                    <div />
                </div>
                <div className="box">
                    <div />
                    <div />
                    <div />
                    <div />
                </div>
            </div>
        </FlexView>
    )
};

export default Loader;