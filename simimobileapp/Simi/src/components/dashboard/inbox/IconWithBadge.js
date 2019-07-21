import React, {Component} from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {observer,inject} from 'mobx-react';

@inject('rootStore')
@observer
export default class IconWithBadge extends Component {
  iStore = this.props.rootStore.inboxStore
  render() {
      const { name, color, size } = this.props;
      return (
        <View style={{ width: 24, height: 24, margin: 5 }}>
          <Icon name={name} size={size} color={color} />
          { this.iStore.unreadCount > 0 && (
            <View style={{
              position: 'absolute',
              right: -6,
              top: -3,
              backgroundColor: 'red',
              borderRadius: 6,
              width: 20,
              height: 14,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ 
                  color: 'white', 
                  fontSize: 10, 
                  fontWeight: 'bold' }}>
                  {this.iStore.unreadCount > 99 ? "99+" : this.iStore.unreadCount}</Text>
            </View>
          )}
        </View>
      );
    }
  }