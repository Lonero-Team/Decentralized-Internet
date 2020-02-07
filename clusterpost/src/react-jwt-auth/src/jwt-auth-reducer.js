
const initialState = {
  http: {}
};

const jwtAuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'http-factory':{
      return {
        ...state,
        http: action.http
      }
    }
    case 'user-factory':{
      return {
        ...state,
        user: action.user
      }
    }
    default: {
      return state;
    }
  }
};

export default jwtAuthReducer;