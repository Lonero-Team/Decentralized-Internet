
const initialState = {
  uri: '/',
  queryParams: '',
  http: ''
};

const navbarReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'user-login':{
      return {
        ...state,
        showLogin: action.showLogin
      }
    }
    default: {
      return state;
    }
  }
};

export default navbarReducer;