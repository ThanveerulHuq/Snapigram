import React, { Component } from "react";
import Expo from "expo";

import LoginScreen from "./src/components/LoginScreen"
import SignupScreen from "./src/components/SignupScreen"
import MainScreen from "./src/components/MainScreen";

import CameraScreen from "./src/components/CameraScreen.js";
import ImageEditor from "./src/components/ImageEditor";

import HomeScreen from "./src/components/HomeScreen";
import ProfileScreen from "./src/components/ProfileScreen";



import {  StackNavigator,} from 'react-navigation';


export default class Insta extends Component {
  constructor() {
    super();

    this.state = {
      isReady: false
    };
  }
  async componentWillMount() {
    await Expo.Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Billabong: require("./src/assets/Billabong.ttf"),
      Ionicons: require("native-base/Fonts/Ionicons.ttf")
    });
    this.setState({ isReady: true });
  }
  render() {

    if (!this.state.isReady) {
      return <Expo.AppLoading />;
    }
    return <App/>;
  }
}

const App = StackNavigator({ 

 
  Login: { screen: LoginScreen, navigationOptions: { header: false } },

  Signup: { screen: SignupScreen ,navigationOptions: { header: null } },

  Main: { screen: MainScreen, navigationOptions: { header: null }},

  Camera : { screen : CameraScreen ,navigationOptions: { title: " Photo"} },

  ImageEditor :{ screen : ImageEditor ,navigationOptions: {  title: "ImageEditor"}},

  Home: { screen: HomeScreen  }, 

  Profile: { screen: ProfileScreen , navigationOptions: { title: "Profile"}  },


});