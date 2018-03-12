import React, { Component } from 'react'
import { View, Image,Text, Alert,StyleSheet, FlatList ,ActivityIndicator} from 'react-native'
import { Container, Header, Thumbnail, Button, Icon, Spinner ,Right} from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons'
import ParsedText from 'react-native-parsed-text';

export default class HomeGet extends Component {

    constructor(props)
    {
        super(props);
        this.state = ({
          isloading:true,
          refreshing:false,
          data : [],
          postId:10000000,
        });
    }


    componentDidMount() {

         this.getPosts();

    }


    getPosts = () => {
      // const { postId } = this.state;
      fetch('https://app.derogation85.hasura-app.io/getPosts', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              "post_id": this.state.postId
             
            })
          })
          .then((response) => response.json())
          .then((res) => {
              console.log(res.posts);
              if(typeof(res.posts.post_id) == "undefined")
              {
              this.setState({ 
                  data : [...this.state.data, ...res.posts],
                  isloading : false,
                  refreshing:false,
                });
              }
              else
              {
                Alert.alert("Error ","Internal Server Error");
              }
         
           }).catch((error) => {
           console.error(error);
           Alert.alert("Error ","Internal Server Error");
          //  this.setState({isloading: false, refreshing:false});
          });  
    }
    

      renderItem = ({item}) => {

        return (
          <View>
            {/* 'data:image/png;base64, */}
        
              <View style={{ height: 60, backgroundColor: 'white', flexDirection: 'row' }}>


                <Image
                  style={{ width: 36, height: 36, margin: 12, borderRadius: 18, borderColor: 'lightgray' }}
                  source={{ uri:'https://filestore.derogation85.hasura-app.io/v1/file/'+item.image_url}}
                />


                <Text style={{ fontWeight: 'bold',marginTop:15,padding:5}}>{
                  item.created_by}</Text>
                    <Right>
                    <Icon name="md-more"  style={{color: '#a9a9a9',padding:10,fontSize: 30}}/>
                    </Right>

              </View>

              <Image source={{uri: 'https://filestore.derogation85.hasura-app.io/v1/file/'+item.image_url}} style={{height: 350, width: null, flex: 1}}/>

              <View style={{ height: 54, backgroundColor: 'white', flexDirection: 'row' }}>
                <Ionicons name="ios-heart-outline" size={34} color="black" style={{ marginTop: 12, marginLeft: 15 }} />
                <Ionicons name="ios-text-outline" size={34} color="black" style={{ marginTop: 12, marginLeft: 20 }} />
                <Ionicons name="ios-send-outline" size={34} color="black" style={{ marginTop: 12, marginLeft: 20 }} />
               <View style={{ flex: 1 }} />

              <Ionicons name="ios-bookmark-outline" size={34} color="black" style={{ marginTop: 12, marginRight: 15 }} />
               
              </View>

              
            <Text note numberOfLines={2} style={{paddingLeft:10}}>
            <Text style={{ fontWeight: 'bold'}}>
                   {
                  item.created_by + " "}
                  </Text>
            <ParsedText
                      parse={
                    [
                    
                      {pattern: /#(\w+)/,                 style: styles.hashTag},
                    ]}
                    childrenProps={{allowFontScaling: false}}
                    >
                    
                     {item.description}  

              </ParsedText>
            </Text>

              <View style={{ marginBottom: 20, paddingLeft: 10 }}>
                <Text style={{ fontSize: 10, color: 'gray' }}>{'FEW MINUTES AGO'}</Text>
              </View>

          </View>
  
        ) 
      }

      _onRefresh() {
        this.setState({
          refreshing:true,
          postId:10000000,
       },
         ()=> { fetch('https://app.derogation85.hasura-app.io/getPosts', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "post_id": this.state.postId
           
          })
        })
        .then((response) => response.json())
        .then((res) => {
            console.log(res.posts);
            if(typeof(res.posts.post_id) != "undefined")
            {
            this.setState({ 
                data : res.posts,
                isloading : false,
                refreshing:false,
              });
            }
            else
            {
             
              this.setState({ 
                refreshing:false,
              });
              Alert.alert("Info","No new Post Available right now!!");

            }
       
         }).catch((error) => {
         console.error(error);
        //  this.setState({isloading: false, refreshing:false});
        });  
      } 
       );
      };


      handleLoadMore=() =>{
        data=this.state.data;
        let last_post_id=Math.min.apply(Math,data.map(function(ques){return ques.post_id;}));
        
        this.setState({
           postId:last_post_id,

        },
          ()=> { this.getPosts();} 
        );
       };


      renderFooter = () => {
        if(this.state.postId==1) 
        {
          
          return(
          <View style={{alignItems:"center",paddingVertical:20, borderTopWidth:1, borderTopColor:"#CED0CE"}}>

            <Text style={{ fontWeight:'900',color:'#949699',fontSize:20,}}>No More Posts</Text>
       
          </View>);
        }

        
        else{
          // console.log(this.state.data);
          return (
          
            <View style={{paddingVertical:20, borderTopWidth:1, borderTopColor:"#CED0CE"}}>
  
              <ActivityIndicator animating size="large"  color="#000000"/>
           
            </View>
  
          );
        }
       

      };

  render() {

    return (
      
      this.state.isloading ?
          <View style={{ flex:1,justifyContent: 'center', alignItems:'center'}}>
              <ActivityIndicator size="large" color="#000000" animating />
              <Text  style={{marginTop:10}} children="Please wait..." />
          </View>
      :
     
        <FlatList

          data={this.state.data}
          keyExtractor={(x,i)=> i}
          renderItem = {this.renderItem}  
          ListFooterComponent={this.renderFooter}          
          refreshing={this.state.refreshing}
          onRefresh={this._onRefresh.bind(this)}
          onEndReached={this.handleLoadMore}
          onEndThreshold={100}

          />   
    );
  }
}


const styles = StyleSheet.create
  ({
      hashTag: {

        color:'#03396c'
      },
  });