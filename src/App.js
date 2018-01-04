import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import AppBar from 'material-ui/AppBar'
import keydown from 'react-keydown';


const rankLookup = ["2","3","4","5","6","7","8","9","10","jack","queen","king","ace"]
const suitLookup = ["clubs","hearts","diamonds","spades"]

class App extends Component {
  render() {
    return (
      <div>
          <AppBar> Counting Cards </AppBar>
        <CardSet cards={[{"suit": 2, "rank": 4}, {"suit": 1, "rank": 8}]} cardsToDisplay={5}> </CardSet>
      </div>
    );
  }
}

class CardController extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      count : 0,
      currentCards: []
    }
    this.nextSet = this.nextSet.bind(this)
    this.getCountDelta = this.getCountDelta.bind(this)
  }

  getCountDelta(cardSet) {
    return cardSet.reduce((prev, current) => {
      return prev + (current[0] <= 4 ? 1 : 0) + (current[0] >= 8 ? -1 : 0)
    })
  }

  @keydown("enter")
  nextSet(event) {
    let next = [];
    for (let i = 0; i < this.props.cardsToDisplay; i++) {
      next.push([Math.random() * 13, Math.random() * 4])
    }
    this.setState((prevState) => {
      return ({
        count: prevState.count + this.getCountDelta(next),
        currentCards: next
      })
    })
  }

  render() {
    return (<div>
      <CardSet cards={this.state.currentCards}> </CardSet>
      {this.state.count}
    </div>)
  }


  render() {
    return <CardSet> </CardSet>
  }
}

function CardSet(props) {
  let output = props.cards.map((item) => {
    return (
    <li key={getFileName(item.rank, item.suit)}> {<Card type={item}> </Card>} </li>
    )
  })
  return (
    <ul class="card-set"> {output} </ul>
  )
}

function Card(props) {
  return (
    <img class="card" src={getFileName(props.type.rank, props.type.suit)} ></img>
  )
}


function getFileName(rank, suit) {
  return (process.env.PUBLIC_URL + "/cardImages/" + rankLookup[rank] + "_of_" + suitLookup[suit] + ".png")
}

export default App;
