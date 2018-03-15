import React from 'react';
import { Text, View, TouchableOpacity,Vibration,StyleSheet ,CameraRoll, Image,ActivityIndicator} from 'react-native';
import { Button ,Footer,FooterTab} from 'native-base';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons'


import { Camera, Permissions, ImagePicker } from 'expo';

export default class CameraExample extends React.Component {
  state = {
    image: null,
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    photoId:1,
    ratio: '1:1',
    loading:false
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

takePicture = async function() {

  this.setState({
    loading: true,
  });

  if(this.camera) {
    this.camera.takePictureAsync().then(data => {
        CameraRoll.saveToCameraRoll(data.uri);
    }).then(() => {
      this.setState({
        photoId: this.state.photoId + 1,
        loading: false,
      });
      
         Vibration.vibrate();
      
    });
  }
};




  pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:"Images",
      allowsEditing: true,
      aspect: [4, 4],
      quality:0.5,
      base64 :true,
    });
    
    if (!result.cancelled) {
      this.setState({ image: result.uri });
      this.onImageDataResolved(result);
      // console.log(result);

    }
    else
    {
      this.props.navigation.navigate('Camera');
    }
   

  };

 onImageDataResolved(imageData) 
    {
    this.props.navigation.navigate('ImageEditor', {imageData});
    }

  render() {

    let { image } = this.state;
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 ,}}>
          <Camera style={{ flex: 4,}} type={this.state.type} ref={ref => { this.camera = ref; }}  ratio={this.state.ratio}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  <Icon  name='camera-front' style={{fontSize:33}}/>
                </Text>
              </TouchableOpacity>
                   {this.state.loading &&
                  <View style={styles.loading}>
                      <ActivityIndicator animating size="large" color="white"/>
                      <Text  style={{marginTop:2,color:"#ffffff"}} children="Dont't Shake!! Saving to Gallery..." />
                  </View>
                  }
            </View>
          </Camera>

          
          
          <Footer style={{  flex: 1,backgroundColor:'white' }}>
               
             <FooterTab style={{marginLeft:125,backgroundColor:'white'}}>
               
              <Button transparent  onPress={this.takePicture.bind(this)}>

                <Icon  name='camera-iris' style={{fontSize:65  }}/>

              </Button>
               

              <Button transparent  onPress={this.pickImage.bind(this)} >

                <Icon  name='image' style={{color:'black',fontSize:50 }}/>

              </Button>
              
             

              
          </FooterTab>
             
          </Footer>
        
        </View>

        
      );
    }
  }
}


const styles = StyleSheet.create({
  loading: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      opacity: 0.5,
      backgroundColor: 'black',
      justifyContent: 'center',
      alignItems: 'center'
  }
})