import React from 'react'
import {withStyles, Paper, TextField, Checkbox, Button} from 'material-ui'
import {Redirect} from 'react-router-dom'

const style = {
    loginPage: {
        "display": "flex",
        "justify-content": "center",
        "align-content": "center",
        "height": "100%",
        "width": "100%",
        "top": "0",
        "left": "0",
        "position": "absolute",
    },
    loginItem: {
        "padding": "40px",
        "width": "20%",
        "margin": "auto"
    }
}

function LoginPage(props) {
    return (
        <div className={props.classes.loginPage}>
        <Paper elevation={4} className={props.classes.loginItem}>
            <LoginController />
        </Paper>
        </div>
    )
}

class LoginController extends React.Component {
    constructor(props) {
        super(props)
        this.state = {username:"", password:"", remember: false, correct: false, tried: false}
        this.onLoginAttempt = this.onLoginAttempt.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onNewAccount = this.onNewAccount.bind(this)
    }

    onNewAccount() {
        fetch("/newAccount", {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            })
        })
    }

    onLoginAttempt() {
        fetch("/auth", {
            method: "POST",
            headers: new Headers({
                "Content-Type": "application/json"
            }),
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            })
        }).then(resp => resp.json()).then((data) => {
            this.setState({tried: true})
            if (data.correct) {
                this.setState({correct: true})
                console.log("succeeded")
            } else {
                this.setState({correct: false})
                console.log("failed")
            }
        })
    }

    onChange(e) {
        if(e.target.name === "username") {
            this.setState({username: e.target.value})
        }
        if(e.target.name === "password") {
            this.setState({password: e.target.value})
        }
        if(e.target.name === "remember") {
            this.setState({remember: e.target.checked})
        }
    }

    render() {
        return (
            <div>
                {this.state.correct && <Redirect to="/play" />}
                <LoginPresenter onNewAccount={this.onNewAccount} onChange={this.onChange} failed={this.state.tried && !this.state.correct} onLoginAttempt={this.onLoginAttempt} username={this.state.username} password={this.state.password} remember={this.state.remember}/>                
            </div>
        )
    }
}

function LoginPresenter(props) {
    return (
        <div className="LoginInterior">
        {props.failed && <div>Incorrect username or password</div>}
            <TextField name="username" label="Username" value={props.username} onChange={props.onChange} /> <br />
            <TextField name="password" label="Password" value={props.password} onChange={props.onChange} type="password" /> <br />
            <div>
                <Checkbox name="remember" checked={props.remember} onChange={props.onChange} />Remember me <br />
             </div>
             <div>
                <Button onClick={ e => props.onLoginAttempt() }> Login </Button>
                <Button onClick={ e => props.onNewAccount() }>New Account</Button>
            </div>
        </div>
    )
}

const Login = withStyles(style)(LoginPage)

export {
    Login
};