import React, { Component } from "react";
import {  Image ,StyleSheet,Alert,AsyncStorage,ActivityIndicator} from 'react-native';
import { Container,View, Header,Footer, Input,Title, Content, Button, Icon, Text, Right, Body,Form,Item } from "native-base";
const ACCESS_TOKEN = 'access_token';


export default class extends Component {

      constructor(props) {
        super(props)

        this.state = {
          imageData : this.props.navigation.state.params.imageData,      
          file_id : '',
          caption : '',
          auth_tokken :'',
          tags : '',  
          isloading:true,         
        };
      }

  componentDidMount(){
   this.UploadImagetoServer();
   this.getToken();
    } 


    async getToken() {
      try {
        let accessToken = await AsyncStorage.getItem(ACCESS_TOKEN);
          if(!accessToken)
          {
              console.log("token is not set");
          }
          else {
              this.setState({ auth_tokken : accessToken});

          }

          
      }
      catch(error) {
          console.log("Sommething went wrong with tokken")
      }
  }
  
    

   UploadImagetoServer = () => {
      // let { imageData } = this.state;

      const base64 = "data:image/png;base64,"+this.state.imageData.base64;

      
      console.log("this is the culprit "+base64 );

      fetch('https://app.derogation85.hasura-app.io/uploadImage', {
            method: 'post',
            headers: {
              
              "Content-Type": "application/json"
            },
       
            body: JSON.stringify({
              "file": base64
              
            })
           
          })
          .then((response) => response.json())
          
          .then((res) => {
              console.log(res);
           
              if(typeof(res.filekey)  != "undefined")
              {
              this.setState({file_id : res.filekey});
              // Alert.alert("Success ",res.filekey + "Uploaded");
              this.setState({ 
                isloading : false,
              });

              }
              else
              {
                Alert.alert("Error ","Internal Server Error");
              }
         
           }).catch((error) => {
           console.error(error);
          //  this.setState({error, loading: false, refreshing:false});
          Alert.alert("Error ","Internal Server Error");
          });  
    }



    
   PostImagetoServer = () => {

    this.setState({ isloading : true,});

    if (this.state.file_id === "")
    {
      Alert.alert("PLZ WAIT", "BIG THINGS TAKES TIME ");

    }
    
     else 

     {
             
      this.Makingtags();

      fetch('https://app.derogation85.hasura-app.io/uploadPost', {
            method: 'POST', 
            headers: {
              'Content-Type': 'application/json',
              'Auth' : this.state.auth_tokken
            
            },
            body : JSON.stringify({
              "file_key": this.state.file_id,
              "descr": this.state.caption,
              "tags": this.state.tags,
            })
            
          })
         
          .then((res) => {
              console.log(res);
              
            
              if( res._bodyText == "success")
              {
                this.setState({ 
                  isloading : false,
                  
                });
  
              Alert.alert(res._bodyText ,"Your Post has been Shared Successfully");
              this.props.navigation.navigate('Main');

              }
              else
              {
                Alert.alert("Error ","Not Posted");
              }
        
          }).catch((error) => {
          console.error(error);
          this.setState({error, loading: false});

          });  


     }
     

  }


  
    Makingtags = () => {
          
          caption = this.state.caption
          captions=caption.split(' ')
          tags=''
          
          for (cap in captions) 
          {
          if (captions[cap].startsWith("#"))
          {
          tags+=captions[cap].substr(1)+'|';
          }}
          if(tags.length != 0){
          tags = tags.substr(0,tags.length -1 );
          }
          
          console.log("thus is the total tags " + tags);
          this.setState({tags : tags});
        }



  render() {
   
    let { imageData } = this.state;
    const imageUri = this.state.imageData.uri;
    const image64 = `data:image/jpg;base64,`+ imageData.base64;
    
    // console.log(this.state.imageData);
    console.log("file id : " + this.state.file_id);
    console.log("Auth : " + this.state.auth_tokken);

       
    return (

      <Container style={styles.Container}>
          <View style={styles.form}> 

              
            {/* <Text style={{fontFamily:'Billabong',fontWeight: 'bold',fontSize:20}}>ImageURI = {imageData.uri}</Text> */}
            <View style={styles.imagebox} >
               
              <Image style={styles.image}
                  
                    source={{uri:image64}}

                />

                {this.state.isloading &&
                  <View style={styles.loading}>
                      <ActivityIndicator animating size="large" color="white"/>
                  </View>
                  }
            </View>
                <View style={styles.inputbox}>
                    
                    <Item>
  
                      <Input  onChangeText = { (caption)=> this.setState({caption}) } style={styles.caption} 
                      placeholder="Write a caption....." 
                      multiline 
                      underlineColorAndroid = 'transparent'
                      autoCorrect = {false}
                      autoCapitalize = "none"
                       />

                    </Item>


                    
                </View>

      
          </View>


          <View style={{flex: 1,flexDirection: 'row', paddingTop:5, justifyContent: 'center', alignItems: 'center'}}>
            
          <Button rounded iconRight style={styles.button}  onPress={() =>this.PostImagetoServer()}>

            <Text >Share</Text>
            <Icon name='md-share-alt' />
                
              
          </Button>
            
          </View>
          {/* <Text> Auth_Tokken : {this.state.auth_tokken}</Text> */}
          {/* <Text>Fil_id :  {this.state.file_id}</Text> */}
        
      </Container>
    );
  }
}

const styles = StyleSheet.create
    ({
      Container: {
        flex:1,
        backgroundColor:'white',
      
    },
    
    inputbox :{
      paddingLeft:0,
      flex:2
    },

    caption :{
      flex:1,
      height:145,
     
    },
    imagebox:{
      height :145,
      width :140,
    },
    image :{
      margin:5,
      height :145,
      width :125,
      flex:1,
    },
    
    form:{
      flex:1,
      flexDirection :'row',
    },

    button:{

      padding:10
      
    },
    loading: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.5,
      justifyContent: 'center',
      alignItems: 'center'
  }
    

})