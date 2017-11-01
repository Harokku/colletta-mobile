import React, {Component} from 'react'
import {View, Text, Button, Modal} from 'react-native'
import PropTypes from 'prop-types'
import moment from "moment";

const styles = {
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  mainText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#8196FF',
    textDecorationLine: 'underline',
  },
  evenItem: {
    flexGrow: 1,
  },
  bigItem: {
    flexGrow: 2,
  },
  buttonsItem: {
    flexDirection: 'row',
    flexGrow: 0,
  },
}

export default class InstaMessage extends Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  handleVisibilityChange = () => {
    this.props.handleVisibilityChange(this.props.message.id)
  }

  render() {
    if (!this.props.message) {
      return (
        <Modal
          animationType='fade'
          transparent={false}
          visible={this.props.visible}
          onRequestClose={this.props.handleVisibilityChange}
        >
          <View style={styles.container}>
            <Text style={styles.mainText}>No new messages</Text>
            <Button onPress={this.handleVisibilityChange} title='Letto'/>
          </View>
        </Modal>
      )
    }

    return (
      <Modal
        animationType='fade'
        transparent={false}
        visible={this.props.visible}
        onRequestClose={this.props.handleVisibilityChange}>
        <View style={styles.container}>
          <Text style={styles.mainText}>Ricevuto {moment(this.props.message.createdAt).fromNow().toString()}</Text>
          <Text>{this.props.message.message}</Text>
          <Button onPress={this.handleVisibilityChange} title='Letto'/>
        </View>
      </Modal>
    )
  }
}

InstaMessage.propTypes = {
  visible: PropTypes.bool.isRequired,
  message: PropTypes.object,
  handleVisibilityChange: PropTypes.func.isRequired,
}