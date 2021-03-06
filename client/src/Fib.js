import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndices: [],
        values: {},
        index: ''
    };

    componentDidMount() {
        this.fetchValues();
        this.fetchIndices();
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({ values: values.data });
    }

    async fetchIndices() {
        const seenIndices = await axios.get('/api/values/all');
        
        // Remove duplicates we get back from the server
        if (Array.isArray(seenIndices.data)) {
            let seenIdx = seenIndices.data.slice(0);
            seenIdx.sort(function(a, b) {return a.number - b.number});
            let newArray = [];
            let len = seenIdx.length;
            for (let i = 0; i < len; i++) {
                if (i === 0) {
                    newArray.push(seenIdx[i]);
                } else {
                    if (seenIdx[i-1].number !== seenIdx[i].number) {
                        newArray.push(seenIdx[i])
                    }
                }
            }
            
            this.setState({
                seenIndices: newArray
            });
        } else {
            this.setState({
                seenIndices: seenIndices
            })
        }
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        const calcIndex = this.state.index;

        // This getting cached results.
        const result = await axios.get('/api/values/' + calcIndex);
        
        // If it's not calc'd already, got send it to the server to calc
        if (!result.data) {
            await axios.post('/api/values', {
                index: this.state.index
            });
    
            this.setState({index: ''});
    
            // TBD: This should also set a refresh timer.
            this.setState({calculatingIndex: calcIndex});
        }
        
        
    };

    renderSeenIndices() {
        if (this.state.calculatingIndex) {
            return <h4>Calculating {this.state.calculatingIndex}...Refresh page to see results</h4>
        } else {
            return <div id="fibcalc-indices">
                <h4>{this.state.seenIndices.map(({ number }) => number).join(', ')}</h4>
            </div>
        }
    }

    renderValues() {
        const entries = [];

        for (let key in this.state.values) {
            entries.push(
                <div key={key}>
                    For index {key} I Calculated {this.state.values[key]}
                </div>
            );
        }
        
        return entries;
    }

    render() {
        return(
            <div>
                <form onSubmit={this.handleSubmit}>
                    <label>Enter your index:</label>
                    <input 
                        value={this.state.index}
                        onChange={event => this.setState({ index: event.target.value })}
                    />
                    <button>Submit</button>
                </form>
                <h3>Indices I have seen:</h3>
                {this.renderSeenIndices()}
                <h3>Calculated values:</h3>
                {this.renderValues()}
            </div>
        )
    }



}

export default Fib;
