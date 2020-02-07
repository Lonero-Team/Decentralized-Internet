import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import JWTAuthService from './jwt-auth-service';

import _ from 'underscore';

import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import {Delete, PlusSquare} from 'react-feather';

class JWTAuthUsers extends Component {

  constructor(props) {
    super(props);

    this.state = {
      appScopes: {
        "type": "scopes",
        "scopes": []
      },
      newScope: "",
      users: {},
      usersFiltered: {}
    };

  }

  componentDidMount(){
    this.jwtauth = new JWTAuthService();
    this.jwtauth.setHttp(this.props.http);

    var self = this;

    this.jwtauth.getUsers()
    .then(function(res){
       self.setState({
        ...self.state, 
        users: res.data,
        usersFiltered: res.data
       })
    });

    this.jwtauth.getScopes()
    .then(function(res){
      self.setState({
        ...self.state, 
        appScopes: res.data[0]
      })
    })
    .catch(function(e){
      console.error(e);
    });
    
  }

  createScope(){

    var self = this;
    var {appScopes, newScope} = this.state;

    if(newScope != ""){
      if(appScopes.scopes.indexOf(newScope) == -1){
        appScopes.scopes.push(newScope);

        this.jwtauth.updateScopes(appScopes)
        .then(function(res){
          self.setState({...self.state, appScopes: appScopes, newScope: ""});
        })
        .catch(alert);
      }
    }
  }

  addRemoveScope(user, scope){
    const {users} = this.state;
    const self = this;
    
    if(self.hasScope(user, scope)){
      user.scope.splice(user.scope.indexOf(scope), 1);
    }else{
      user.scope.push(scope);
    }

    return self.jwtauth.updateUser(user)
    .then(function(res){
      _.each(users, function(us){
        if(us.email === user.email){
          us._rev = res.data.rev;
        }
      });
      self.setState({...self.state, users: users});
    })
    .catch(alert)

  }

  deleteUser(user){
    var {users} = this.state;
    const self = this;

    if(confirm("Do you want to delete the user?")){
      this.jwtauth.deleteUser(user)
      .then(function(){
        users.splice(_.findIndex(users, (u)=>{return u._id == user._id}), 1);
        self.setState({...self.state, users: users});
      })
      .catch(alert);
    }
  }

  hasScope(user, scope){
    return user.scope.indexOf(scope) >= 0;
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

  setTextSearch(e){
    const {users} = this.state;
    var self = this;
    
    var regexText = e.target.value.trim();
    var propertiesNames = ["name", "email", "scope"];

    var filtered = _.filter(users, function(user){
      return self.getFilteredPropertiesFromRegex(user, propertiesNames, regexText);
    });

    this.setState({
      ...this.state, usersFiltered: filtered
    });
  }

  getUserRows(){
    var {usersFiltered, appScopes} = this.state;
    var self = this;
    return _.map(usersFiltered, function(user){
      return (<tr>
          <td scope="row">{user.name}</td>
          <td>{user.email}</td>
          {
            _.map(appScopes.scopes, function(us){
              return (<td>
                <div class="input-group">
                  <div class="input-group-prepend">
                    <div class="input-group-text">
                      <input id={us + "checkScope"} type="checkbox" onClick={()=>{self.addRemoveScope(user, us)}} checked={self.hasScope(user, us)}/>
                    </div>
                  </div>
                  <div class="input-group-append">
                    <span class="input-group-text">{us}</span>
                  </div>
                </div>
              </td>)
            })
          }
          <td>
            <button type="button" onClick={(e)=>{self.deleteUser(user)}} class="btn btn-sm btn-danger">
              <Delete/>
            </button>
          </td>
        </tr>
      );
    });
  }

  render() {
    var {appScopes} = this.state;
    var scopes = appScopes.scopes;
    var self = this;
    return (
        <div class="row">
          <div class="col-md-3">
            <div class="card">
              <h5 class="card-title alert alert-info">Manage scopes</h5>
              <div class="card-body">
                <ul class="list-group">
                  {_.map(scopes, (us)=>{return <li class="list-group-item">{us}</li>})}
                </ul>
                <div class="input-group">
                  <input type="text" class="form-control" value={self.state.newScope} onChange={(e)=>{self.setState({...self.state, newScope: e.target.value})}} placeholder="Scope"/>
                  <div class="input-group-append">
                    <button type="button" class="btn btn-primary btn-sm" onClick={self.createScope.bind(self)}>
                      <PlusSquare/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-9">
            <div class="card">
              <h5 class="card-title alert alert-info">Manage scopes</h5>
              <div class="card-body">
                <table class="table table-striped table-bordered table-hover">
                  <thead class="thead-dark">
                    <tr>
                      <th colSpan={3 + appScopes.scopes.length}>
                        <input class="form-control" placeholder="Search ..." type="text" onChange={self.setTextSearch.bind(self)}/>
                      </th>
                    </tr>
                    <tr>
                      <th>
                        Name
                      </th>
                      <th>
                        Email
                      </th>
                      <th colSpan={1 + appScopes.scopes.length}>
                        Scopes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.getUserRows()}
                  </tbody>
                </table>
              </div>
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

export default withRouter(connect(mapStateToProps)(JWTAuthUsers));