import React, {Component} from 'react'
import {Picker} from 'react-native';
import {graphql, gql} from 'react-apollo';
import {Container, Text, Button, Icon} from 'native-base'

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

class VehicleList extends Component {
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
    if (nextProps.data.networkStatus === 7 && this.props.data.loading) {
      if (this.state.selectedVehicle === '') {
        this.setState({selectedVehicle: nextProps.data.allVehicles[0].id})
      }
    }
  }

  async componentWillMount() {
    await Expo.Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    });
  }

  onVehicleClick = () => {
    console.log('Navigating to management stack...')
    this.props.navigation.navigate('Retire', {selectedVehicle: this.state.selectedVehicle})
  };

  render() {
    const {navigate} = this.props.navigation;

    if (this.props.data && this.props.data.loading) {
      return (
        <Container style={styles.container}>
          <Text>Loading your data...</Text>
        </Container>
      )
    }

    if (this.props.data && this.props.data.error) {
      return (
        <Container style={styles.container}>
          <Text>Error loading interface, please restart</Text>
        </Container>
      )
    }

    const vehiclesToList = this.props.data.allVehicles;

    return (
      <Container style={styles.container}>
          <Text>Seleziona il tuo veicolo</Text>
          <Picker
            style={{width: 300, height: 300}}
            selectedValue={this.state.selectedVehicle}
            onValueChange={(itemValue, itemIndex) => this.setState({selectedVehicle: itemValue})}
          >
            {vehiclesToList.map(vehicle => (
              <Picker.Item key={vehicle.id} label={vehicle.radioCode} value={vehicle.id}/>
            ))}
          </Picker>
          <Button iconRight block success transparent
                  onPress={this.onVehicleClick}
          >
            <Text>Conferma veicolo</Text>
            <Icon name='arrow-forward'/>
          </Button>
      </Container>
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