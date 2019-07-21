import React from 'react';
import { postData, server } from "../utils/utils";

const url = server + "/endpoint"
class Endpoint extends React.Component {
    state = {
        endpoint: ""
    }
    componentDidMount() {
        this.currentEndpoint()

    }
    currentEndpoint = async () => {
        const response = await fetch(url)
        const json = await response.json()
        this.setState({endpoint: json.endpoint})

    }

    updateEndpoint = (e) => {
        e.preventDefault()
        let value = e.target[0].value
        postData(url, {endpoint: value})
        .then(data => {
            if (data.status === "OK") {this.setState({endpoint: value})}
        })
        .catch(error => console.error(error));
    }
    render() {
        return (
            <div>
            {this.props.loginError && <div className="error">{this.state.error}</div>} 
            <div className="container">
            <div className="current-endpoint"><h6>Current Endpoint: {this.state.endpoint}</h6></div>
                <form action="#" method="POST" onSubmit={this.updateEndpoint}>
                    <input type="text" placeholder="new endpoint" className="field"></input>
                    <input type="submit" value="update" className="btn"></input>
                </form>	
	        </div>
         </div>
        );
      }
}
export default Endpoint;

