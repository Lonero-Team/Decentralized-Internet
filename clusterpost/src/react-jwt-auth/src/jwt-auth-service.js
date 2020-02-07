
export default class JWTAuthService{

  constructor(){
    this.http = null;
  }

  setHttp(http){
    this.http = http;
  }

  createUser(user){
    return this.http({
      method: 'POST',
      url: '/auth/user',
      data: user
    })
    .then(function(res){
      localStorage.setItem('clusterpost_token', res.data.token);
    });
  }

  getUsers(){
    return this.http({
        method: 'GET',
        url: '/auth/users'
      });
  }

  getUser(){
    return this.http.get('/auth/user')
    .then(function(res){
      var user = res.data;
      return user;
    });
  }

  deleteSelf(){
    return this.http({
      method: 'DELETE',
      url: '/auth/user'
    });
  }

  login(user){
    return this.http({
      method: 'POST',
      url: '/auth/login',
      data: user
    })
    .then(function(res){
      localStorage.setItem('clusterpost_token', res.data.token)
      return true;
    });
  }

  updatePassword(password, token){
    return this.http({
      method: 'PUT',
      url: '/auth/login',
      data: password,
      headers: {
        authorization: "Bearer " + token
      }
    })
    .then(function(res){
      localStorage.setItem('clusterpost_token', res.data.token);
    });
  }

  sendRecoverPassword(email){
     return this.http({
      method: 'POST',
      url: '/auth/reset',
      data: email
    });
  }

  logout(){
    localStorage.removeItem('clusterpost_token');
    return Promise.resolve();
  }

  updateUser(user){
    return this.http({
      method: 'PUT',
      url: '/auth/users',
      data: user
    });
  }

  updateSelf(user){
    return this.http({
      method: 'PUT',
      url: '/auth/user',
      data: user
    });
  }

  deleteUser(user){
    return this.http({
      method: 'DELETE',
      url: '/auth/users',
      data: user
    });
  }

  getScopes(){
    return this.http({
      method: 'GET',
      url: '/auth/scopes'
    });
  }

  updateScopes(scopes){
    return this.http({
      method: 'PUT',
      url: '/auth/scopes',
      data: scopes
    });
  }
}
