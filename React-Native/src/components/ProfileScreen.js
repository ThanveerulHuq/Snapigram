import React, { Component } from "react";

import {StyleSheet, AsyncStorage, View , Alert } from 'react-native';

import { Container,Input,Title, Button, Icon, Text } from "native-base";

const ACCESS_TOKEN ='access_token';

export default class extends Component {

  constructor(props) {
    super(props)
    this.state = ({
     
    });

  }


  onLogout = () => {
    this.deleteToken(); 
  }
  

  async deleteToken() {
    console.log("Deleting tokken");
    try {
      
      await AsyncStorage.removeItem(ACCESS_TOKEN);
      Alert.alert("Success ","You have successfully logged out! Thank you for using Snapigram! ");
      this.props.navigation.navigate('Login');
      console.log("Deleted");

    }
    catch(error) {
      console.log("Somthing went wrong while deleting the tokken");
    }
  }



  render() {


    return (
      <Container style={{flex: 5}}>


        
        <View style={{flex: 3,justifyContent:"center",alignContent:"center",alignItems:"center",backgroundColor:"white"}}>
             
            <Button  iconRight  style={styles.button}  dark onPress={this.onLogout.bind(this)}>
                  
                  <Text>Logout</Text>
                  <Icon name="ios-log-out" />
            </Button>
        </View>


        <View style={styles.text}>
            <Text>Thanks for Visting</Text>
            <Text>Created by</Text>
            <Text>React-native: officialrj18@gmail.com</Text>
            <Text>Python-flask: thanveersiddiq@gmail.com</Text>
            <Text style={{fontWeight: 'bold',fontSize:19 }}>Special thanks to Hasura</Text>
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create
 ({

  button : {
    padding: 10, 
    alignSelf: 'auto'
    
  },
  text : {
    
    backgroundColor:"white",
    flex:0.9,
    alignItems:"center"

  }

  


})