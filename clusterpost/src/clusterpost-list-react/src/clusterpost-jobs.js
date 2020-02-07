import React, { Component } from 'react'
import PropTypes from 'prop-types'

import ClusterpostService from './clusterpost-service';

import _ from 'underscore';
import { connect } from "react-redux";
import {JWTAuthService} from 'react-jwt-auth';
import { withRouter } from 'react-router-dom';
import {Eye, DownloadCloud, RefreshCw, Play, Delete, StopCircle, ArrowLeftCircle, ArrowRightCircle} from 'react-feather';
import qs from 'query-string';
import ReactJson from 'react-json-view'


class ClusterpostJobs extends Component {

  constructor(props){
    super(props);

    this.state = {
      selectedJob: {
        job: {}
      }, 
      edit: {
        show: false
      },
      showScopes: false,
      jobs: {
        data: [],
        filtered: []
      },
      numberOfJobs: 10,
      currentPage: 0,
      searchText: '',
      optionsDisplayedJobs: [10, 50, 100, 200]
    }

    this.scope = {};
    
  }

  componentDidMount(){
    this.jwtauth = new JWTAuthService();
    this.jwtauth.setHttp(this.props.http);

    var clusterauth = this.jwtauth;

    this.clusterpostService = new ClusterpostService();
    this.clusterpostService.setHttp(this.props.http);
    
    var self = this;
    return clusterauth.getUser()
    .then(function(res){
      self.scope.user = res;      
      return clusterauth.getScopes()
      .then(function(res){
        if(res.data && res.data[0]){
          self.scope.clusterScopes = _.filter(res.data[0].scopes, function(sc){
            return sc != 'default' && sc != 'admin' && sc != 'clusterpost';
          });
        }else{
          console.error("No scopes found!");
        }     
        
      });
    })
    .then(function(){
      return self.getDB();
    });
  }

  updateStatus(job){
    var self = this;
    return this.clusterpostService.getJobStatus(job._id).then(function(res){
      var index = _.findIndex(self.state.jobs.data, function(fjob){
        return job._id == fjob._id;
      });
      job.jobstatus = res.data;
      self.state.jobs.data[index] = job;
      self.setState({...self.state, jobs: self.state.jobs});

    })
    .catch(function(e){
      console.error(e);
      throw e;
    })
  }

  removeJobScope(job, sc){        
    if(job.scope){
      var index = job.scope.indexOf(sc);
      if(index != -1){
        job.scope.splice(index, 1);
        return this.saveJob(job);
      }
    }
  }

  addJobScope(job){       
    if(this.state.jobs.selectedScope){
      if(!job.scope){
        job.scope = [];
      }
      job.scope.push(this.state.selectedScope);
      job.scope = _.uniq(job.scope);
      return this.saveJob(job);
    }
  }

  addJobsScope(job){        
    _.each(this.state.jobs.filteredJobs, this.addJobScope);       
  }

  removeJobsScope(job){       
    var self = this;
    _.each(this.state.jobs.filteredJobs, function(job){
      self.removeJobScope(job, this.state.jobs.selectedScope)
    });
  }

  killJob(job){
    var self = this;
    this.clusterpostService.killJob(job._id).then(function(res){
       return self.updateStatus(job);
    })
    .catch(function(e){
      console.error(e);
      throw e;
    })
  }

  deleteJob(job){
    var self = this;
    var {jobs} = self.state;
    
    var index = _.findIndex(jobs.filtered, (fjob)=>{return job._id == fjob._id;});
    jobs.filtered.splice(index, 1);
    
    index = _.findIndex(jobs.data, (fjob)=>{return job._id == fjob._id;});
    jobs.data.splice(index, 1);

    return this.clusterpostService.deleteJob(job._id)
    .then(function(res){
      self.setState({...self.state, jobs: jobs});
    })
    .catch(function(e){
      console.error(e);
    });
  }

  runJob(job){
    var self = this;
    this.clusterpostService.submitJob(job._id).then(function(res){
      return self.updateStatus(job);
    })
    .catch(function(e){
        console.error(e);
    });
  }
  saveJob(job){
    return this.clusterpostService.updateJob(angular.copy(job))
    .then(function(res){
      if(res && res.data && res.data[0] && res.data[0].rev){
        job._rev = res.data[0].rev;
      }
    })
    .catch(function(e){
        console.error(e);
    });
  }

  getDB(){
      
    var getjobprom = {};

    var self = this;

    var {location} = self.props;

    if(this.scope.user.scope.indexOf('admin') !== -1){
      if(this.props.executable){
        if(_.isArray(this.props.executable)){
          getjobprom = Promise.all(_.map(this.props.executable, function(exe){
            return self.clusterpostService.getAllJobs(exe);
          }))
          .then(function(res){
            return {
              data: _.flatten(_.pluck(res, 'data'))
            };
          });
        }else{
          getjobprom = self.clusterpostService.getAllJobs();
        }
      }else{
        getjobprom = self.clusterpostService.getAllJobs();
      }
      
    }else{
      if(this.scope.executable){
        if(_.isArray(this.scope.executable)){
          getjobprom = Promise.all(_.map(this.scope.executable, function(exe){
            return self.clusterpostService.getUserJobs({"executable": exe});
          }))
          .then(function(res){
            return {
              data: _.flatten(_.pluck(res, 'data'))
            };
          });
        }else{
          getjobprom = self.clusterpostService.getUserJobs({"executable": this.scope.executable});
        }
      }else{
        getjobprom = self.clusterpostService.getUserJobs();
      }
      
    }

    return getjobprom
    .then(function(res){
      var jobs = {
        data: res.data, 
        filtered: res.data,
        status: _.uniq(_.pluck(_.pluck(res.data, 'jobstatus'), 'status')),
        executable: _.uniq(_.pluck(res.data, 'executable'))
      }
      self.setState(
        {...self.state, jobs: jobs}
      );
      if(location && location.search){
        const values = qs.parse(location.search);
        self.showJobDetail(_.find(res.data, (job)=>{return job._id == values.jobid}));
      }
    })
    .then(function(){
      return self.clusterpostService.getExecutionServers();
    })
    .then(function(res){
      self.state.executionservers = res.data;
    })
    .catch(function(e){
      console.error(e);
    });
  }

  showJobDetail(job){
    var self = this;
    
    Promise.all(_.map(["stdout.out", "stderr.err"], function(textstat){
      return self.clusterpostService.getAttachment(job._id, textstat, "text")
      .catch(function(){
        return "";
      });
    }))
    .then(function(res){
      var selectedJob = {};
      selectedJob.job = job;
      selectedJob.stdout = res[0].data;
      selectedJob.stderr = res[1].data;
      if(self.props.history){
        self.props.history.push({
          search: qs.stringify({jobid: job._id})
        });
      }
      self.setState({
        ...self.state,
        selectedJob: selectedJob
      });
    })
  }

  runAllJobs(){
    return Promise.all(_.map(jobs.filtered, (job)=>{return self.updateStatus(job);}))
    .catch(console.error);
  }

  updateAllJobs(){
    var {jobs} = this.state;
    var self = this;

    return Promise.all(_.map(jobs.filtered, (job)=>{return self.updateStatus(job);}))
    .catch(console.error);
    
  }

  deleteAllJobs(){
    if (confirm('Delete all tasks?')) {
      var {jobs} = this.state;
      var self = this;

      var tracker = function(next){
        return self.deleteJob(jobs.filtered[next])
        .then(function(){
          next++;
          if(next < jobs.filtered.length){
            return tracker(next);
          }
        });
      }
    
      return tracker(0);
    }
  }

  killAllJobs(){
    var {jobs} = this.state;
    var self = this;

    return Promise.all(_.map(jobs.filtered, (job)=>{return self.killJob(job);}))
    .catch(console.error);
  }

  saveJobEdit(){
    this.state.jobs.edit.showerror = false;     
    var self = this;
    try{
      var job = JSON.parse(this.state.jobs.edit.jobtext);
      clusterpostService.updateJob(job)
      .then(function(res){          
        self.state.jobs.edit.show = false;
        self.state.jobs.selectedJob.job = job;
        for(var i = 0; i < self.state.jobs.data.length; i++){
          if(job._id === self.state.jobs.data[i]._id){
            self.state.jobs.data[i] = job;
          }
        }
      })
      .catch(function(e){
        self.state.jobs.edit.error = e.message;
        self.state.jobs.edit.showerror = true;          
      })

    }catch(e){

      self.state.jobs.edit.error = e.message;
      self.state.jobs.edit.showerror = true;
    }
    
  }

  downloadJob(job){
    if(this.props.downloadCallback){
      return this.props.downloadCallback(job);
    }else{
      return this.clusterpostService.getJobDownload(job._id, 'blob')
      .then(function(response){

        var name = job._id + ".tar.gz";

        if(job.name){
          name = job.name + ".tar.gz";
        }

        var pom = document.createElement('a');
        pom.setAttribute('href', window.URL.createObjectURL(new Blob([response.data])));
        pom.setAttribute('download', name);

        pom.dataset.downloadurl = ['application/octet-stream', pom.download, pom.href].join(':');

        document.body.appendChild(pom);
        pom.click();
      });
    }
  }

  downloadAll(){
    var {jobs} = this.state;

    var self = this;
    var tracker = function(next){
      return self.downloadJob(jobs.filtered[next])
      .then(function(){
        next++;
        if(next < jobs.filtered.length){
          return tracker(next);
        }
      });
    }
    
    return tracker(0);
    
  }

  numberOfJobsChange(e){
    
    this.setState({
      ...this.state, numberOfJobs: Number(e.target.value)
    });

  }

  getObjectPropertiesFromStrings(obj, propertiesNames){
    return _.map(propertiesNames, function(property){
      return _.reduce(property.split("."), function(memo, num){ 
        return memo[num]; 
      }, obj);
    });
  }

  getFilteredPropertiesFromRegex(obj, propertiesNames, regexText){
    var properties = this.getObjectPropertiesFromStrings(obj, propertiesNames)
    return _.find(_.compact(properties), function(property){
      return String(property).match(regexText);
    });
  }

  getFilteredPropertiesFromString(obj, propertiesNames, searchText){
    var properties = this.getObjectPropertiesFromStrings(obj, propertiesNames)
    return _.find(_.compact(properties), function(property){
      return String(property) == searchText;
    });
  }

  setTextSearch(e){
    const {jobs} = this.state;
    var self = this;

    var searchText = e.target.value.trim();
    var regexText = searchText;
    var propertiesNames = ["name", "userEmail", "timestamp", "jobstatus.jobid", "jobstatus.status", "executable", "executionserver"];
    var exactProperties = ["_id"];

    jobs.filtered = _.filter(jobs.data, function(job){
      return self.getFilteredPropertiesFromRegex(job, propertiesNames, regexText) || self.getFilteredPropertiesFromString(job, exactProperties, searchText);
    });

    this.setState({
      ...this.state, jobs: jobs
    });
  }

  getGlobalSearchBar(){
    
    var self = this;
    var {optionsDisplayedJobs} = self.state;

    return (<tr>
              <th colspan="5"><input class="form-control" placeholder="Global search ..." type="text" onChange={self.setTextSearch.bind(self)}/></th>             
              <th colspan="3">Number of jobs per page 
                <select class="form-control" onChange={self.numberOfJobsChange.bind(self)}>
                  {
                    _.map(optionsDisplayedJobs, function(nop){
                      return <option value={nop}>{nop}</option>;
                    })
                  }
                </select>
              </th>
              <th>
                <button type="button" onClick={(e) => self.downloadAll()} class="btn btn-sm btn-primary">
                  <DownloadCloud/>
                </button>
              </th>
              <th>
                <button type="button" onClick={(e) => self.updateAllJobs()} class="btn btn-sm btn-info">
                  <RefreshCw/>
                </button>
              </th>
              <th>
                <button type="button" onClick={(e) => self.runAllJobs()} class="btn btn-sm btn-success">
                  <Play/>
                </button>
              </th>
              <th>
                <button type="button" onClick={(e) => self.killAllJobs()} class="btn btn-sm btn-warning">
                  <StopCircle/>
                </button>
              </th>
              <th>
                <button type="button" onClick={(e) => self.deleteAllJobs()} class="btn btn-sm btn-danger">
                  <Delete/>
                </button>
              </th>
            </tr>)
  }

  getHeader(){
    
    return (
      <thead class="thead-dark">
        {this.getGlobalSearchBar()}
        <tr>
          <th scope="col">Detail</th>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Timestamp</th>
          <th scope="col">Job status</th>
          <th scope="col">Executable</th>
          <th scope="col">Execution server</th>
          <th scope="col">Job id</th>
          <th scope="col">Download</th>
          <th scope="col">Update</th>
          <th scope="col">Run</th>
          <th scope="col">Kill</th>
          <th scope="col">Delete</th>
        </tr>
      </thead>
      );
  }
  getPageParams(){
    const {numberOfJobs, currentPage, jobs } = this.state;

    var jobsLength = jobs.filtered.length;

    var maxPages = Math.ceil(jobsLength/numberOfJobs);

    var start = numberOfJobs*currentPage;
    if(start > jobsLength){
      start = jobsLength - numberOfJobs;
      start = start < 0? 0: start;
    }

    var end = start + numberOfJobs;
    if(end > jobsLength){
      end = jobsLength;
    }

    var pageStart = currentPage - 3;
    pageStart = pageStart < 0? 0: pageStart;
    var deltaPage = currentPage - pageStart;
    var pageEnd = currentPage + (6 - deltaPage);
    pageEnd = pageEnd > maxPages? maxPages: pageEnd;
    pageStart -= (6 - (pageEnd - pageStart));
    pageStart = pageStart < 0? 0: pageStart;

    return {
      start, 
      end,
      currentPage,
      pageStart,
      pageEnd,
      maxPages
    }
  }

  getBody(){

    var self = this;
    var params = self.getPageParams();
    
    return _.map(_.range(params.start, params.end), function(index){
      var job = self.state.jobs.filtered[index];
        return (
        <tr>
          <td scope="row">
            <button type="button" onClick={(e) => self.showJobDetail(job)} class="btn btn-sm btn-info">
              <Eye/>
            </button>
          </td>
          <th>{job.name}</th>
          <th>{job.userEmail}</th>
          <th>{job.timestamp}</th>
          <th>{job.jobstatus.status}</th>
          <th>{job.executable}</th>
          <th>{job.executionserver}</th>
          <th>{job.jobstatus.jobid}</th>
          <td>
            <button type="button" onClick={(e) => self.downloadJob(job)} class="btn btn-sm btn-primary">
              <DownloadCloud/>
            </button>
          </td>
          <td>
            <button type="button" onClick={(e) => self.updateStatus(job)} class="btn btn-sm btn-info">
              <RefreshCw/>
            </button>
          </td>
          <td>
            <button type="button" onClick={(e) => self.runJob(job)} class="btn btn-sm btn-success">
              <Play/>
            </button>
          </td>
          <td>
            <button type="button" onClick={(e) => self.killJob(job)} class="btn btn-sm btn-warning">
              <StopCircle/>
            </button>
          </td>
          <td>
            <button type="button" onClick={(e) => self.deleteJob(job)} class="btn btn-sm btn-danger">
              <Delete/>
            </button>
          </td>
        </tr>
      );
    });
  }

  setCurrentPage(pageNumber){
    var params = this.getPageParams();
    if(pageNumber < 0){
      pageNumber = 0;
    }
    if(pageNumber > params.maxPages){
      pageNumber = params.maxPages;
    }
    this.setState({...this.state, currentPage: pageNumber});
  }

  getPagination(){

    var {
      pageStart, 
      pageEnd,
      currentPage
    } = this.getPageParams();

    var self = this;

    return (
      <nav aria-label="Jobs navigation">
        <ul class="pagination pagination-lg justify-content-center">
          <li class="page-item"><a class="page-link" onClick={()=>{this.setCurrentPage(this.state.currentPage - 1)}}><ArrowLeftCircle/></a></li>
          {
            _.map(_.range(pageStart, pageEnd),function(index){
              return <li class="page-item"><a class="page-link" onClick={()=>{self.setCurrentPage(index)}}>{index+1}</a></li>;
            })
          }
          <li class="page-item"><a class="page-link" onClick={()=>{this.setCurrentPage(this.state.currentPage + 1)}}><ArrowRightCircle/></a></li>
        </ul>
      </nav>);
  }

  getTable(){
    return (
      <div class="col">
        <div class="card">
          <h5 class="card-title alert alert-info">Execution servers</h5>
          <div class="card-body" style={{overflow: "scroll"}}>
            <table class="table table-striped table-bordered table-hover">
              {this.getHeader()}
              <tbody>
                {this.getBody()}
              </tbody>
            </table>
            {this.getPagination()}
          </div>
        </div>
      </div>);
  }

  getDetail(){
    var selectedJob = this.state.selectedJob;

    return  (<div class="container">
              <div class="row justify-content-center">
                <div class="card col-6">
                  <div class="card-body alert alert-success">
                    <p style={{"whiteSpace": "pre", "overflow": "auto"}}>
                      {selectedJob.stdout}
                    </p>
                  </div>
                </div>
                <div class="card col-6 alert alert-warning">
                  <div class="card-body" role="alert">
                    <p style={{"whiteSpace": "pre", "overflow": "auto"}}>
                      {selectedJob.stderr}
                    </p>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="card col-12">
                  <div class="card-body alert alert-info" style={{textAlign: "left"}}>
                    <ReactJson src={selectedJob} />
                  </div>
                </div>
              </div>
            </div>);
  }

  render() {
    var jobid = '';
    if(this.props.location){
      const parsed = qs.parse(this.props.location.search);
      jobid = parsed.jobid;
    }
    if(jobid && this.state.selectedJob){
      return this.getDetail();
    }else{
      return this.getTable();
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    http: state.jwtAuthReducer.http
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showJobDetail: params => {
      dispatch({
        type: 'show-job-detail',
        job: job
      });
    }
  }
}

export default withRouter(connect(mapStateToProps)(ClusterpostJobs));