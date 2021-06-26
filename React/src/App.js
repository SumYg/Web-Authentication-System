// import logo from './logo.svg';
import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  useHistory,
  useParams,
  useRouteMatch
} from "react-router-dom";
import DocPage from './Document.js'


class LoginApp extends React.Component {
  constructor(props) {
    super(props)
    this.loginClickHandler = this.loginClickHandler.bind(this)
    this.logoutClickHandler = this.logoutClickHandler.bind(this)
    this.newDocHandler = this.newDocHandler.bind(this)
    this.sendEmailClickHandler = this.sendEmailClickHandler.bind(this)
    this.registerHandler = this.registerHandler.bind(this)
    this.registerSubmitionHandler = this.registerSubmitionHandler.bind(this)
    this.backToLogin = this.backToLogin.bind(this)
    this.newDocSubmittion = this.newDocSubmittion.bind(this)
    // console.log(this.state)
    this.state = {pageState: null}
  }
  componentDidMount() {
    // if (this.state.pageState === null) {
      // console.log('rendering')
      this.checkLoginStatus();
    // }

  }
  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state,callback)=>{
        return;
    };
}

  checkLoginStatus() {
    fetch('http://localhost:8000/check', {
      credentials: "include"
    }).then( response => {
      if (response.status === 200) {
        response.json().then( res => {
          // console.log("check result",res)
          if (res.loginStatus === false) {
            this.setState({pageState: 'login'})
            return false
          }
          else if (res.loginStatus === true) {
            this.setState({pageState: 'logout', id: res.['userID'], username: res['username']})
            // console.log(this.state)
            return true
          }
          // console.log(x)
        })
      } else {
            this.setState({pageState: 'login'})
            return false //error
      }
    })

  }

  loginClickHandler(e) {
    let inputAcc = document.getElementById('account').value;
    let inputPass = document.getElementById('password').value;
    if (inputAcc === "" || inputPass === "") {
      // alert("Please input your account or password")
      return
    } else {
      e.preventDefault();
    }
    let form = document.getElementById('loginForm');
    fetch('http://localhost:8000/login', {
      credentials: "include",
      method: 'post',
      body: JSON.stringify({ account: inputAcc, password: inputPass}),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 200) {
        response.json().then( res => {
          // console.log(res)
          if (res['loginSucc'] === 1) {
            this.setState({pageState: 'logout', username: inputAcc, id: res['userID']})
          }
          else {
            alert("Invalid Username or Password")
          }
          form.reset();

        })
      }
    })
    // console.log(`${inputAcc} ${inputPass} Sumitsdf`);
  }
  logoutClickHandler() {
    this.setState({pageState: 'login'})
    fetch('http://localhost:8000/logout', {
      credentials: "include"
    })
     .then(response => {
       if (response.status === 200) {
         alert("Logged out successfully!")
       }
     })
  }

  sendEmailClickHandler() {
    fetch('http://localhost:8000/auto-mail', {
      credentials: "include"
    })
     .then(response => {
       if (response.status === 200) {
          response.json().then((res) => {
            if (res.emailSent === true) {
              alert("Email Sent To You")
            } else if (res.emailSent === false) {
              alert("Error "+res.error)
            }
          })
      }
     })
  }

  registerHandler() {
    // console.log("Changing to register")
    this.setState({pageState: "register"})
  }

  emailValidation(email) {
    const mailFormat = /^(([^<>()[\].,;:\s@"]+(.[^<>()[\].,;:s@"]+)*)|(".+"))@(([^<>()[\].,;:s@"]+\.)+[^<>()[\].,;:s@"]{2,})$/i;
    if (mailFormat.test(email)) {
      return true
    }
    alert("Please input a valid email")
    return false
  }


  async registerSubmitionHandler(e) {
    // console.log("Submitting Register Form")
    let inputAcc = document.getElementById('account').value;
    let inputEmail = document.getElementById('email').value;
    let inputPass = document.getElementById('password').value;
    if (inputAcc === "" || inputPass === "" || inputEmail === "" || inputEmail.search("@") === -1) {
      // alert("Please input your account or password")
      return
    } else {
      e.preventDefault();
      if (!this.emailValidation(inputEmail))
        return
    }
    await fetch('http://localhost:8000/register', {
      credentials: "include",
      method: 'post',
      body: JSON.stringify({ account: inputAcc, password: inputPass, email: inputEmail}),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 201) {
        alert("Account registered successfully!")
        this.backToLogin()// redirect to login page
      } else {
        response.text().then( res => {
          // console.log("response ==== ",res)
          if (res === 'Duplicate account' || res === 'Duplicate email') {
            alert(res)
            // form.reset()
          }

        })
      }
    })
    console.log(inputAcc, inputEmail, inputPass,"=======================")
    // return false
  }
  backToLogin() {
    this.setState({pageState: 'login'})
  }
  newDocHandler() {
    this.setState({pageState: 'newDoc'})
  }
  async newDocSubmittion() {
    const docId = document.getElementById('docId').value
    // alert(`Send id "${docId}" to the server to hash and insert`)
    await fetch('http://localhost:8000/insertDoc', {
      credentials: "include",
      method: 'post',
      body: JSON.stringify({docId: docId}),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      if (response.status === 201) {
        alert("Doc added!")
        this.setState({pageState: 'logout'})
        // redirect to login page
      } else {
        response.text().then( res => {
          // console.log("response ==== ",res)
          alert(res)

        })
      }
    })
  }
  render() {
    const pageState = this.state.pageState
    // console.log(pageState)
    let body, greeting
    switch(pageState) {
      case null:
        //wait for fetch response
        break
      case 'login':
        greeting = <GuestGreeting />
        body = // continued
        <Router>
            <LoginForm onClick={this.loginClickHandler} onClick1={this.registerHandler}/>
            <Switch>
              <Route exact path='/'>
              </Route>
              <Route path='/*' children={<Redirect to='/' />} />
            </Switch>
        </Router>
        break
      case 'logout':
        greeting = ""
        body =  // continued
        <Router>
            <Switch>
              <Route exact path='/'>
                <CreateDocBtn onClick={this.newDocHandler}/>
                <UserGreeting username={this.state.username} id={this.state.id} />
                <LogoutButton onClick={this.logoutClickHandler} />
              </Route>
              <Route path="/document">
                <LogoutButton onClick={this.logoutClickHandler} />
                <DocumentPage userid={this.state.id}  onEmailClick={this.sendEmailClickHandler} />
              </Route>
            </Switch>
        </Router>
        break
      case 'register':
        greeting = <AccountRegistration />
        body = <RegisterForm onClick={this.registerSubmitionHandler} onClick1={this.backToLogin}/>
        break
      case 'newDoc':
        greeting = <h1>Create Document</h1>
        body = <NewDocForm onSubmit={this.newDocSubmittion} />
        break
      default:
        break
    }
    

    return (
      <div className="App">
          {greeting}
          {body}
      </div>
    );
  }
}

function NewDocForm(props) {
  return (
  <React.Fragment>
    <p><label htmlFor='docId'>Doc id:</label><input type='text' id='docId' required autoFocus></input></p>
    <input type="submit" onClick={props.onSubmit}></input>
    </React.Fragment>
)}

function CreateDocBtn(props) {
  return (
    <button onClick={props.onClick}>Create Document</button>
  )
}

function RegisterForm(props) {
  return (
    <div id="RegisterANDRefresh">
      <form id='registerForm'>
        <p><label htmlFor='account'>Account:</label><input type='text' id='account' required autoFocus></input></p>
        {/* <p><label htmlFor='email'>Email:</label><input type='email' id='email' onValid={emailValidation} onInvalid={emailValidation} required></input></p> */}
        <p><label htmlFor='email'>Email:</label><input type='email' id='email' required></input></p>
        <p><label htmlFor='password'>Password:</label><input type='password' id='password' required></input></p>
        <button onClick={props.onClick}>Register</button>
    </form>
    <button onClick={props.onClick1}>Back to Login Page</button>
    </div>
  )
}

function DocumentPage(props) {
  // console.log("num",props.userid)
  let match = useRouteMatch()
  // console.log(match)
  return (
    <Switch>
      <Route exact path={match.path}>
        <HomeButton />
        <h1>No document id in the url</h1>
      </Route>
      <Route exact path={`${match.path}/:id`} children={<DocDetail userid={props.userid}  onEmailClick={props.onEmailClick} />}/>
      <Route path ={`${match.path}/*/*`}>
        <HomeButton />
        <h1>Invalid URL</h1>
        {/* {alert("In")}   first time load blank page and reload after receiving fetch response? */}
        {/* {console.log("==============================")} */}
      </Route> 
    </Switch>
  )
}

function DocDetail(props) {
  let { id } = useParams()
  // props.checkValidDoc(id);
  return (
    <React.Fragment>
      <SendEmailButton onClick={props.onEmailClick} />
      <HomeButton />
      <DocPage userid={props.userid} docid={id}/>
    </React.Fragment>
  )
}

function HomeButton() {
  const history = useHistory()
  return <button onClick={() => {history.push('/')}}>Back to Home</button>
}

function AccountRegistration() {
  return <h1>Register Your Account</h1>
}

function GuestGreeting(props) {
  return <h1>Welcome, Please Login</h1>
}

function UserGreeting(props) {
  return(
    <React.Fragment>
      <h1>Hi {props.username} id: {props.id}</h1>
      <p><Link to='/document/$2b$11$GurflbcgqbEi.fmsXayAhOCDAzPh2DcAIQPvwsIUrBZXt64aPj9Ay'>/document/$2b$11$GurflbcgqbEi.fmsXayAhOCDAzPh2DcAIQPvwsIUrBZXt64aPj9Ay</Link></p>
      <p><Link to='/document/asd@4;'>/document/asd@4;</Link></p>
      <p><Link to='/document/4280cb359a47f816a8564107a51b26ba2f72e5d94a2fc46dd5c5248d15cb29e0'>/document/4280cb359a47f816a8564107a51b26ba2f72e5d94a2fc46dd5c5248d15cb29e0</Link></p>
      <p><Link to='/document/'>/document/</Link></p>
      <p><Link to='/document/1111/1'>/document/1111/1</Link></p>
    </React.Fragment>
  )
}

function LogoutButton(props) {
  const history = useHistory()
  function handler() {
    history.push('/')
    props.onClick()
  }
  return (
    <button onClick={handler}>
      Logout
    </button>
  )
}

function SendEmailButton(props) {

  return (
    <button onClick={props.onClick}>
      Send Me Email
    </button>
  )
}

function LoginForm(props) {
  return (
    <div id="LoginANDRegister">
    <form id="loginForm">
      <p><label htmlFor='account'>Account:</label><input type='text' id='account' required autoFocus></input>
      </p>
      <p><label htmlFor='password'>Password:</label> <input type='password' id='password' required></input>
      </p>
      <button onClick={props.onClick}>Login</button>
      
    </form>
    <button onClick={props.onClick1} id="register-button">Register</button>
    </div>
  )
}

export default LoginApp;
