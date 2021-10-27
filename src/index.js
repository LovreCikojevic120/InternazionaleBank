import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Pdf from "react-to-pdf";

import mainpage from "./MainPage";
import page1 from "./Page1";
import registerpage from "./RegisterPage";

ReactDOM.render(<BrowserRouter>
  <Switch>
   <Route exact path="/" component={mainpage} />
   <Route path="/page1" component={page1} />
   <Route path="/registerpage" component={registerpage}/>
 </Switch>
 </BrowserRouter>, document.getElementById('root'));
