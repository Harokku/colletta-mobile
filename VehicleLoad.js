import React, { Component } from 'react'
import { View, Text } from 'react-native'

const styles = {
  /*container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },*/
  mainText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#8196FF',
    textDecorationLine: 'underline'
  }
}

export default class VehicleLoad extends Component {
  constructor(props){
    super(props)
  }

  render() {

    return (
      <View style={styles.container}>
        <Text>Caricati
          <Text style={styles.mainText}> {this.props.vehicle.actualLoad} </Text>
          su
          <Text style={styles.mainText}> {this.props.vehicle.tmfl - this.props.vehicle.tare} </Text>Kg
        </Text>
        <Text>Percentuale di carico:
          <Text style={styles.mainText}> {Math.round(this.props.vehicle.actualLoad / (this.props.vehicle.tmfl - this.props.vehicle.tare) * 100)} </Text>%
        </Text>
        <Text>Carico disponibile:
          <Text style={styles.mainText}> {this.props.vehicle.tmfl - this.props.vehicle.tare - this.props.vehicle.actualLoad} </Text> Kg
        </Text>
      </View>
    )
  }
}
