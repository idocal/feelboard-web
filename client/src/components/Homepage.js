import React from 'react';
import FlexView from 'react-flexview';
import '../styles/Homepage.css';
import { Link } from 'react-router-dom'

export default function Homepage() {
    return (
        <FlexView width="100%" height="100%" className="background">
            <FlexView className="container">
                <FlexView className="logo-space" column>
                    <FlexView className="logo" />
                    <FlexView className="slogan">
                        A sensible billboard for your brand
                    </FlexView>
                    <FlexView className="demo-button">
                        <Link to="/demo">
                            <button>Live Demo</button>
                        </Link>
                    </FlexView>
                </FlexView>
            </FlexView>

        </FlexView>
    )
}