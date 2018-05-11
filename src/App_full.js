import React, { Component } from 'react';
import ChallongeAPI from 'challonge-node';
import logo from './logo.svg';
import './App.css';

export const apis = {
    tournaments: `tournaments`,
    tournament: "vrltest01"
};

class App extends Component {
    
    constructor(props) {
        super(props);
        
        this.state = {
            tournament: {},
            participants: [],
            matches: []
        }
        this.tournamentName = "OBS_Test";
        
        const API_KEY = "uszU4emqNBWI2PGszGWxvKjMFTU8QwSqMfef5zrf";
        const challonge = ChallongeAPI.withAPIKey(API_KEY);
        
        this.init();
        
        // this.updateData(apis.tournaments, {tournamentName: "vrltest01", description: "new desc"}).then(payload => {
        //     debugger;
        //     console.log("success:", payload);
        // });
    }
    
    init(){
        this.getCurrentTournamentData();
        this.getCurrentParticipants();
        this.getMatchData();
    }
    
    getMatchData() {
        this.getMatches(apis.tournaments).then(res => {
            console.log("MATCHES: ", res);
            let matches = [];
            res.forEach(p => {
                matches.push(p.match);
            });
            this.setState({matches: res});
        }).catch(err => {
            console.log(err);
        });;
    }
    
    getCurrentParticipants() {
        this.getParticipants(apis.tournaments, this.tournamentName).then(res => {
            console.log("PARTICIPANTS: ", res);
            let participants = [];
            res.forEach(p => {
                participants.push(p.participant);
            });
            this.setState({participants: res});
            
        }).catch(err => {
            console.log(err);
        });
    }

    
    getCurrentTournamentData() {
        this.getTournaments(apis.tournaments).then(res => {
            // get the list of current tournaments and place the last(current) one in the state
            const numberOfTournaments = Object.keys(res).length -1;
            const currentTournament = res[numberOfTournaments].tournament;

            this.setState({
                tournament: {
                    name: currentTournament.name,
                    url: currentTournament.url,
                    tournament_type: currentTournament.tournament_type,
                    progress_meter: currentTournament.progress_meter,
                    full_challonge_url: currentTournament.full_challonge_url,
                    live_image_url: currentTournament.live_image_url,
                    game_name: currentTournament.game_name
                }
            });
        });
    }
    
    getTournaments(api) {
        const options = {
            method: "GET"
        };
        const url = `https://cors-anywhere.herokuapp.com/https://api.challonge.com/v1/${api}.json?api_key=hcrnzfvU5M8IMANeds27mfxOL7cjvcxjSgvYAgqs`;
        return fetch(url, options)
            .then(response=> response.json())
            .then(responseText=>{
                let resp = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
                //console.log(resp);
                return resp; //这个resp会被外部接收
            }).catch(err=>{
            //console.log(err);
        });
    }
    
    getMatches(api) {
        const options = {
            method: "GET"
        };
        const url = `https://cors-anywhere.herokuapp.com/https://api.challonge.com/v1/${api}/${this.tournamentName}/matches.json?api_key=hcrnzfvU5M8IMANeds27mfxOL7cjvcxjSgvYAgqs`;
        return fetch(url, options)
            .then(response=> response.json())
            .then(responseText=>{
                console.log("responseText!", responseText);
                let resp = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
                //console.log(resp);
                return resp; //这个resp会被外部接收
            }).catch(err=>{
            //console.log(err);
        });
    }
    
    getParticipants(api, tournamentName) {
        const options = {
            method: "GET"
        };
        const url = `https://cors-anywhere.herokuapp.com/https://api.challonge.com/v1/${api}/${tournamentName}/participants.json?api_key=uszU4emqNBWI2PGszGWxvKjMFTU8QwSqMfef5zrf`;
            return new Promise((resolve, reject) => {
                fetch(url, options)
                    .then(response=> response.json())
                    .then(responseText=>{
                        let resp = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
                        console.log("participants: ", resp);
                        resolve(resp);
                    }).catch(err=>{
                        console.log(JSON.stringify(err));
                        reject(err);
                });
            });
    }
    
    updateData(api, data) {
        const options = {
            body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, same-origin, *omit
            headers: {
              'user-agent': 'Mozilla/4.0 MDN Example',
              'content-type': 'application/json'
            },
            method: 'PUT', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, cors, *same-origin
            redirect: 'follow', // manual, *follow, error
            referrer: 'no-referrer', // *client, no-referrer
          };
        const url = `https://cors-anywhere.herokuapp.com/https://api.challonge.com/v1/${api}/${data.tournamentName}.json?api_key=uszU4emqNBWI2PGszGWxvKjMFTU8QwSqMfef5zrf`;
        return new Promise((resolve, reject) => { 
            fetch(url, options)
                .then(response=> response.json())
                .then(responseText=>{
                    let resp = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
                    return resp;
                }).catch(err=>{
                //console.log(err);
            });
        });
    }   
    
    getPlayerName(id) {
        let playerName = id;
        this.state.participants.forEach(e => {
            if (e.participant.id === id) {
                playerName = e.participant.display_name;
            }
        });
        return playerName;
    }
    
    getPlayerLogo(id) {
        let playerName = id;
        this.state.participants.forEach(e => {
            if (e.participant.id === id) {
                playerName = e.participant.attached_participatable_portrait_url;
            }
        });
        return playerName;
    }

    render() {
        const participantStyle = {
            width: "30px",
            verticalAlign: "middle",
            padding: "0 5px 0 0"
        }
        const participants = this.state.participants.map(p => {
            return (
                <li key={p.participant.seed}><img style={participantStyle} src={p.participant.attached_participatable_portrait_url}/> {p.participant.display_name} ({p.participant.id})</li>
            );
        });
        
        const completedMatches = this.state.matches.map(m => {
            const winnerId = m.match.winner_id;
            const winner = this.getPlayerName(winnerId);
            if (m.match.state === "complete") {
                let round = m.match.round.toString();
                return (
                    <li key={m.match.id}>
                        Match: {m.match.identifier},{" "}
                        {round.includes("-") ? "L" : "R"}{round.replace("-", "")}{m.match.winner_id ? 
                            `, Winner: ${winner}` : ``}</li>
                );
            }
        });
        
        const liveMatches = this.state.matches.map(c => {
            const liveTeam = {
                width: "30px",
                verticalAlign: "middle",
                padding: "0 5px 0 0"
            }
            const teamContainer = {
                height: "42px",
                width: "800px",
                margin: "0 auto"
            }
            const teamLeft = {
                width: "385px",
                textAlign: "right",
                display: "inline-block"
            }
            const teamRight = {
                width: "385px",
                textAlign: "left",
                display: "inline-block"
            }
            const teamLeftPanel = {
                width: "10px",
                height: "42px",
                display: "inline-block",
                backgroundColor: "#ec6b28",
                verticalAlign: "middle"
            }
            const teamRightPanel = {
                width: "10px",
                height: "42px",
                display: "inline-block",
                backgroundColor: "#3bda30",
                verticalAlign: "middle"
            }
            const alignLeft = {
                align: "left"
            }
            const alignRight = {
                align: "right"
            }
            if (c.match.state === "open" && c.match.underway_at !== null) {
                let round = c.match.round.toString();
                let underway = c.match.underway_at;
                return (
                    <div style={teamContainer} key={c.match.id}>
                        <div>
                            Match: {c.match.identifier},{" "}
                            {round.includes("-") ? "L" : "R"}{round.replace("-", "")} {c.match.winner_id ? 
                                `, Winner: ${c.match.winner_id}` : ``}
                        </div>
                        <div style={teamLeft}>
                            <span style={teamLeftPanel}>{" "}</span> <img style={liveTeam} src={this.getPlayerLogo(c.match.player1_id)} /> {this.getPlayerName(c.match.player1_id)}
                        </div>
                        <div style={teamRight}>
                            <img style={participantStyle} src={this.getPlayerLogo(c.match.player2_id)} /> {this.getPlayerName(c.match.player2_id)} <span style={teamRightPanel}>{" "}</span>
                        </div>
                    </div>
                );
            }
        });
        
        const upcomingMatches = this.state.matches.map(u => {
            if (u.match.state === "pending" || (u.match.state === "open" && u.match.underway_at === null)) {
                let round = u.match.round.toString();
                return (
                    <li key={u.match.id}>
                        Match: {u.match.identifier},{" "}
                        {round.includes("-") ? "L" : "R"}{round.replace("-", "")} {u.match.winner_id ? 
                            ` Winner: ${u.match.winner_id}` : ``}</li>
                );
            }
        });
        
        return (
            <div className="App">
                <h2>Tournament: {this.state.tournament.name}</h2>
                <div>
                    <ul>
                        <li>url: {this.state.tournament.url}</li>
                        <li>tournament-type: {this.state.tournament.tournament_type}</li>
                        <li>progress-meter: {this.state.tournament.progress_meter}</li>
                        <li>full challonge url: {this.state.tournament.full_challonge_url}</li>
                        <li>live-image-url: {this.state.tournament.live_image_url}</li>
                        <li>game name: {this.state.tournament.game_name}</li>
                    </ul>
                </div>
                <div>
                    <img src={this.state.tournament.live_image_url}/>
                </div>
                <h2>Tournament: {this.state.tournament.name}</h2>
                <div>
                    <h2>Participants</h2>
                </div>
                <ul>
                    {participants}
                </ul>
                <div>
                    <h2>
                        Completed matches
                    </h2>
                    {completedMatches}
                </div>
                <div>
                    <h2>
                        Live match
                    </h2>
                    {liveMatches}
                </div>
                <div>
                    <h2>
                        Upcoming matches
                    </h2>
                    {upcomingMatches}
                </div>
            </div>
        );
    }
}

export default App;
