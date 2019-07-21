import React, {Component} from 'react';
import { WebView } from 'react-native-webview';


export default class WebViewLoader extends Component {
  render() {
      let url = this.props.navigation.getParam("url")
    return <WebView source={{ uri: url }} />
  }
}