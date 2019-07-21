import React from 'react';
import logo from "../assets/img/simi.png"

class Login extends React.Component {
    render() {
        return (
            <div>
            {this.props.loginError && <div className="error">{this.props.loginError }</div>} 
            <div className="container">
            <img className="logo" src={logo} alt=""/>
                <form action="#" method="POST" onSubmit={this.props.onFormSubmit}>
                    <input type="text" placeholder="username" className="field"></input>
                    <input type="password" placeholder="password" className="field"></input>
                    <input type="submit" value="login" className="btn"></input>
                </form>	
	        </div>
         </div>
        );
      }
}
export default Login;

