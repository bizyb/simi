import React from 'react';
import { BrowserRouter, Switch, Route } from "react-router-dom";

import App from "../App";
import Privacy from "./Privacy";
import Dashboard from "./Dashboard";
import ToS from "./ToS";

const Router = () => (
  <BrowserRouter>
    <Switch>
      <Route path="/privacy" component={Privacy} exact/>
      <Route path="/tos" component={ToS} exact/>
      <Route path="/TepjFoNC1" component={Dashboard} exact/>
      <Route path="/" component={App} exact/>
    </Switch>
  </BrowserRouter>
);

export default Router;
