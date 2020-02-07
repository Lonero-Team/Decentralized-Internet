import { combineReducers } from "redux";
import navbarReducer from "./navbar-reducer";
import {jwtAuthReducer} from "react-jwt-auth"

export default combineReducers({ navbarReducer, jwtAuthReducer });
