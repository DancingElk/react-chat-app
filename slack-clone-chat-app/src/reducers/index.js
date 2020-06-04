import combineReducers from "../utils/combineReducers";
import userReducer from "./userReducer";
import channelReducer from "./channelReducer";
import colorsReducer from "./colorsReducer";

export default combineReducers({
  user: userReducer,
  channel: channelReducer,
  colors: colorsReducer
});
