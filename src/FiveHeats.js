import React, { Component } from 'react';
import ChallongeAPI from 'challonge-node';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import DefaultLogo from './defaultTeamLogo.jpg';

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
            matches: [],
            player1Color: "#777777",
            player2Color: "#555555",
            colorsUpdated: false
        }
        this.tournamentName = this.getParameterByName("tournament");

        const API_KEY = this.getParameterByName("apiKey");
        const challonge = ChallongeAPI.withAPIKey(API_KEY);

        setInterval(()=> {
            this.init();
        }, 10000);

        // this.updateData(apis.tournaments, {tournamentName: "vrltest01", description: "new desc"}).then(payload => {
        //     debugger;
        //     console.log("success:", payload);
        // });
    }


    init(){
        this.getCurrentTournament();
        this.getCurrentParticipants();
        this.getMatchData();
    }

    getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    getMatchData() {
        this.getMatches(apis.tournaments).then(res => {
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
            let participants = [];
            res.forEach(p => {
                participants.push(p.participant);
            });
            this.setState({participants: res});
        }).catch(err => {
            console.log(err);
        });
    }


    getCurrentTournament() {
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
                        resolve(resp);
                    }).catch(err=>{
                        console.log(JSON.stringify(err));
                        reject(err);
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
            const getHeatTotal = (heat, currentHeat) => {
                const heats = heat.split(',');
                let teamOneScore = 0;
                let teamTwoScore = 0;
                heats.forEach(e => {
                    const heatScores = e.split("-");
                    teamOneScore = teamOneScore + parseInt(heatScores[0]);
                    teamTwoScore = teamTwoScore + parseInt(heatScores[1]);
                });
                return [teamOneScore, teamTwoScore];
            }
            const getEachHeatScore = (heat, currentHeat) => {
                const heats = heat.split(',');
                let teamOneScore = [];
                let teamTwoScore = [];
                heats.forEach(e => {
                    const heatScores = e.split("-");
                    teamOneScore.push(heatScores[0]);
                    teamTwoScore.push(heatScores[1]);
                });
                return [teamOneScore, teamTwoScore];
            }
            const getCurrentHeat = (heat) => {
                const heats = heat.split(',');
                let currentHeat = heats.length;
                if (currentHeat === 5) {
                    currentHeat = 5;
                } else {
                    currentHeat++
                }
                return currentHeat;
            }

            if (c.match.state === "open" && c.match.underway_at !== null) {
                const playerIds = [c.match.player1_id, c.match.player2_id];
                const teamColor = {
                    simubators: "#ec6b28",
                    pyrodrone: "#de0106",
                    ronin: "#a902ff",
                    runninglate: "#09b5ff"
                }
                let teamOneColor, teamTwoColor, teamColors = [teamOneColor, teamTwoColor];
                playerIds.forEach((e, i) => {
                    if (e === 74214257) {
                        teamColors[i] = teamColor.simubators
                    }
                    if (e === 74567241) {
                        teamColors[i] = teamColor.pyrodrone
                    }
                    if (e === 74567254) {
                        teamColors[i] = teamColor.ronin
                    }
                    if (e === 74567256) {
                        teamColors[i] = teamColor.runninglate
                    }
                });
                teamOneColor = teamColors[0] || this.state.player1Color;
                teamTwoColor = teamColors[1] || this.state.player2Color;
                let round = c.match.round.toString();
                let underway = c.match.underway_at;
                const scores = c.match.scores_csv;
                const heatTotals = getHeatTotal(scores, getCurrentHeat(scores));
                const heatScores = getEachHeatScore(scores, getCurrentHeat(scores));
                const heatScore = {
                    display: "inline-block",
                    width: "82px"
                }
                const liveTeam = {
                    width: "42px",
                    verticalAlign: "middle",
                    padding: "0 10px 0px px"
                }
                const teamLogo = {
                    width: "50px",
                    verticalAlign: "middle",
                    padding: "0 10px 0px px"
                }
                const teamContainer = {
                    height: "42px",
                    width: "684px",
                    margin: "0 auto",
                    backgroundColor: "white",
                    fontSize: "20px",
                    textTransform: "uppercase"
                }
                const matchContainer = {
                    height: "50px",
                    width: "680px",
                    margin: "0 auto",
                    backgroundColor: "white",
                    fontSize: "26px",
                    textTransform: "uppercase",
                    textAlign: "left"
                }
                const teamLeft = {
                    width: "300px",
                    textAlign: "left",
                    display: "inline-block"
                }
                const teamRight = {
                    width: "300px",
                    textAlign: "right",
                    display: "inline-block"
                }
                const teamLeftPanel = {
                    width: "10px",
                    height: "42px",
                    display: "inline-block",
                    backgroundColor: teamOneColor,
                    verticalAlign: "middle"
                }
                const teamOnePanel = {
                    width: "10px",
                    height: "42px",
                    display: "inline-block",
                    backgroundColor: teamOneColor,
                    verticalAlign: "middle"
                }
                const teamTwoPanel = {
                    width: "10px",
                    height: "42px",
                    display: "inline-block",
                    backgroundColor: teamTwoColor,
                    verticalAlign: "middle"
                }
                const teamRightPanel = {
                    width: "10px",
                    height: "42px",
                    display: "inline-block",
                    backgroundColor: teamTwoColor,
                    verticalAlign: "middle"
                }
                const teamOneHeatPanel = {
                    width: "10px",
                    height: "50px",
                    display: "inline-block",
                    backgroundColor: teamOneColor,
                    verticalAlign: "middle"
                }
                const teamTwoHeatPanel = {
                    width: "10px",
                    height: "50px",
                    display: "inline-block",
                    backgroundColor: teamTwoColor,
                    verticalAlign: "middle"
                }
                const alignLeft = {
                    align: "left"
                }
                const alignRight = {
                    align: "right"
                }
                const leftTeamScore = {
                    width: "42px",
                    height: "42px",
                    backgroundColor: teamOneColor,
                    display: "inline-block",
                    textAlign: "center",
                    color: "white",
                    verticalAlign: "middle",
                    lineHeight: "42px"
                }
                const rightTeamScore = {
                    width: "42px",
                    height: "42px",
                    backgroundColor: teamTwoColor,
                    display: "inline-block",
                    textAlign: "center",
                    color: "white",
                    verticalAlign: "middle",
                    lineHeight: "42px"
                }
                const leftPlayer = {
                    textAlign: "right",
                    display: "inline-block",
                    marginRight: "10px"
                }
                const rightPlayer = {
                    textAlign: "left",
                    display: "inline-block"
                }
                const leftTeamHeat = {
                    textAlign: "left",
                    display: "inline-block",
                    marginLeft: "10px"
                }
                const teamLeftInner = {
                    textAlign: "right",
                    width: "280px",
                    display: "inline-block"
                }
                const teamLeftHeatInner = {
                    textAlign: "left",
                    width: "370px",
                    display: "inline-block"
                }
                const teamRightInner = {
                    textAlign: "left",
                    width: "280px",
                    display: "inline-block"
                }
                const matchHeatContainer = {
                    width: "680",
                    backgroundColor: "#ffffff"
                }
                const matchHeatContainerTwo = {
                    width: "680",
                    backgroundColor: "#f4f2f3"
                }
                const heatBlock = {
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#e0e0e0",
                    display: "inline-block",
                    textAlign: "center",
                    color: "#28272b",
                    verticalAlign: "middle",
                    lineHeight: "50px"
                }
                const teamOneHeatBlock = {
                    width: "50px",
                    height: "50px",
                    backgroundColor: teamOneColor,
                    display: "inline-block",
                    textAlign: "center",
                    color: "white",
                    verticalAlign: "middle",
                    lineHeight: "50px"
                }
                const teamTwoHeatBlock = {
                    width: "50px",
                    height: "50px",
                    backgroundColor: teamTwoColor,
                    display: "inline-block",
                    textAlign: "center",
                    color: "white",
                    verticalAlign: "middle",
                    lineHeight: "50px"
                }
                const heatTopBannerContainer = {
                    textAlign: "right",
                    verticalAlign: "middle",
                    display: "inline-block",
                    width: "680px"
                }
                const heatTopBanner = {
                    backgroundColor: "#292534",
                    fontSize: "13px",
                    width: "310px",
                    height: "26px",
                    lineHeight: "25px",
                    color: "#ffffff",
                    verticalAlign: "middle",
                    display: "inline-block",
                    marginRight: "50px"
                }
                const heatTopBannerValue = {
                    width: "50px",
                    verticalAlign: "middle",
                    display: "inline-block",
                    textAlign: "center"
                }
                return (
                    <div>
                        <div>
                            <div style={heatTopBannerContainer}>
                                <div style={heatTopBanner}>
                                    <div style={heatTopBannerValue}>HEAT</div>
                                    <div style={heatTopBannerValue}>1</div>
                                    <div style={heatTopBannerValue}>2</div>
                                    <div style={heatTopBannerValue}>3</div>
                                    <div style={heatTopBannerValue}>4</div>
                                    <div style={heatTopBannerValue}>5</div>
                                </div>
                            </div>
                            <div style={matchContainer} key={c.match.id}>
                                <div className="teamOneHeatPanel" style={matchHeatContainer}>
                                    <span  style={teamOneHeatPanel}>{" "}</span>
                                    <div style={teamLeftHeatInner}>
                                        <img style={teamLogo} src={this.getPlayerLogo(c.match.player1_id) || DefaultLogo} />
                                        <div style={leftTeamHeat}>{this.getPlayerName(c.match.player1_id) }</div>
                                    </div>
                                    <div className="teamOneScoreContainer">
                                        <div className="heatScore">{heatScores[0][0] || ""}</div>
                                        <div className="heatScore">{heatScores[0][1] || ""}</div>
                                        <div className="heatScore">{heatScores[0][2] || ""}</div>
                                        <div className="heatScore">{heatScores[0][3] || ""}</div>
                                        <div className="heatScore">{heatScores[0][4] || ""}</div>
                                        <div style={teamOneHeatBlock}>{heatTotals[0] || ""}</div>
                                    </div>
                                </div>
                                <div className="teamTwoHeatPanel"  style={matchHeatContainerTwo}>
                                    <span style={teamTwoHeatPanel}>{" "}</span>
                                        <div style={teamLeftHeatInner}>
                                            <img style={teamLogo} src={this.getPlayerLogo(c.match.player2_id) || DefaultLogo} />
                                            <div style={leftTeamHeat}>{this.getPlayerName(c.match.player2_id)}</div>
                                        </div>
                                        <div className="teamTwoScoreContainer">
                                            <div className="heatScore">{heatScores[1][0] || ""}</div>
                                            <div className="heatScore">{heatScores[1][1] || ""}</div>
                                            <div className="heatScore">{heatScores[1][2] || ""}</div>
                                            <div className="heatScore">{heatScores[1][3] || ""}</div>
                                            <div className="heatScore">{heatScores[1][4] || ""}</div>
                                            <div style={teamTwoHeatBlock}>{heatTotals[1] || ""}</div>
                                        </div>
                                </div>
                            </div>
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
                {liveMatches}
            </div>
        );
    }
}

export default App;
