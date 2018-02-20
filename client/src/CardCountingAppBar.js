import React from 'react';
import AppBar from 'material-ui/AppBar'
import {withStyles} from 'material-ui/styles'
import IconButton from 'material-ui/IconButton'
import MenuIcon from 'material-ui-icons/Menu'

const styles = {
    root: {
        padding: '15px',
        'font-size': '25px',
        display: 'flex',
        'align-content': 'center',
    },
    menu: {
        margin: '2px 10px 0px 10px'
    },
    title: {
        'flex': 4
    },
    verticalCenterer: {
        'display': 'flex',
        'justify-content': 'space-between',
        'flex-flow': 'row nowrap',
    }
}

function CardCountingAppBar(props) {
    return (
        <div>
            <AppBar className={props.classes.root}>
            <div className={props.classes.verticalCenterer}>
                <MenuIcon className={props.classes.menu} />
                <div className={props.classes.title} >Counting Cards</div>
                {props.children}
            </div>
            </AppBar>
        </div>
    )
}

export default withStyles(styles)(CardCountingAppBar);