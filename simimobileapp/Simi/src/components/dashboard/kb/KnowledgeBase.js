import React, {Component} from 'react';
import {StyleSheet, View, Text, FlatList} from 'react-native';
import globalStyles from "../../../assets/js/Styles";
import CircularButton from '../../buttons/CircularButton';
import { Col, Grid } from "react-native-easy-grid";
import Checkbox from './Checkbox';
import PlaceHolder from './Placeholder';
import TopicInput from './TopicInput';
import {observer,inject} from 'mobx-react';
import strings from "../../../assets/en/json/strings.json";
import  { request, userIsOnline } from "../../../api/api";
import { DEBUG } from "../../../../settings";
import endpoints from "../../../api/endpoints";


let _addBtn_ = "ios-add";
let _checkBtn_ = "ios-checkmark";
let _trashBtn = "md-trash";
let HEADER = strings.global.knowledgeBase;


// todo: catch all promise errors




@inject('rootStore')
@observer
export default class KnowledgeBase extends Component<Props> {
  // todo: make a single request to the server per app usage session to retrieve 
  // all the necessary data for populating the inbox and the KB and save it to a 
  kbStore = this.props.rootStore.knowledgeBaseStore
  sessionStore = this.props.rootStore.sessionStore
  focusListener = this.props.navigation.addListener("didFocus", () => {
    // The screen is focused
    userIsOnline(this.sessionStore.userId, 
      this.sessionStore.endpoints.user, 
      this.sessionStore.endpoints.methods.post,
      isOnline=true)
  })
 
  componentDidMount() {
    this.kbStore.textInputRef = "topicInput"
    this.kbStore.btnIcon      = _addBtn_
  }
  
  _onPress = () => {
    if (this.kbStore.btnIcon == _addBtn_) {
      // Toggle between plus and check
      this.kbStore.btnIcon = _checkBtn_
    }
    else if (this.kbStore.btnIcon == _checkBtn_) {
      // Save the new topic to the server and also append 
      // the local copy with the result from the server, which is 
      // just a formatted topic with more fields
      if (this.kbStore.inputText != '' && this.kbStore.inputText.trim().length > 0) {
        let data = {
          topic: this.kbStore.inputText,
          userId: this.sessionStore.userId,
        }
        request(data, endpoints.knowledgeBase, endpoints.methods.post).then((rResult) =>{
          let newData = this.kbStore.data.slice(0)
          newData.unshift(rResult)
          this.kbStore.inputText = ''
          this.kbStore.data = newData
        }).catch((err)=> {
          DEBUG && console.log(err)
        })
      }
    }
    else if (this.kbStore.btnIcon == _trashBtn) {
      this._deleteTopics()
    }
  }
  

  _deleteTopics = () => {
    // make a copy of all the array data except those at the 
    // indices that have been ticked
    let newData = []
    for (index in this.kbStore.data) {
      if (!this.kbStore.tickedBoxes[index]) {
        newData.push(this.kbStore.data[index])
      } else {
        // delete it from the server
        let data = {
          userId: this.kbStore.data[index].userId,
          topicId: this.kbStore.data[index].topicId,
        }
        request(data, endpoints.knowledgeBase, endpoints.methods.delete).then((result)=> {
          DEBUG && console.log(result)
        }).catch((err)=> {
          DEBUG && console.log(err)
        })

      }
    }
    this.kbStore.data         = newData
    this.kbStore.btnIcon      = _addBtn_
    this.kbStore.tickedBoxes  = {}
  }

  _addToTicked = (index) => {
    // toggle topic tick state
    let {tickedBoxes} = this.kbStore
    if (tickedBoxes[index]) {
      delete tickedBoxes[index]
    }
    else {
      tickedBoxes[index] = true
    }
    
    let newTickboxes = JSON.parse(JSON.stringify(tickedBoxes))
    this.kbStore.tickedBoxes = newTickboxes
    this._updateBtnIcon() 
  }
  _updateBtnIcon = () => {
    if (Object.keys(this.kbStore.tickedBoxes).length > 0) {
      this.kbStore.btnIcon = _trashBtn
    }
    else { this.kbStore.btnIcon = _addBtn_
    }
  }
  _onClose = () => {
    this.kbStore.btnIcon = _addBtn_
  }
  _onChangeText = (text) => {
    this.kbStore.inputText = text
  }

  _renderTopic = ({item, index, _separators}) => {
    return (
      <View style={styles.row}> 
          <Grid>
              <Col style={styles.leftCol}>
                <Checkbox 
                    index={index}
                    callback={() => this._addToTicked(index)}
                    />   
              </Col>
              <Col style={styles.rightCol}>
              <Text style={styles.item}>{item.topic}</Text>
              </Col>
          </Grid>
      </View>
    ); 
  }
 
  /**
   * Redner a placeholder only if the data array is empty and 
   * the server has already been checked for existing topics. 
   * Otherwise, just render a white screen.
   */
  _renderPlaceholder = () => {
    if (this.kbStore.data.length == 0) {
      return ( 
        <PlaceHolder/>
      );
    }
    return null
  }
  render() { 
      return (
        <View style={globalStyles.container}>
           <Text style={globalStyles.tabHeader}>{HEADER}</Text>
           {this._renderPlaceholder()}
           <View style={styles.container}>
           <FlatList
                  keyExtractor={item => item.topicId}
                  showsVerticalScrollIndicator={false}
                  extraData={this.kbStore}
                  data={this.kbStore.data}
                  renderItem={this._renderTopic}/>
              <TopicInput 
                  showBox={this.kbStore.btnIcon == _checkBtn_}
                  onSubmit={this._onPress}
                  _onChangeText={this._onChangeText}
                  _onClose={this._onClose}
                  _value={this.kbStore.inputText}
                  />
            </View>
           <CircularButton icon={this.kbStore.btnIcon} _onPress={this._onPress}/>
        </View>
      );
    }
  }
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 30,
      justifyContent: 'center',
      alignContent: 'center',
      backgroundColor: 'transparent',
    },
    row: {
      flexDirection: 'row',
      paddingTop: 8,
      paddingBottom: 8,
    },
      innerViewLeft: {
        backgroundColor: "#e8491b",
        borderColor: "#e8491b",
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
        paddingLeft: 20,
        paddingRight: 10,
      },
      outerViewLeft: {
        backgroundColor: 'white',
        alignItems: 'flex-start',
        flexDirection: 'row',
        marginTop: 30,
        paddingBottom: 10
      },
      item: {
        fontSize: 18,
        color: 'black',
        paddingLeft: 10,
      },
      leftCol: {
        width: '10%'
      },
      rightCol: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingRight: 5,
        paddingTop: 2,
      },
  });