import React, {Component} from 'react';
import Dialog from "react-native-dialog";
import {observer,inject} from 'mobx-react';
import AsyncStorage from '@react-native-community/async-storage';
import strings from "../../../assets/en/json/strings.json";
import LogoutIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {    
    StyleSheet, 
    View,
} from 'react-native';
import { userIsOnline } from "../../../api/api";

const LOGOUT_DESC = strings.inbox.logoutDesc;
const LOGOUT = strings.inbox.logout;
const CANCEL = strings.global.cancel;

@inject('rootStore')
@observer
export default class LogoutButton extends Component<Props> {
    qStore = this.props.rootStore.questionStore
    sessionStore = this.props.rootStore.sessionStore

    showLogoutDialog = () => { this.qStore.showLogoutDialog = true }
    hideLogoutDialog = () => { this.qStore.showLogoutDialog = false }
    logout = () => {
        this.sessionStore.userId = null
        AsyncStorage.removeItem("userId")
        userIsOnline(this.sessionStore.userId, 
            this.sessionStore.endpoints.user, 
            this.sessionStore.endpoints.methods.post,
            isOnline=false)
        this.props.onPress()
    }

    render() {
        return(
            <View style={styles.container}>
              <Dialog.Container visible={this.qStore.showLogoutDialog}>
                <Dialog.Description>
                  {LOGOUT_DESC}
                </Dialog.Description>
                <Dialog.Button 
                    label={CANCEL} 
                    onPress={this.hideLogoutDialog}
                    />
                <Dialog.Button 
                    label={LOGOUT} 
                    onPress={this.logout}
                    />
              </Dialog.Container>
              <LogoutIcon name="logout" size={20} color="#cccccc" onPress={this.showLogoutDialog}/>
            </View>
        )}
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop: -30,
        justifyContent: 'flex-end',
        alignContent: 'flex-start',
        paddingRight: 20,

    },
})