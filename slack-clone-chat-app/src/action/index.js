import * as userActions from "./userActions";
import * as channelActions from "./channelActions";
import * as colorsActions from "./colorsActions";

export const clearUser = userActions.clearUser;
export const setUser = userActions.setUser;

export const setCurrentChannel = channelActions.setCurrentChannel;
export const setPrivateChannel = channelActions.setPrivateChannel;
export const setUserPosts = channelActions.setUserPosts;

export const setColors = colorsActions.setColors;
