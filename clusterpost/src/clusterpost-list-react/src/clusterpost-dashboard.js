import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import ClusterpostService from './clusterpost-service';
import _ from 'underscore';

import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import {Download} from 'react-feather';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

class ClusterpostDashboard extends Component {

  constructor(props) {
    super(props);

    this.state = {
      jobCount: [{}],
      colors: {'CREATE': this.getStyle('.text-primary', 'color'),
        'QUEUE': 'rgb(184, 221, 19)',
        'DOWNLOADING': 'rgb(255, 165, 0)',
        'RUN': this.getStyle('.text-info', 'color'),
        'FAIL': this.getStyle('.text-danger', 'color'),
        'KILL': 'rgb(193, 19, 100)',
        'UPLOADING': 'rgb(19, 193, 85)',
        'EXIT': this.getStyle('.text-warning', 'color'),
        'DONE': this.getStyle('.text-success', 'color'),
        'DELETE': 'rgb(196, 15, 15)'
      }
    };

  }

  componentDidMount(){
    this.setState({...this.state});
    this.clusterpost = new ClusterpostService();
    this.clusterpost.setHttp(this.props.http);

    const self = this;

    this.getJobCount()
    .then(function(){
      self.startTimer();
    })
  }

  startTimer(){
    var self = this;
    setTimeout(function(){
      self.getJobCount()
      .then(function(){
        self.startTimer()  
      });
    }, 10000);
  }

  getJobCount(){
    const self = this;

    return this.clusterpost.getJobCount()
    .then(function(res){
      self.setState({...self.state, jobCount: _.map(res.data, (jc)=>{return {[jc.key]: jc.value}})});
    });
    
    // this.clusterpost.getUserJobs()
    // .then(function(res){
    //   return _.reduce(jobs, function(memo, job){
    //     if(!memo[job.jobstatus.status]){
    //       memo[job.jobstatus.status] = 0;
    //     }
    //     memo[job.jobstatus.status] += 1;
    //     return memo;
    //   }, {});
    // })
    // .then(function(res){
    //   self.setState({...self.state, jobCount: res});
    // });
  }

  getStyle(selector, style){
    for (var i = 0; i < document.styleSheets.length; i++){
      var mysheet = document.styleSheets[i];
      var myrules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;

      for (var j = 0; j < myrules.length; j++){
        if (myrules[j].selectorText && myrules[j].selectorText.toLowerCase() === selector){
          return myrules[j].style[style];
        }
      }
    }
  }

  drawBarChart(){
    
    const {colors, jobCount} = this.state;

    var data = jobCount;

    return (<ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
         <CartesianGrid strokeDasharray="3 3"/>
         <XAxis dataKey="name"/>
         <YAxis/>
         <Tooltip/>
         <Legend />
         <Bar dataKey="CREATE" fill={colors["CREATE"]} />
         <Bar dataKey="QUEUE" fill={colors["QUEUE"]} />
         <Bar dataKey="DOWNLOADING" fill={colors["DOWNLOADING"]} />
         <Bar dataKey="RUN" fill={colors["RUN"]} />
         <Bar dataKey="FAIL" fill={colors["FAIL"]} />
         <Bar dataKey="KILL" fill={colors["KILL"]} />
         <Bar dataKey="EXIT" fill={colors["EXIT"]} />
         <Bar dataKey="UPLOADING" fill={colors["UPLOADING"]} />
         <Bar dataKey="DONE" fill={colors["DONE"]} />
         <Bar dataKey="DELETE" fill={colors["DELETE"]} />
        </BarChart>
      </ResponsiveContainer>);
  }

  render() {
    const {data} = this.state;
    const self = this;

    return (
        <div class="col">
          <div class="card">
            <h5 class="card-title alert alert-info">Running tasks</h5>
            <div id="clusterpost-bar" class="card-body bg-light" ref={(container)=>{this.container = container}}>
              {this.drawBarChart()}
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

export default withRouter(connect(mapStateToProps)(ClusterpostDashboard));