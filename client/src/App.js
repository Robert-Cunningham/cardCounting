import React, { Component } from 'react';
import './App.css';
import AppBar from 'material-ui/AppBar'
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

const rankLookup = ["2","3","4","5","6","7","8","9","10","jack","queen","king","ace"]
const suitLookup = ["clubs","hearts","diamonds","spades"]

const STATE_PLAY = 1;
const STATE_CHECK = 2;
const STATE_DONE = 3;

class App extends Component {
  render() {
    return (
      <div id="parent">
          <AppBar> Counting Cards </AppBar>
        <CardController> </CardController>
      </div>
    );
  }
}

class CardController extends React.Component { //Toggles between dialog and CardDisplayer
  constructor(props) {
    super(props);
    this.state = {
      playState: STATE_DONE,
      cardsToDisplay: parseInt(window.localStorage.cardsToDisplay) || 5,
      rounds: parseInt(window.localStorage.cardsToDisplay) || 5,
      recentScore: 0,
      correctCount: 10000     
    }
    this.done = this.done.bind(this)
    this.start = this.start.bind(this)
    this.check = this.check.bind(this)
    this.setOptions = this.setOptions.bind(this)
  }

  setOptions(cardsToDisplay, rounds) {
    this.setState({
      cardsToDisplay: parseInt(cardsToDisplay),
      rounds: parseInt(rounds),
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

  check(guessedCount) {
    this.setState({
      playState: STATE_DONE,
      guessedCount: parseInt(guessedCount)
    })

    /*
    if (this.state.guessedCount === this.state.correctCount) {
      fetch("/newScore", {
        body: JSON.stringify({"player": this.state.recentScore})
      })
    }
    */

    if (isNaN(parseInt(window.localStorage.score))) {
      window.localStorage.score = "1000000";
    }

    window.localStorage.score = "" + Math.min(parseInt(window.localStorage.score), this.state.recentScore)
  }

  render() {
    let result = <div> </div>
    console.log(this.state.correctCount, this.state.guessedCount)
    if (this.state.correctCount != 10000) {
      if (this.state.correctCount === this.state.guessedCount) {
        result = <div>Congratulations! Score: {this.state.recentScore} </div>
      } else {
        result = <div> Sorry, incorrect count! ({this.state.correctCount})</div>
      }
    }
    let toDisplay = <div> </div>
    if (this.state.playState == STATE_DONE) {
      toDisplay = <PlayDialog play={this.start} setOptions={this.setOptions} cardsToDisplayDefault={this.state.cardsToDisplay} roundsDefault={this.state.rounds} score={this.state.correctCount === this.state.guessedCount ? this.state.recentScore : 0}>
        {result}        
      </PlayDialog>
    } else if (this.state.playState == STATE_PLAY) {
      toDisplay = <CardDisplayer totalSets={this.state.rounds} cardsToDisplay={this.state.cardsToDisplay} onFinish={this.done} />
    } else if (this.state.playState == STATE_CHECK) {
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
      open: false,
    }
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  componentDidMount() {
    console.log("mounted")
    fetch("/fake").then(data => data.json()).then((res) => {
      this.setState({
        leaders: res
      })
    })
  }

  handleOpen(e) {
    this.setState({open: true})
  }

  handleClose(e) {
    this.setState({open: false})
  }

  render() {return (
    <div>
    <Button onClick={this.handleOpen}>Leaderboard</Button>
    <Dialog open={this.state.open}>
    <ol>
    {console.log("leaders", this.state.leaders)}
    Your best score: {window.localStorage.score}
    {this.state.leaders && Object.entries(this.state.leaders).map(a => {return <li> a </li>})}
    </ol>
      <DialogActions>
        <Button onClick={this.handleClose} autoFocus>Done</Button>
      </DialogActions>
    </Dialog>
    </div>
  )}
}

class SettingsDialog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      open: false,
      cardsToDisplay: props.cardsToDisplayDefault,
      rounds: props.roundsDefault
    }
    this.handleSettings = this.handleSettings.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.save = this.save.bind(this)
    this.cancel = this.cancel.bind(this)
  }

  handleSettings(e) {
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
  }

  cancel(e) {
    this.setState({open: false})
  }

  handleOpen(e) {
    this.setState({open: true})
  }

  handleClose(e) {
    this.setState({open: false})
  }

  render() {return (
    <div>
    <Button onClick={this.handleOpen}>Settings</Button>
    <Dialog open={this.state.open}>
      Cards per screen: <TextField id="cardsToDisplay" onChange={this.handleSettings} value={this.state.cardsToDisplay}/>
      Rounds: <TextField id="rounds" onChange={this.handleSettings} value={this.state.rounds}/>
      <DialogActions>
        <Button onClick={this.cancel}>Cancel</Button>
        <Button onClick={this.save} autoFocus>Save</Button>
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
      </DialogContent>
      <DialogActions>
        <SettingsDialog {...this.props}/>
        <LeaderboardDialog />
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
    console.log("enter")
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
    <img className="card" src={getFileName(props.type.rank, props.type.suit)} ></img>
  )
}


function getFileName(rank, suit) {
  return cards[suit * 13 + rank];
  //(process.env.PUBLIC_URL + "/cardImages/" + rankLookup[rank] + "_of_" + suitLookup[suit] + ".png")
}

export default App;
