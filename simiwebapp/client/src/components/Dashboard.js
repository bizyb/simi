import React from 'react';
import Login from './Login';
import Endpoint from './Endpoint';
import { postData, server } from "../utils/utils";

class Dashboard extends React.Component {
    state = {
        isLoggedIn: false,
        username: null,
        loginError: null,
    }
    componentDidMount() {
        if (localStorage.getItem("isLoggedIn")) {
            this.setState({
                isLoggedIn: true,
                username: localStorage.getItem("username"),
            })
        }
    }
    // componentWillUnmount() {
    //     localStorage.removeItem("isLoggedIn")
    //     localStorage.removeItem("username")
    // }
    
    onFormSubmit = (e) => {
        e.preventDefault()
        let data = {
            username: e.target[0].value,
            password: e.target[1].value,
            role: "staff",
        }
        let url = server + "/login"
        postData(url, data)
        .then(data => {
            if (data.status === "OK") {
                    this.setState({
                    isLoggedIn: true,
                    username: data.username,
                    loginError: null,
                })
                localStorage.setItem("isLoggedIn", true)
                localStorage.setItem("username", data.username)
            } else {
                this.setState({
                    loginError: "Invalid login credentials"
                })

            }
        })
        .catch(error => console.error(error));
    }
    render() {
        return (
            <div className="App">
            {!this.state.isLoggedIn && 
            <Login
                loginError={this.state.loginError}
                onFormSubmit={this.onFormSubmit}/>}
            {this.state.isLoggedIn &&
            <Endpoint/>
            }
            </div>
        );
      }
}
export default Dashboard;

