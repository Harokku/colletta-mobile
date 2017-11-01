import React, {Component} from 'react'
import { Button, Picker, Text, View} from 'react-native';
import { graphql, gql } from 'react-apollo';

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: {
    fontWeight: 'bold',
    fontSize: 20
  }
}

class VehicleList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      selectedVehicle: ''
    }
  }

  static navigationOptions = {
    title: 'Select Vehicle'
  };

  componentWillReceiveProps(nextProps) {
    if(nextProps.data.networkStatus === 7 && this.props.data.loading) {
      if (this.state.selectedVehicle === ''){
        this.setState({selectedVehicle: nextProps.data.allVehicles[0].id})
      }
    }
  }

  onVehicleClick = () => {
    console.log('Navigating to management stack...')
    this.props.navigation.navigate('Retire', {selectedVehicle: this.state.selectedVehicle})
  };

  render() {
    const { navigate } = this.props.navigation;

    if (this.props.data && this.props.data.loading) {
      return (
        <View style={styles.container}>
          <Text>Loading your data...</Text>
        </View>
      )
    }

    if (this.props.data && this.props.data.error) {
      return (
        <View style={styles.container}>
          <Text>Error loading interface, please restart</Text>
        </View>
      )
    }

    const vehiclesToList = this.props.data.allVehicles;

    return (
      <View style={styles.container}>
        <Text style={styles.mainText}>Seleziona il tuo veicolo</Text>
        <Picker
          style={{width: 300}}
          selectedValue={this.state.selectedVehicle}
          onValueChange={(itemValue, itemIndex) => this.setState({selectedVehicle: itemValue})}
        >
          {vehiclesToList.map(vehicle => (
            <Picker.Item key={vehicle.id} label={vehicle.radioCode} value={vehicle.id}/>
          ))}
        </Picker>
        <Button
          title='Conferma'
          color='#4FFF3B'
          onPress={this.onVehicleClick}
        />
      </View>
    )
  }
}

export default graphql(gql`
   query getVehicles {
    allVehicles{
      id
      radioCode
    }
  }
`)(VehicleList)