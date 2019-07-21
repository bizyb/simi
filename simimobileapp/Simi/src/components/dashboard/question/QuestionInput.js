import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, KeyboardAvoidingView} from 'react-native';
import Logo from '../../login/Logo';
import strings from "../../../assets/en/json/strings.json";
import {observer, inject} from 'mobx-react';
import  { request, join, userIsOnline } from "../../../api/api";
import { DEBUG } from "../../../../settings";

let PLACEHOLDER =  strings.ask.placeholder; 
let DESCRIPTION =  strings.ask.description;
let MAX_LENGTH = 146

@inject('rootStore')
@observer
export default class QuestionInput extends Component<Props> {
    qStore = this.props.rootStore.questionStore
    sessionStore = this.props.rootStore.sessionStore
    focusListener = this.props.navigation.addListener("didFocus", () => {
        // The screen is focused
        this.qStore.formattedUserCount = this.formattedUserCount()
        userIsOnline(this.sessionStore.userId, 
            this.sessionStore.endpoints.user, 
            this.sessionStore.endpoints.methods.post,
            isOnline=true)
        this.usersOnline()
    })

      usersOnline = () => {
        request({}, this.sessionStore.endpoints.user, this.sessionStore.endpoints.methods.get).then((result) => {
            this.qStore.usersOnline = result.count
            this.qStore.formattedUserCount = this.formattedUserCount()
        }).catch((err) => {
            DEBUG && console.log(err)
        })
        

    }

    formattedUserCount = () => {
        if (this.qStore.usersOnline == 1) {
            return "1 user online"
        } else if (this.qStore.usersOnline == -1) {
            return ""
        }
        let numberString = this.qStore.usersOnline + ""
        numberString = numberString.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        return numberString + " users online"
    }
    
    onChangeText = (text) => {
        this.qStore.question = text 
        this.qStore.value = text
    }

    /**
     * Upon submission, call the server to start matching and advertising 
     * the question to SMEs. Save the resulting questionId to the store.
     * 
     * Use questionId as roomId to create a unique chat room. That way, a 
     * user can use the app on multiple devices and have simultaneous chats.
     * Although this is not an offering, using userId as roomId makes less 
     * sense because questionId is the only thing in commong between op 
     * and sme. 
     */
    onSubmit = () => {
        this.sessionStore.isOp = true
        this.sessionStore.isSme = false
        if (this.qStore.question.trim().length > 0) {
            let data = {
                question: this.qStore.question,
                userId: this.sessionStore.userId,
            }
            this.qStore.value = this.qStore.question
            request(data, this.sessionStore.endpoints.question, this.sessionStore.endpoints.methods.post).then((result) => {
                this.qStore.questionId = result.questionId
                join(this.sessionStore, this.qStore)
                this.props.navigation.navigate("ChatRoom")
            }).catch((err) => {
                DEBUG && console.log(err)
            })
            
        } 
    }
    componentWillUnmount() {
        if (this.sessionStore.isOp) {
            this.qStore.value = this.qStore.question
        }
        
    }
    render() {
        return (

            <View style={styles.container}>
                    <KeyboardAvoidingView behavior="position">
                    <View style={styles.logoContainer}>
                        <Logo />
                    </View>
                    <View style={styles.inputBoxContainer}>
                        <TextInput 
                                style={styles.inputBox}
                                onChangeText={text=>this.onChangeText(text)}
                                onSubmitEditing={this.onSubmit}
                                value={this.qStore.value}
                                maxLength={MAX_LENGTH} 
                                placeholder={PLACEHOLDER}/>
                    </View>
                    </KeyboardAvoidingView>
                    <View style={styles.description}>
                        <Text style={styles.description}>
                            {DESCRIPTION}
                        </Text>
                    </View>
                    <View style={styles.userCount}>
                        <Text style={styles.userCount}>{this.qStore.formattedUserCount}</Text>
                    </View>
                   
            </View>
        )}
    }

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignContent: 'center',

        },
        logoContainer: {
            flex: 1,
            justifyContent: 'flex-start',
            alignContent: "flex-start",
            marginTop: '40%',
        },

        inputBoxContainer: {
            width: '100%',
            height: 50,
            paddingLeft: '5%',
            paddingRight: '5%',
            marginTop: '40%',

        },
        inputBox: {
            flex: 1,
            borderWidth: 1,
            borderColor: '#dddddd',
            borderRadius: 30,
            height: 100,
            paddingLeft: 20,
            paddingRight: 20,
            fontSize: 20,
            fontWeight: '100',

        },
        description: {
            flex: 1,
            color: 'grey',
            padding: 10,
            paddingLeft: 20,
            paddingRight: 20,
            textAlign: 'center',
            justifyContent: 'flex-start',
            fontSize: 13,
        },
        userCount: {
            flex: 1,
            textAlign: 'center',
            justifyContent: 'center',
            alignContent: 'center',
            color: '#eeeeee',
            fontSize: 24,
            fontWeight: '500',
        }
        
    });