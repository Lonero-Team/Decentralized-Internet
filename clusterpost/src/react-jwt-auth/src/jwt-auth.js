import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import JWTAuthService from './jwt-auth-service';

import _ from 'underscore';
import qs from 'query-string';

import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import {Card, Button, Row, Col, Form, Container, InputGroup, Overlay, Popover} from 'react-bootstrap';

class JWTAuth extends Component {

  constructor(props) {
    super(props);

    this.pleaseLogin = this.pleaseLogin.bind(this);
    this.login = this.login.bind(this);
    this.recoverPassword = this.recoverPassword.bind(this);
    this.createUserForm = this.createUserForm.bind(this);
    this.createUser = this.createUser.bind(this);
    this.resetUserPasswordForm = this.resetUserPasswordForm.bind(this);
    this.resetUserPassword = this.resetUserPassword.bind(this);
    this.getAuthService = this.getAuthService.bind(this);
    this.switchCreateForm = this.switchCreateForm.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.setObjectProperty = this.setObjectProperty.bind(this);

    this.state = {
      isCreateUser: false,
      isLoggedIn: false,
      loginFailed: false,
      createFailed: false,
      emailRequired: false,
      user: {
        email: '',
        password: ''
      },
      newUser: {
        name: '',
        email: '',
        password: ''
      },
      resetUser: {
        password0: '',
        password1: ''
      }
    };

  }

  componentDidMount(){

    const self = this;
    const {location, history, routeLogout} = this.props;

    this.jwtauth = new JWTAuthService();
    this.jwtauth.setHttp(this.props.http);

    if(location && location.pathname == "/logout" ){
        this.jwtauth.logout()
        .then(function(){
          history.push(routeLogout);
          self.props.userFactory({});
        })
    } 
  }

  render() {
    let userInputs;
    const isCreateUser = this.state.isCreateUser;
    const isLoggedIn = this.state.isLoggedIn;

    const {
      location
    } = this.props;

    var token;
    if(location){
      const search = qs.parse(location.search);
      token = search.token;
    }
    if(token){
      userInputs = this.resetUserPasswordForm();
    }else{
      if(isCreateUser){
        userInputs = this.createUserForm();
      }else{
        userInputs = this.pleaseLogin();
      }  
    }   

    return (
      <div class="card">
        <div class="card-body" style={{"textAlign": "center"}}>
          {userInputs}
        </div>
      </div>
      );
  }

  switchCreateForm(){
    this.setState({isCreateUser: !this.state.isCreateUser});
  }

  setObjectProperty(obj, path, value) {
    var schema = obj;
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) schema[elem] = {}
        schema = schema[elem];
    }

    schema[pList[len-1]] = value;
    return obj;
  }

  handleInputChange(event) {
    const target = event.target;

    const targetPropertyName = target.name.substr(target.name.indexOf('.') + 1);
    const targetObjectName = target.name.substr(0, target.name.indexOf('.'));
    const value = target.value;

    var obj = this.setObjectProperty(this.state[targetObjectName], targetPropertyName, value);

    this.setState({
      [targetObjectName]: obj
    });
  }

  timeHideLoginPopover(){
    const self = this;
    setTimeout(function(){
      self.setState({
        ...self.state, 
        loginFailed: false,
        loginTarget: null
      })
    }, 10000);
  }

  pleaseLogin(){
    return (
      <Col>
        <Row>
          <Col>
            <Form onSubmit={this.login} ref={(node) => {this.loginRef = node}}>
              <Form.Control placeholder="Email address" required autofocus="" type="email" value={this.state.user.email} name="user.email" onChange={this.handleInputChange} data-container="#divlogin" data-toggle="popover" data-placement="right" data-content="Please enter your email address"/>
              <Form.Control placeholder="Password" required type="password" value={this.state.user.password} name="user.password" onChange={this.handleInputChange} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" title="Must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters"/>
              <Button variant="primary" size="lg" block type="submit">Login</Button>
              <Overlay
                show={this.state.loginFailed}
                target={this.state.loginTarget}
                placement="right"
                container={()=>{return ReactDOM.findDOMNode(this.loginRef);}}
                containerPadding={20}
                onEntered={()=>{this.timeHideLoginPopover()}}
              >
                <Popover id="popover-contained" class="alert alert-warning">
                  <strong class="text-warning">Please check your username and password!</strong>
                </Popover>
              </Overlay>
            </Form>
          </Col>
        </Row>
        <Row className="justify-content-md-center" style={{"margin-top": "10px"}}>
          <Col md="auto">
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1">Forgot your password?</InputGroup.Text>
              </InputGroup.Prepend>
              <InputGroup.Append>
                <Button variant="secondary" size="sm" onClick={this.recoverPassword}>click here</Button>
               <Overlay
                  show={this.state.emailRequired}
                  target={this.state.emailTarget}
                  placement="right"
                  container={()=>{return ReactDOM.findDOMNode(this.loginRef);}}
                  containerPadding={20}
                  onEntered={()=>{this.timeHideEmailRequiredPopover()}}
                >
                  <Popover id="popover-contained" class="alert alert-warning">
                    <strong class="text-warning">Please type your email.</strong>
                  </Popover>
                </Overlay>
              </InputGroup.Append>
            </InputGroup>
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col md="auto">
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1">New user?</InputGroup.Text>
              </InputGroup.Prepend>
              <InputGroup.Append>
                <Button variant="secondary" size="sm" onClick={this.switchCreateForm}>create new account</Button>
              </InputGroup.Append>
            </InputGroup>
          </Col>
        </Row>
      </Col>
    );
  }

  login(event){
    const {history, routeLogin} = this.props;
    event.preventDefault();
    const target = event.target;
    var self = this;
    this.jwtauth.login(this.state.user)
    .then(function(res){
      return self.jwtauth.getUser();
    })
    .then(function(res){
      self.props.userFactory(res);
      history.push(routeLogin);
    })
    .catch(function(res){
      if(res && res.response && res.response.status === 401){
        self.setState({...self.state, loginFailed: true, loginTarget: target});
      }
    });
  }

  recoverPassword(event){
    const {target} = event;
    if(this.state.user.email != ''){
      this.jwtauth.sendRecoverPassword({
        email: this.state.user.email
      })
      .then(function(res){
        alert(res.data);
      })
      .catch(function(e){
        if(res && res.response && res.response.status === 401){
          alert("Account not found! You need to create an account.");
        }
      })
    }else{
      this.setState({...this.state, emailRequired: true, emailTarget: target});
    }
  }

  timeHideEmailRequiredPopover(){
    const self = this;
    setTimeout(function(){
      self.setState({
        ...self.state, 
        emailRequired: false,
        emailTarget: null
      })
    }, 10000);
  }

  timeHideCreatePopover(){
    const self = this;
    setTimeout(function(){
      self.setState({
        ...self.state, 
        createFailed: false,
        createTarget: null
      })
    }, 10000);
  }
  
  createUserForm(){
    return (<Col>
        <Row className="justify-content-md-center">
          <Col>
            <Form autoComplete="new-password" onSubmit={this.createUser} ref={(node) => {this.createUserRef = node}}>
              <h2>Create an account</h2>
              <Form.Control type="text" placeholder="User name" value={this.state.newUser.name} name="newUser.name" onChange={this.handleInputChange} autoComplete="new-password"/>
              <Form.Control placeholder="Email address" required="" type="email" value={this.state.newUser.email} name="newUser.email" onChange={this.handleInputChange} autoComplete="new-password"/>
              <Form.Control type="password" placeholder="Password" required value={this.state.newUser.password} name="newUser.password" onChange={this.handleInputChange} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" title="Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters" autoComplete="new-password"/>
              <Button variant="primary" size="lg" block type="submit">Create and Login</Button>
              <Overlay
                show={this.state.createFailed}
                target={this.state.createTarget}
                placement="right"
                container={()=>{return ReactDOM.findDOMNode(this.createUserRef)}}
                containerPadding={20}
                onEntered={()=>{this.timeHideCreatePopover()}}
              >
                <Popover id="popover-contained">
                  <strong class="text-warning">A user with the same account exists!</strong>
                </Popover>
              </Overlay>
            </Form>
          </Col>
        </Row>
        <Row className="justify-content-md-center" style={{"margin-top": "10px"}}>
          <Col md="auto">
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text id="basic-addon1">Existing user?</InputGroup.Text>
              </InputGroup.Prepend>
              <InputGroup.Append>
                <Button variant="secondary" size="sm" onClick={this.switchCreateForm}>Login with your account</Button>
              </InputGroup.Append>
            </InputGroup>
          </Col>
        </Row>
      </Col>
    );
  }

  createUser(event){
    const {history, routeLogin} = this.props;
    const self = this;
    const target = event.target;
    event.preventDefault();
    this.jwtauth.createUser(this.state.newUser)
    .then(function(res){
      return self.jwtauth.getUser();
    })
    .then(function(res){
      self.props.userFactory(res);
      history.push(routeLogin);
    })
    .catch(function(res){
      if(res && res.response && res.response.status === 409){
        self.setState({...self.state, createFailed: true, createTarget: target});
      }
    });;
  }


  resetUserPasswordForm(){
    return (
      <Col>
        <Form autoComplete="new-password" onSubmit={this.resetUserPassword}>
          <h2 class="form-login-heading">Reset your password</h2>
          <Form.Control type="password" placeholder="Password" required value={this.state.resetUser.password0} name="resetUser.password0" onChange={this.handleInputChange} pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}" title="Password must contain at least one number and one uppercase and lowercase letter, and at least 6 or more characters" autoComplete="new-password"/>
          <Form.Control type="password" placeholder="Confirm password" required value={this.state.resetUser.password1} name="resetUser.password1" onChange={this.handleInputChange} autoComplete="new-password"/>
          <Button variant="primary" size="lg" block type="submit">Reset and Login</Button>
        </Form>
      </Col>
    );
  }

  resetUserPassword(event){
    var errorMsg = "";
    const self = this;
    event.preventDefault();

    const {
      location, history, routeLogin
    } = this.props;

    var token;
    if(location){
      const search = qs.parse(location.search);
      token = search.token;
    }

    if(this.state.resetUser.password0 === this.state.resetUser.password1){
      this.jwtauth.updatePassword({
        password: this.state.resetUser.password0
      }, token)
      .then(function(){
        return self.jwtauth.getUser();
      })
      .then(function(res){
        self.props.userFactory(res);
        history.push(routeLogin);
      })
      .catch(function(e){
        console.error(e);
      });
    }
    else
    {
      alert('Passwords are not the same');
      return false;
    }
  }


  getAuthService(){
    return auth;
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    http: state.jwtAuthReducer.http
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

JWTAuth.defaultProps = {
  routeLogin: '/home',
  routeLogout: '/'
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(JWTAuth));