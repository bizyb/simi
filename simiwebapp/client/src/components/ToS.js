import React from 'react';
import LegalRenderer from './LegalRenderer';
import { server } from "../utils/utils";
const url = server + "/tos"

class ToS extends React.Component {
    state = {
        data: null
    }
    componentDidMount() {
        this.getToS()
    }

    getToS = async () => {
        const response = await fetch(url)
        const json = await response.json()
        this.setState({data: json})
    }

    render() {
        return (
            <div className="App">
            {this.state.data && <LegalRenderer data={this.state.data}/> }
            </div>
        );
      }


}

export default ToS;

