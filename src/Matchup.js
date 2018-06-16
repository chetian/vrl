import React, { Component } from 'react';
import ChallongeAPI from 'challonge-node';
import logo from './logo.svg';
import './App.css';
import DefaultLogo from './defaultTeamLogo.jpg';

export const apis = {
	tournaments: `tournaments`,
	tournament: 'vrltest01'
};

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			tournament: {},
			participants: [],
			matches: [],
			player1Color: '#d90a16',
			player2Color: '#0c31fa'
		};

		this.tournamentName = this.getParameterByName('tournament');

		this.API_KEY = this.getParameterByName('apiKey');

		this.getCurrentParticipants();
		setInterval(() => {
			this.refreshMatches();
		}, 12000);
	}

	getParameterByName(name, url) {
		if (!url) url = window.location.href;
		name = name.replace(/[\[\]]/g, '\\$&');
		var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return '';
		return decodeURIComponent(results[2].replace(/\+/g, ' '));
	}

	refreshMatches() {
		this.getMatchData();
	}

	getMatchData() {
		this.getMatches(apis.tournaments)
			.then(res => {
				if (res === [] || res === null) {
					return;
				}
				let matches = [];
				res.forEach(p => {
					matches.push(p.match);
				});
				this.setState({ matches: res });
			})
			.catch(err => {
				console.log(err);
			});
	}

	getCurrentParticipants() {
		this.getParticipants(apis.tournaments)
			.then(res => {
				let participants = [];
				res.forEach(p => {
					participants.push(p.participant);
				});
				this.setState({ participants: res });
			})
			.catch(err => {
				console.log(err);
			});
	}

	getCurrentTournament() {
		this.getTournaments(apis.tournaments).then(res => {
			// get the list of current tournaments and place the last(current) one in the state
			const numberOfTournaments = Object.keys(res).length - 1;
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
			method: 'GET'
		};
		const url = `https://cors-anywhere.herokuapp.com/https://api.challonge.com/v1/${api}.json?api_key=${
			this.API_KEY
		}`;
		return fetch(url, options)
			.then(response => response.json())
			.then(responseText => {
				let resp =
					typeof responseText === 'string'
						? JSON.parse(responseText)
						: responseText;
				return resp; //这个resp会被外部接收
			})
			.catch(err => {
				//console.log(err);
			});
	}

	getMatches(api) {
		const options = {
			method: 'GET'
		};
		const url = `https://cors-anywhere.herokuapp.com/https://api.challonge.com/v1/${api}/${
			this.tournamentName
		}/matches.json?api_key=${this.API_KEY}`;
		return fetch(url, options)
			.then(response => response.json())
			.then(responseText => {
				let resp =
					typeof responseText === 'string'
						? JSON.parse(responseText)
						: responseText;
				//console.log(resp);
				return resp; //这个resp会被外部接收
			})
			.catch(err => {
				//console.log(err);
			});
	}

	getParticipants(api, tournamentName) {
		const options = {
			method: 'GET'
		};
		const url = `https://cors-anywhere.herokuapp.com/https://api.challonge.com/v1/${api}/${
			this.tournamentName
		}/participants.json?api_key=${this.API_KEY}`;
		return new Promise((resolve, reject) => {
			fetch(url, options)
				.then(response => response.json())
				.then(responseText => {
					let resp =
						typeof responseText === 'string'
							? JSON.parse(responseText)
							: responseText;
					resolve(resp);
				})
				.catch(err => {
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
			width: '30px',
			verticalAlign: 'middle',
			padding: '0 5px 0 0'
		};
		const participants = this.state.participants.map(p => {
			return (
				<li key={p.participant.seed}>
					<img
						style={participantStyle}
						src={p.participant.attached_participatable_portrait_url}
					/>{' '}
					{p.participant.display_name} ({p.participant.id})
				</li>
			);
		});

		const completedMatches = this.state.matches.map(m => {
			const winnerId = m.match.winner_id;
			const winner = this.getPlayerName(winnerId);
			if (m.match.state === 'complete') {
				let round = m.match.round.toString();
				return (
					<li key={m.match.id}>
						Match: {m.match.identifier},{' '}
						{round.includes('-') ? 'L' : 'R'}
						{round.replace('-', '')}
						{m.match.winner_id ? `, Winner: ${winner}` : ``}
					</li>
				);
			}
		});

		const liveMatches = this.state.matches.map(c => {
			const getHeatTotal = (heat, currentHeat) => {
				const heats = heat.split(',');
				let teamOneScore = 0;
				let teamTwoScore = 0;
				heats.forEach(e => {
					const heatScores = e.split('-');
					teamOneScore = teamOneScore + parseInt(heatScores[0]);
					teamTwoScore = teamTwoScore + parseInt(heatScores[1]);
				});
				return [teamOneScore, teamTwoScore];
			};
			const getEachHeatScore = (heat, currentHeat) => {
				const heats = heat.split(',');
				let teamOneScore = [];
				let teamTwoScore = [];
				heats.forEach(e => {
					const heatScores = e.split('-');
					teamOneScore.push(heatScores[0]);
					teamTwoScore.push(heatScores[1]);
				});
				return [teamOneScore, teamTwoScore];
			};
			const getCurrentHeat = heat => {
				const heats = heat.split(',');
				let currentHeat = heats.length;
				if (currentHeat === 5) {
					currentHeat = 5;
				} else {
					currentHeat++;
				}
				return currentHeat;
			};
			const showRoundType = currentHeat => {
				switch (currentHeat) {
					case 1:
						return '3v3';
					case 2:
						return 'Relay';
					default:
						return '1v1';
				}
			};
			if (c.match.state === 'open' && c.match.underway_at !== null) {
				const playerIds = [c.match.player1_id, c.match.player2_id];
				const teamColor = {
					simubators: '#ec6b28',
					pyrodrone: '#de0106',
					ronin: '#a902ff',
					runninglate: '#09b5ff',
					velocity: '#fdcd2f',
					bando: '#bdbbbc',
					punchout: '#0c31fa',
					flow: '#20c724',
					orbit: '#1fb7fc',
					overcharge: '#fd8524',
					fc: '#d90a16',
					meltdown: '#ad26fb'
				};
				let teamOneColor,
					teamTwoColor,
					teamColors = [teamOneColor, teamTwoColor];
				playerIds.forEach((e, i) => {
					if (e === 74956420) {
						teamColors[i] = teamColor.velocity;
					}
					if (e === 74956500) {
						teamColors[i] = teamColor.bando;
					}
					if (e === 74956269) {
						teamColors[i] = teamColor.punchout;
					}
					if (e === 74956280) {
						teamColors[i] = teamColor.flow;
					}
					if (e === 74956496) {
						teamColors[i] = teamColor.orbit;
					}
					if (e === 74956417) {
						teamColors[i] = teamColor.overcharge;
					}
					if (e === 74956421) {
						teamColors[i] = teamColor.fc;
					}
					if (e === 74956419) {
						teamColors[i] = teamColor.meltdown;
					}
				});
				teamOneColor = teamColors[0] || this.state.player1Color;
				teamTwoColor = teamColors[1] || this.state.player2Color;
				let round = c.match.round.toString();
				let underway = c.match.underway_at;
				const scores = c.match.scores_csv;
				const heatTotals = getHeatTotal(scores, getCurrentHeat(scores));
				const heatScores = getEachHeatScore(
					scores,
					getCurrentHeat(scores)
				);
				const heatScore = {
					display: 'inline-block',
					width: '82px',
					height: '42px',
					margin: '-12px 10px',
					lineHeight: '37px',
					backgroundColor: '#ffffff'
				};
				const roundTypeContainer = {
					textAlign: 'center'
				};
				const roundType = {
					display: 'inline-block',
					width: '84px',
					height: '32px',
					margin: '0px 10px',
					lineHeight: '30px',
					color: '#ffffff',
					backgroundColor: '#292634'
				};
				const liveTeam = {
					width: '42px',
					verticalAlign: 'middle',
					padding: '0 10px 0px px'
				};
				const teamLogo = {
					width: '50px',
					verticalAlign: 'middle',
					padding: '0 10px 0px px'
				};
				const teamContainer = {
					height: '42px',
					width: '824px',
					margin: '0 auto',
					fontSize: '20px',
					textTransform: 'uppercase'
				};
				const matchContainer = {
					height: '50px',
					width: '684px',
					margin: '0 auto',
					backgroundColor: 'white',
					fontSize: '26px',
					textTransform: 'uppercase',
					textAlign: 'left'
				};
				const teamLeft = {
					textAlign: 'left',
					backgroundColor: '#ffffff',
					display: 'inline-block'
				};
				const teamRight = {
					textAlign: 'right',
					backgroundColor: '#ffffff',
					display: 'inline-block'
				};
				const teamLeftPanel = {
					width: '10px',
					height: '42px',
					display: 'inline-block',
					backgroundColor: teamOneColor,
					verticalAlign: 'middle'
				};
				const teamOnePanel = {
					width: '10px',
					height: '42px',
					display: 'inline-block',
					backgroundColor: teamOneColor,
					verticalAlign: 'middle'
				};
				const teamTwoPanel = {
					width: '10px',
					height: '42px',
					display: 'inline-block',
					backgroundColor: teamTwoColor,
					verticalAlign: 'middle'
				};
				const teamRightPanel = {
					width: '10px',
					height: '42px',
					display: 'inline-block',
					backgroundColor: teamTwoColor,
					verticalAlign: 'middle'
				};
				const teamOneHeatPanel = {
					width: '10px',
					height: '50px',
					display: 'inline-block',
					backgroundColor: teamOneColor,
					verticalAlign: 'middle'
				};
				const teamTwoHeatPanel = {
					width: '10px',
					height: '50px',
					display: 'inline-block',
					backgroundColor: teamTwoColor,
					verticalAlign: 'middle'
				};
				const alignLeft = {
					align: 'left'
				};
				const alignRight = {
					align: 'right'
				};
				const leftTeamScore = {
					width: '42px',
					height: '42px',
					backgroundColor: teamOneColor,
					display: 'inline-block',
					textAlign: 'center',
					color: 'white',
					verticalAlign: 'middle',
					lineHeight: '42px'
				};
				const rightTeamScore = {
					width: '42px',
					height: '42px',
					backgroundColor: teamTwoColor,
					display: 'inline-block',
					textAlign: 'center',
					color: 'white',
					verticalAlign: 'middle',
					lineHeight: '42px'
				};
				const leftPlayer = {
					textAlign: 'right',
					display: 'inline-block',
					marginRight: '10px'
				};
				const rightPlayer = {
					textAlign: 'left',
					display: 'inline-block',
					marginLeft: '10px'
				};
				const leftTeamHeat = {
					textAlign: 'left',
					display: 'inline-block',
					marginLeft: '10px'
				};
				const teamLeftInner = {
					textAlign: 'right',
					width: '350px',
					display: 'inline-block'
				};
				const teamLeftHeatInner = {
					textAlign: 'left',
					width: '400px',
					display: 'inline-block'
				};
				const teamRightInner = {
					textAlign: 'left',
					width: '350px',
					display: 'inline-block'
				};
				const matchHeatContainer = {
					width: '840px'
				};
				const heatBlock = {
					width: '50px',
					height: '50px',
					backgroundColor: '#e0e0e0',
					display: 'inline-block',
					textAlign: 'center',
					color: '#28272b',
					verticalAlign: 'middle',
					lineHeight: '50px'
				};
				const teamOneHeatBlock = {
					width: '50px',
					height: '50px',
					backgroundColor: teamOneColor,
					display: 'inline-block',
					textAlign: 'center',
					color: 'white',
					verticalAlign: 'middle',
					lineHeight: '50px'
				};
				const teamTwoHeatBlock = {
					width: '50px',
					height: '50px',
					backgroundColor: teamTwoColor,
					display: 'inline-block',
					textAlign: 'center',
					color: 'white',
					verticalAlign: 'middle',
					lineHeight: '50px'
				};
				return (
					<div>
						<div>
							<div style={teamContainer} key={c.match.id}>
								<div style={teamLeft}>
									<span style={teamLeftPanel}> </span>
									<div style={teamLeftInner}>
										<div style={leftPlayer}>
											{this.getPlayerName(
												c.match.player1_id
											)}
										</div>
										<img
											style={liveTeam}
											src={
												this.getPlayerLogo(
													c.match.player1_id
												) || DefaultLogo
											}
										/>
										<div style={leftTeamScore}>
											{heatTotals[0] || ''}
										</div>
									</div>
								</div>
								<div style={heatScore}>
									Heat {getCurrentHeat(scores)}
								</div>
								<div style={teamRight}>
									<div style={teamRightInner}>
										<div style={rightTeamScore}>
											{heatTotals[1] || ''}
										</div>
										<img
											style={liveTeam}
											src={
												this.getPlayerLogo(
													c.match.player2_id
												) || DefaultLogo
											}
										/>
										<div style={rightPlayer}>
											{this.getPlayerName(
												c.match.player2_id
											)}
										</div>
									</div>
									<span style={teamRightPanel}> </span>
								</div>
							</div>
						</div>
						<div style={roundTypeContainer}>
							<div style={roundType}>
								{showRoundType(getCurrentHeat(scores))}
							</div>
						</div>
					</div>
				);
			}
		});

		const upcomingMatches = this.state.matches.map(u => {
			if (
				u.match.state === 'pending' ||
				(u.match.state === 'open' && u.match.underway_at === null)
			) {
				let round = u.match.round.toString();
				return (
					<li key={u.match.id}>
						Match: {u.match.identifier},{' '}
						{round.includes('-') ? 'L' : 'R'}
						{round.replace('-', '')}{' '}
						{u.match.winner_id
							? ` Winner: ${u.match.winner_id}`
							: ``}
					</li>
				);
			}
		});

		return <div className="App">{liveMatches}</div>;
	}
}

export default App;
