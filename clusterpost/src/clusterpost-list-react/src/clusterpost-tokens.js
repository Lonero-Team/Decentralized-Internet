import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import ClusterpostService from './clusterpost-service';

import _ from 'underscore';

import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import {Download} from 'react-feather';

class ClusterpostTokens extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tokens: {}
    };

  }

  componentDidMount(){

    const self = this;

    this.clusterpostService = new ClusterpostService();
    this.clusterpostService.setHttp(this.props.http);

    this.clusterpostService.getExecutionServerTokens()
    .then(function(res){
      self.setState({...self.state, tokens: res.data});
    })
  }

  downloadToken(token){
    var filename = "token.json";      
    var bb = new Blob([token], {type: 'text/plain'});

    var pom = document.createElement('a');

    document.body.appendChild(pom);

    pom.setAttribute('href', window.URL.createObjectURL(bb));
    pom.setAttribute('download', filename);

    pom.dataset.downloadurl = ['text/plain', pom.download, pom.href].join(':');
    pom.draggable = true; 
    pom.classList.add('dragout');

    pom.click();
  }

  getRows(){
    var self = this;
    const {tokens} = self.state;

    return _.map(tokens, function(token){
      return <tr ng-repeat="row in displayedTokens">
          <td>{token.executionserver}</td>
          <td><button type="button" class="btn btn-info" onClick={()=>{self.downloadToken(token)}}><Download/></button></td>
        </tr>
      });
  }

  render() {
    const self = this;
    return (
        <div class="col">
          <div class="card">
            <h5 class="card-title alert alert-info">Execution servers</h5>
            <div class="card-body">
              <table class="table table-striped table-bordered table-hover">
                <thead class="thead-dark">
                  <tr>
                    <th colspan="2"><input st-search="name" class="form-control" placeholder="Search ..." type="text"/></th>             
                  </tr>
                  <tr>
                    <th st-sort="name">Name</th>
                    <th>Token download</th>             
                  </tr>
                </thead>
                <tbody>
                  {self.getRows()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    http: state.jwtAuthReducer.http
  }
}

export default connect(mapStateToProps)(ClusterpostTokens);