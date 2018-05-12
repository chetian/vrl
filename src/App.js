import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import Matchup from "./Matchup";
import ThreeHeats from "./ThreeHeats";
import FiveHeats from "./FiveHeats";

const Page = () => (
  <Router>
    <div>
      <Route exact path="/" component={Home} />
      <Route path="/threeHeats" component={ThreeHeats} />
      <Route path="/fiveHeats" component={FiveHeats} />
      <Route path="/matchup" component={Matchup} />
    </div>
  </Router>
);

const Home = () => (
  <div>
    use /header or /heats
  </div>
);

export default Page;
