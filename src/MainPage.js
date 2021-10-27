import './MainPageCSS.css';
import { Link, Redirect } from 'react-router-dom';
import React from 'react';

export default class mainpage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isAuth: false
    };  
  }


  mySubmitHandler = async (event) => {
    event.preventDefault();
    const { username, password } = this.state;
    const { history } = this.props;
    try {
      const body = this.state;
      const response = await fetch("http://localhost:5000/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const parseRes = await response.json();
      localStorage.setItem("token", parseRes.token)
      if (localStorage.token !== "undefined") {
        this.setState({ isAuth: true });
      } else {
        this.setState({ isAuth: false });
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  myChangeHandler = (event) => {
    let nam = event.target.name;
    let val = event.target.value;
    this.setState({ [nam]: val });
  }

  render() {
    return (
      <div>
        {this.state.isAuth ? <Redirect to="/page1" /> :
          <form onSubmit={this.mySubmitHandler}>
            <h4>Internazionale Bank</h4>
            <ul id="mainMenu">
              <p>Unesi ime:</p>
              <input
                type='text'
                name='username'
                onChange={this.myChangeHandler}
              />
              <p>Unesi lozinku:</p>
              <input
                type='password'
                name='password'
                onChange={this.myChangeHandler}
              />
              <br />
              <br />
              <input id="loginButton" type='submit' value="Prijava" />
              <br />
              <Link to="/registerpage"><b>Nemaš korisnički račun?</b></Link>
            </ul>
          </form>}
      </div>
    );
  }
}
