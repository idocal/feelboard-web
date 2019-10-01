import React, { Component } from 'react'
import { Form, Radio } from 'semantic-ui-react'

export default class ModalOption extends Component {
    state = {};
    handleChange = (e, { value }) => this.setState({ value });

    render() {
        return (
            <Form style={{"marginRight": "40px"}}>
                <h3>{this.props.title}</h3>

                {
                    this.props.options.map(item => {
                        return (
                            <Form.Field key={item.value}>
                                <Radio
                                    label={item.label}
                                    name={item.name}
                                    value={item.value}
                                    checked={this.state.value === item.value}
                                    onChange={this.handleChange}
                                />
                            </Form.Field>
                        )
                    })
                }
            </Form>
        )
    }
}