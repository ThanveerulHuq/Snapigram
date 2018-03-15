import React, { Component } from 'react'; 
import {StyleSheet, View,  TouchableOpacity , AsyncStorage, TextInput,Alert, StatusBar,TouchableHighlight } from 'react-native';
import { Container,Content, Item, Input ,Button ,Text ,Footer } from 'native-base';

const ACCESS_TOKEN = 'access_token';

export default class LoginScrreen extends Component {


    componentWillMount(){
        this.getToken();
    }

    constructor(props) {

        super(props);
        this.state = {
            username : '',
            password : '',

        };
    }

  

    async storeToken(accessToken) {
        try {
            await AsyncStorage.setItem(ACCESS_TOKEN, accessToken);
            // this.getToken();
            console.log(ACCESS_TOKEN);
        }
        catch(error) {
            console.log("Sommething went wrong with tokken")
        }
    }

    async getToken() {
        try {
           let accessToken = await AsyncStorage.getItem(ACCESS_TOKEN);
            if(!accessToken)
            {
                console.log("token is not set");
            }
            else {

                this.props.navigation.navigate('Main');
            }
            
        }
        catch(error) {
            console.log("Sommething went wrong with tokken")
        }
    }
    


  render() { 
    return (

        // <keyboardAvoidingView behavior='position' >
        <Container>
            <View style={styles.container}>
            <StatusBar
                animated={true}
                backgroundColor={"black"}
              
            />

                <Text style={styles.header}> Snapigram </Text>

                <TextInput 
                        style={styles.textInput} placeholder='Username'
                        onChangeText = { (username)=> this.setState({username}) }
                        underlineColorAndroid = 'transparent'
                        autoCorrect = {false}
                        autoCapitalize = "none"
                />

                <TextInput 
                        style={styles.textInput} placeholder='Password'
                        secureTextEntry = {true}
                        onChangeText = { (password)=> this.setState({password}) }
                        underlineColorAndroid = 'transparent'
                        autoCorrect = {false}
                        autoCapitalize = "none"
                /> 

                <TouchableOpacity
                    style={styles.btn}
                    onPress={this.login}>
                    <Text style={{color:"#68a0cf"}}>Log In</Text>
                </TouchableOpacity>
               
               
                </View>
              
                
                <Footer style={styles.footer} >
                    
                   <Button
                    onPress={() => {this.props.navigation.navigate('Signup')}} transparent block >
                    <Text uppercase={false} fontWeight={false} style={styles.footertext}>Don't have an account? <Text style={styles.signup}>Signup</Text></Text>
                   {/* </TouchableHighlight> */}
                   </Button>
                   
                </Footer>

        </Container>


        //  </keyboardAvoidingView>
      
         
    );
  
  }  



  login = async () => {
    fetch('https://app.derogation85.hasura-app.io/login', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
                "user_name": this.state.username,
                "password": this.state.password
           
          })
        })
        .then((response) => response.json())
        .then((res) => {

            console.log(res)

            
        if(typeof(res.status) != "undefined")
        {
         
            Alert.alert("Error",  res.status);
         
       }
       else if(typeof(res.message) != "undefined")
        {
     
            Alert.alert("Error",  res.message);
     
        }
       
        else if(typeof(res.user.message) != "undefined")
        {
            Alert.alert("Error",  res.user.message);
        }
        else
         {
        // this.setState({ auth_token: res.auth_token });
        let token = res.user.auth_token;
        this.storeToken(token);

        Alert.alert("Welcome, "+ res.user.username, " You have successfully logged in");
        this.props.navigation.navigate('Main');
        }
     }).catch((error) => {
         console.error(error);
        });

      
  }

}


const styles = StyleSheet.create ({
      
        container : {
            flex :1,
            alignItems : 'center',
            justifyContent : 'center',
            backgroundColor : '#ffffff',
            paddingLeft :40,
            paddingRight :40,
        },

        header :{
            fontSize: 45,
            marginBottom: 30,
            fontFamily : 'Billabong',
            color :'black',
            fontSize :60,
                   
        },
        textInput : {
            alignSelf : 'stretch',
            padding : 12,
            marginBottom :15,
            backgroundColor : '#f7f7f7',
            borderColor: '#d0d0d0',
            borderWidth: 1,
            borderRadius : 8,
           

        },
        btn : {
            alignSelf : 'stretch',
            padding : 15,
            alignItems : 'center',
            backgroundColor:'#ffffff',
            borderRadius:10,
            borderWidth: 1,
            borderColor: '#68a0cf'
        },

       footertext:{
            
           fontSize:14,
           color:'#d0d0d0',
           fontWeight:'normal',

        },
        signup:{
            fontWeight:'900',
            color:'#949699',
            fontSize:13,
            

        },

       footer:{
        
        borderTopWidth: 1,
        borderColor: '#d0d0d0',
        backgroundColor:"#ffffff",
        alignItems: "center",
        height:50
        
       }


      
        

});
