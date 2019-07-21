import React, {Component} from 'react';
import { View } from 'react-native';
import ChatMessageList from '../../chat/ChatMessageList';

export default class ChatLog extends Component<Props> {
 
    render() {
        return (
            <View style={{flex: 1, paddingBottom: 0, marginTop: -30}}>
                <ChatMessageList isChatLog={true}/>
            </View>
        );
      }
    }