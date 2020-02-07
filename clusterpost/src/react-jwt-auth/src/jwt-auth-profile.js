import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import JWTAuthService from './jwt-auth-service';

import _ from 'underscore';

import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import {UserCheck, User} from 'react-feather';

class JWTAuthProfile extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: {},
      btnClass: "btn btn-primary",
      updating: false
    };

  }

  componentDidMount(){
    this.jwtauth = new JWTAuthService();
    this.jwtauth.setHttp(this.props.http);

    const self = this;
    this.jwtauth.getUser()
    .then(function(res){
      self.setState({...self.state, user: res})
    })
  }

  componentWillReceiveProps(newProps){
     if(newProps.user != this.props.user){
         this.setState({user: newProps.user })
     }
  }

  hasScope(user, scope){
    return user.scope.indexOf(scope) >= 0;
  }

  getUserPermissions(user){
    return _.map(user.scope, function(sc){
      return <li class="list-group-item"><span class="badge badge-info">{sc}</span></li>
    })
  }

  updateUser(){
    const {user} = this.state;
    const self = this;
    delete user.scope;
    this.jwtauth.updateSelf(user)
    .then(function(res){
      self.setState({...self.state, btnClass:"btn btn-success", updating: true});
      setTimeout(function(){
        self.setState({...self.state, btnClass:"btn btn-primary", updating: false});
      }, 3000);
      return self.jwtauth.getUser();
    })
    .then(function(res){
      self.props.userFactory(res);  
    });
    
  }

  updateUserName(e){
    if(e && e.target){
      const {user} = this.state;
      user.name = e.target.value;
      this.setState({...this, user: user});
    }
  }

  render() {

    var {user, btnClass, updating} = this.state;
    
    const self = this;

    return (<div class="card">
        <div class="card-title alert alert-info"><h3>User Profile</h3></div>
          <div class="card-body">
            <form>
              <div class="form-group row">
                <label for="staticEmail" class="col-sm-3 col-form-label">Email</label>
                <div class="col-sm-9">
                  <input type="text" readonly class="form-control-plaintext" id="staticEmail" value={user.email}/>
                </div>
              </div>
              <div class="form-group row">
                <label for="inputName" class="col-sm-3 col-form-label">Name</label>
                <div class="col-sm-9">
                  <input class="form-control" id="inputName" placeholder="Name" value={user.name} onChange={self.updateUserName.bind(self)}/>
                </div>
              </div>
              <div class="form-group row">
                <label for="permissions" class="col-sm-3 col-form-label">Permissions</label>
                <div class="col-sm-9 container-fluid">
                  <ul class="list-group list-group-flush">
                    {self.getUserPermissions(user)}
                  </ul>
                </div>
              </div>
            </form>
            <div class="row justify-content-end">
              <div class="col-4">
                <div class="input-group">
                  <button class={btnClass} onClick={self.updateUser.bind(self)}>Update {updating?<UserCheck/>:<User/>}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    http: state.jwtAuthReducer.http,
    user: state.jwtAuthReducer.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    userFactory: user => {
      dispatch({
        type: 'user-factory',
        user: user
      });
    }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(JWTAuthProfile));