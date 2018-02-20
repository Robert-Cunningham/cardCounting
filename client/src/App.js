import React, { Component } from 'react';
import './App.css';
//import AppBar from 'material-ui/AppBar'
import CardCountingAppBar from './CardCountingAppBar.js'
import keydown from 'react-keydown';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import {cards} from './cards.js'
import TextField from 'material-ui/TextField'
import {Route, Link, Switch, Redirect} from 'react-router-dom'
import List, {ListItem, ListItemText} from 'material-ui/List'
import {Login} from "./Login.js"
import PermIdentityIcon from 'material-ui-icons/PermIdentity'

const rankLookup = ["2","3","4","5","6","7","8","9","10","jack","queen","king","ace"]
const suitLookup = ["clubs","hearts","diamonds","spades"]

const STATE_PLAY = 1;
const STATE_CHECK = 2;
const STATE_DONE = 3;

const NO_HIGH_SCORE = 100000;

class App extends Component {
  render() {
    return (
      <div id="parent">
      <CardCountingAppBar> 
                <Button component={Link} to="/login"> <PermIdentityIcon />Log In</Button>
      </CardCountingAppBar>
        <Switch>
          <Route exact path={"/"} render={() => <Redirect to="/play" />} />
          <Route path={"/play"} render = {() => <SiteController />} />
          <Route path={"/login"} render = {() => <Login />} />
        </Switch>
      </div>
    );
  }
}

class SiteController extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div>
        <CardController />
      </div>
    )
  }
}

class CardController extends React.Component { //Toggles between dialog and CardDisplayer
  constructor(props) {
    super(props);
    this.state = {
      playState: STATE_DONE,
      cardsToDisplay: parseInt(window.localStorage.cardsToDisplay, 10) || 5,
      rounds: parseInt(window.localStorage.cardsToDisplay, 10) || 5,
      name: window.localStorage.name, 
      recentScore: 0,
      correctCount: 10000,
      highScore: NO_HIGH_SCORE
    }
    this.done = this.done.bind(this)
    this.start = this.start.bind(this)
    this.check = this.check.bind(this)
    this.setOptions = this.setOptions.bind(this)
    this.updateHighScore = this.updateHighScore.bind(this)
    this.endOfGame = this.endOfGame.bind(this)
    this.sendDataToServer = this.sendDataToServer.bind(this)
  }

  setOptions(cardsToDisplay, rounds) {
    this.setState({
      cardsToDisplay: parseInt(cardsToDisplay, 10),
      rounds: parseInt(rounds, 10),
    })
  }

  done(correctCount) {
    this.setState((prevstate) => { return ({
      playState: STATE_CHECK,
      recentScore: Math.round(((new Date()).getTime() - prevstate.recentStartTime) / prevstate.cardsToDisplay / prevstate.rounds),
      correctCount: correctCount,
      guessedCount: 0
    })})
  }

  start() {
    this.setState({
      playState: STATE_PLAY,
      recentStartTime: (new Date()).getTime()
    })
  }

  endOfGame() {
    this.sendDataToServer();
    this.updateHighScore();

  }

  sendDataToServer() {
    fetch("/newScore", {
      method: 'POST',
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({"name": this.state.name, "correct": this.state.guessedCount === this.state.correctCount, "score": this.state.recentScore})
    })
  }

  updateHighScore() {
    if (this.state.guessedCount === this.state.correctCount) {
        this.setState((prevstate) => {return {
          highScore: Math.min(prevstate.highScore, prevstate.recentScore)
        }})
      }
  }

  check(guessedCount) {
    this.setState({
      playState: STATE_DONE,
      guessedCount: parseInt(guessedCount, 10)
    }, this.endOfGame)
  }

  render() {
    let result = <div> </div>
    if (this.state.correctCount !== 10000) {
      if (this.state.correctCount === this.state.guessedCount) {
        result = <div>Congratulations! Score: {this.state.recentScore} </div>
      } else {
        result = <div> Sorry, incorrect count! ({this.state.correctCount})</div>
      }
    }
    let toDisplay = <div> </div>
    if (this.state.playState === STATE_DONE) {
      toDisplay = <PlayDialog nameDefault={this.state.name} highScore={this.state.highScore} setHighScore={(val) => {this.setState({highScore: val})}} play={this.start} setOptions={this.setOptions} cardsToDisplayDefault={this.state.cardsToDisplay} roundsDefault={this.state.rounds} score={this.state.correctCount === this.state.guessedCount ? this.state.recentScore : 0}>
        {result}        
      </PlayDialog>
    } else if (this.state.playState === STATE_PLAY) {
      toDisplay = <CardDisplayer totalSets={this.state.rounds} cardsToDisplay={this.state.cardsToDisplay} onFinish={this.done} />
    } else if (this.state.playState === STATE_CHECK) {
      toDisplay = <CheckDialog done={this.check}/>
    }

    return (
      <div>
        {toDisplay}
      </div>
    )
  }
}

class CheckDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: true,
      count: ""
    }

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(e) {
    if (e.target.id === "count") {
      this.setState({count: e.target.value})
    }
  }

  render() { return (
    <div>
    <Dialog title="Card Counting" open={this.state.open}>
      <DialogTitle>{"Check your answer"}</DialogTitle>
      Count: <TextField id="count" onChange={this.handleChange} value={this.state.count}/>
      <DialogActions>
        <Button onClick={(e) => {this.props.done(this.state.count)}} color="primary">Check</Button>
      </DialogActions>
    </Dialog>
    </div>
  )}
}

class LeaderboardDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: true,
    }
  }

  componentDidMount() {
    fetch("/leaderboardData").then(data => data.json()).then((res) => {
      console.log(res)
      this.setState({
        leaders: res
      })
    })
  }

  render() {return (
    <div>
    <Dialog open={true}>
    <ol>
    {this.props.highScore === NO_HIGH_SCORE ? "You have no score" : "Your best score is " + this.props.highScore}
    {this.state.leaders && <GlobalLeaderBoard leaders={this.state.leaders} />}
    </ol>
      <DialogActions>
        <Button onClick={this.handleClose} autoFocus component={Link} to={'/'}>Done</Button>
        <Button onClick={() => {this.props.setHighScore(NO_HIGH_SCORE)}}>Reset</Button>
      </DialogActions>
    </Dialog>
    </div>
  )}
}

function GlobalLeaderBoard(props) {
  return (
    <List>
      {props.leaders.map(leader => {
        return (
          <ListItem>
            <ListItemText primary={leader["_id"]} secondary={leader.score} />
          </ListItem>
        )})}
    </List>
  )
}

class SettingsDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: true,
      cardsToDisplay: props.cardsToDisplayDefault,
      rounds: props.roundsDefault,
      name: props.nameDefault
    }
    this.handleSettings = this.handleSettings.bind(this)
    this.save = this.save.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  handleSettings(e) {
    if (e.target.id === "name") {
      this.setState({name: e.target.value})
    }
    if (e.target.id === "cardsToDisplay") {
      this.setState({cardsToDisplay: e.target.value});
    }
    if (e.target.id === "rounds") {
      this.setState({rounds: e.target.value});
    }
  }

  save(e) {
    this.props.setOptions(this.state.cardsToDisplay, this.state.rounds)
    this.setState({open: false})
    window.localStorage.cardsToDisplay = "" + this.state.cardsToDisplay;
    window.localStorage.rounds = "" + this.state.rounds;
    window.localStorage.name = "" + this.state.name;
  }

  cancel(e) {
    this.setState({open: false})
  }

  render() {return (
    <div>
    <Dialog open={true}>
      Name: <TextField id="name" onChange={this.handleSettings} value={this.state.name}/>
      Cards per screen: <TextField id="cardsToDisplay" onChange={this.handleSettings} value={this.state.cardsToDisplay}/>
      Rounds: <TextField id="rounds" onChange={this.handleSettings} value={this.state.rounds}/>
      <DialogActions>
        <Button onClick={this.cancel} component={Link} to={'/'}>Cancel</Button>
        <Button onClick={this.save} autoFocus component={Link} to={'/'}>Save</Button>
      </DialogActions>
    </Dialog>
    </div>
  )}
}

class PlayDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: true,
    }
    this.playWithOptions = this.playWithOptions.bind(this)
  }

  playWithOptions() {
    this.props.play()
  }

  
  render() {
    return (
    <Dialog title="Card Counting" open={this.state.open}>
      <DialogTitle>{"Learn to Count Cards"}</DialogTitle>
      {this.props.children}
      <DialogContent>
        <DialogContentText>
        Counting cards is easy! Keep a number in your head, starting at 0. When you see a card
        with rank between 2 and 6, subtract one. When you see a card with rank between 7 and 9, 
        do nothing. When you see a card with rank between 10 and ace, add 1. At the end, type in
        your running count to confirm!
        </DialogContentText>
        <Route exact path={'/settings'} render={() => <SettingsDialog {...this.props}/>} />
        <Route exact path={'/leaderboard'} render={() => <LeaderboardDialog {...this.props} /> }/>
      </DialogContent>
      <DialogActions>
        <Button component={Link} to={'/leaderboard'}>Leaderboard</Button>
        <Button component={Link} to={'/settings'}>Settings</Button>
        <Button onClick={this.playWithOptions} color="primary">Play</Button>
      </DialogActions>
    </Dialog>
    )
  }
}


class CardDisplayer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      count : 0,
      currentCards: [],
      left : this.props.totalSets
    }
    this.nextSet = this.nextSet.bind(this)
    this.getCountDelta = this.getCountDelta.bind(this)
  }

  componentWillMount() {
    this.nextSet(undefined)
  }

  getCountDelta(cardSet) {
    return cardSet.reduce((prev, current) => {
      return prev + (current.rank <= 4 ? -1 : 0) + (current.rank >= 8 ? 1 : 0)
    }, 0)
  }

  @keydown("enter")
  nextSet(event) {
    if (this.state.left === 0) {
      this.props.onFinish(this.state.count)
      return
    }
    let next = [];
    for (let i = 0; i < this.props.cardsToDisplay; i++) {
      next.push({rank: Math.floor(Math.random() * 13), suit: Math.floor(Math.random() * 4)})
    }
    this.setState((prevState) => {
      return ({
        count: prevState.count + this.getCountDelta(next),
        left: prevState.left -1,
        currentCards: next
      })
    })
  }

  render() {
    return (<div>
      <CardSet cards={this.state.currentCards}> </CardSet>
    </div>)
  }
}

function CardSet(props) {
  let output = props.cards.map((item, index) => {
    return (
    <li key={index}> {<Card type={item}> </Card>} </li>
    )
  })
  return (
    <ul className="card-set"> {output} </ul>
  )
}

function Card(props) {
  return (
    <img className="card" src={getFileName(props.type.rank, props.type.suit)} alt={rankLookup[props.type.rank] + " of " + suitLookup[props.type.suit]}></img>
  )
}


function getFileName(rank, suit) {
  return cards[suit * 13 + rank];
  //(process.env.PUBLIC_URL + "/cardImages/" + rankLookup[rank] + "_of_" + suitLookup[suit] + ".png")
}

export default App;
