import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import "./RegisterPageCSS.css";

export default class registerpage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      repassword: '',
      isAuth: false
    };
  }

  mySubmitHandler = async (event) => {
    event.preventDefault();
    const { username, password, repassword } = this.state;
    const { history } = this.props;
    try {
      if (username.trim().length > 0 && password.trim().length > 0 && repassword.trim().length > 0 && password===repassword) {
        const body = this.state;
        const response = await fetch("http://localhost:5000/registerpage", {
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
      } else {
        console.log("Set name and password");
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
        {!this.state.isAuth ?
          <form onSubmit={this.mySubmitHandler}>
            <h1>Izrada korisničkog računa</h1>
            <ul id="registerMenu">
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
              <p>Ponovo unesi lozinku:</p>
              <input
                type='password'
                name='repassword'
                onChange={this.myChangeHandler}
              />
              <br />
              <br />
              <input id="loginButton" type='submit' value="Registracija" />
              <br />
              <br />
              <Link to="/"><b>Povratak</b></Link>
            </ul>
          </form> :
          <Redirect to="/"/>
        }
      </div>

    );
  }
}
