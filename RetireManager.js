import React, {Component} from 'react'
import {View, Text, Button} from 'react-native'
import {graphql, gql, compose} from 'react-apollo';
import {KeepAwake, Constants, Location, Permissions} from 'expo'

import VehicleLoad from './VehicleLoad'
import MarketsList from './MarketsList'
import LoadInput from './LoadInput'
import InstaMessage from './InstaMessage'

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

const kgPerPkg = 20;
const hQID = 'cj916fo3w4oxa018137w05hh3';

// TODO: Clean up the code mess
class RetireManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMarket: '',
      selectedVehicle: {},
      loadInput: 0,
      showNewMessage: false,
      location: null,
      milad: null,
      errorMessage: null,
    }
  }

  static navigationOptions = {
    title: 'Gestione ritiro'
  };

  handleMarketSelection = (selectedMarket) => {
    this.setState({selectedMarket: selectedMarket})
  }

  handleLoadInputChange = (loadInput, measureUnit) => {
    const convertedInput = measureUnit === 'pkg' ? loadInput * kgPerPkg : loadInput;
    const parsedInput = parseFloat(convertedInput);
    if (!isNaN(parsedInput) && convertedInput !== '' || convertedInput === 0) {
      this.setState({loadInput: parsedInput})
    }
    else {
      this.setState({loadInput: 0})
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.vehicleData.networkStatus === 7 && this.props.vehicleData.loading) {
      this.setState({selectedVehicle: nextProps.vehicleData.Vehicle})
    }
    if (nextProps.messageData.allInstaMessages && this.props.messageData.allInstaMessages) {
      if (nextProps.messageData.allInstaMessages.length > this.props.messageData.allInstaMessages.length) {
        this.setState({
          showNewMessage: true,
        })
      }
    }
  }


  handleLoadSubmit = async () => {
    await this.props.postCollectMutation({
      variables: {
        loadedQty: this.state.loadInput,
        tripNumber: this.props.vehicleData.Vehicle.collects[0].tripNumber,
        supermarket: this.state.selectedMarket,
        vehicle: this.state.selectedVehicle.id,
        actualLoad: this.props.vehicleData.Vehicle.actualLoad + this.state.loadInput
      }
    })
      .then(
        this.setState({
          loadInput: 0
        })
      )

  }

  // Mutation for vehicle unload at delivery
  // Drop load at delivery point and create new DB state for new trip
  // FIXME: Check promise rejection
  handleUnloadSubmit = async () => {
    /*console.log(this.state.selectedVehicle)
    console.log(this.props.vehicleData)
    console.log(hQID)
    console.log(this.props.vehicleData.Vehicle.collects[0].tripNumber + 1)*/
    // Put actual load in vehicle's delivery stack
    try {
      await this.props.postDeliveryMutation({
        variables: {
          vehicleId: this.state.selectedVehicle.id,
          deliveredQty: this.props.vehicleData.Vehicle.actualLoad,
          tripNumber: this.props.vehicleData.Vehicle.collects[0].tripNumber,
        }
      })
      // Reset vehicle load and initialize a new trip
      await this.props.postCollectMutation({
        variables: {
          loadedQty: 0, // New trip start with no load
          tripNumber: this.props.vehicleData.Vehicle.collects[0].tripNumber + 1, // Trip number is incremented
          supermarket: hQID,  // New trip starting point set to HQ ID
          vehicle: this.state.selectedVehicle.id,
          actualLoad: 0,  // Vehicle load is set to 0 since it unloaded al delivery point
        }
      })
        .then(
          this.setState({
            loadInput: 0
          })
        )
    } catch (err) {
      console.log("UnloadSubmit failed, error:")
      console.log(err)
    }
  }

  updateVehiclePosition = async (coords) => {
    try {
      await this.props.updateVehiclePosition({
        variables: {
          vehicle: this.state.selectedVehicle.id,
          lat: coords.latitude,
          lon: coords.longitude,
          speed: coords.speed,
        }
      })
    } catch (err) {
      console.log(err)
    }
  }

  // TODO: Implement unload method

  showNewMessage = (messages) => {
    return <InstaMessage message={messages[0]} visible={this.state.showNewMessage}
                         handleVisibilityChange={this.handleNewMessageVisibility}/>
  }

  handleNewMessageVisibility = async (id) => {
    this.setState({
      showNewMessage: !this.state.showNewMessage,
    })
    await this.props.setMessageReaded({
      variables: {
        messageId: id,
      }
    })
  }

  subscribeToNewMessages = () => {
    this.props.messageData.subscribeToMore({
      document: gql`
          subscription {
              InstaMessage(filter: {
                  mutation_in: [CREATED]
              }) {
                  node {
                      id
                      message
                      createdAt
                      isRead
                      vehicle{
                          id
                      }
                  }
              }
          }
      `,
      updateQuery: (previous, {subscriptionData}) => {
        if (subscriptionData.data.InstaMessage.node.vehicle.id === this.state.selectedVehicle.id) {
          const newAllMessages = [
            subscriptionData.data.InstaMessage.node,
            ...previous.allInstaMessages,
          ];
          return {
            ...previous,
            allInstaMessages: newAllMessages,
          }
        } else {
          return previous
        }
      }
    })
  };

  handleShowMessages = () => {
    this.props.navigation.navigate('Messages', {selectedVehicle: this.state.selectedVehicle.id})
  }

  async componentWillMount() {
    //  this._getLocationAsync();
    await Expo.Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
    });

    this.askForPermission()
    const testlocation = Expo.Location.watchPositionAsync({
      enableHighAccuracy: true,
      distanceInterval: 1000
    }, (loc) => {
      console.log(loc)
      if (loc.coords) {
        if (this.state.selectedVehicle) {
          this.updateVehiclePosition(loc.coords)
        }
      }
      else {
        console.log("nooooooooooooooooo loc");
      }
    });
    //}
  }

  askForPermission = async () => {
    const {status} = await Permissions.askAsync(Permissions.LOCATION);
    console.log(status)
    return status
  }

  componentDidMount() {
    this.subscribeToNewMessages();
  }


  render() {
    const {params} = this.props.navigation.state

    if (this.props.vehicleData && this.props.vehicleData.loading) {
      return (
        <View style={styles.container}>
          <Text>Loading your vehicleData...</Text>
        </View>
      )
    }

    if (this.props.vehicleData && this.props.vehicleData.error) {
      return (
        <View style={styles.container}>
          <Text>Error loading interface, please restart</Text>
        </View>
      )
    }

    const vehicle = this.props.vehicleData.Vehicle;
    const messages = this.props.messageData.allInstaMessages;

    return (
      <View style={styles.container}>
        <KeepAwake/>
        <Button
          onPress={this.handleShowMessages}
          title='Mostra messaggi'/>
        {messages ? this.showNewMessage(messages) : null}
        <Text style={styles.mainText}>Mezzo: {vehicle.radioCode}</Text>
        <VehicleLoad vehicle={vehicle}/>
        <LoadInput measureUnit={'kg'} text={this.state.loadInput.toString()} onTextChange={this.handleLoadInputChange}/>
        <LoadInput measureUnit={'pkg'} text={(this.state.loadInput / kgPerPkg).toString()}
                   onTextChange={this.handleLoadInputChange}/>
        <MarketsList selectedMarket={this.state.selectedMarket} onSelMarketChange={this.handleMarketSelection}/>
        <View style={styles.buttonsItem}>
          <Button
            onPress={this.handleLoadSubmit}
            title='Conferma Carico'
            color='#4FFF3B'
          />
          <Button
            onPress={this.handleUnloadSubmit}
            title='Scarica a magazzino'
            color='#FF280E'
          />
        </View>
      </View>
    )
  }
}

// TODO: Add subscription to recieve incoming messages
const GET_VEHICLE_DATA = gql`
    query VehicleData ($id: ID!) {
        Vehicle(id: $id) {
            id
            radioCode
            tare
            tmfl
            actualLoad
            collects (orderBy: tripNumber_DESC first: 1) {
                tripNumber
            }
        }
    }
`

const GET_MESSAGES_DATA = gql`
    query MessagesForVehicle ($id: ID!) {
        allInstaMessages(filter: {
            vehicle: {
                id: $id
            }
        }, orderBy: createdAt_DESC,
            first: 1)
        {
            id
            message
            createdAt
            isRead
            vehicle{
                id
            }
        }
    }
`

const SET_MESSAGE_READED = gql`
    mutation SetMessageReaded ($messageId: ID!) {
        updateInstaMessage(
            id: $messageId
            isRead: true
        ) {
            id
        }
    }
`

const UPDATE_VEHICLE_POSITION = gql`
    mutation UpdateVehicleMutation ($vehicle: ID!, $lat: Float!, $lon: Float!, $speed:Float!) {
        updateVehicle(
            id: $vehicle
            latitude: $lat
            longitude: $lon
            speed: $speed
        ) {
            id
        }
    }

`

const POST_COLLECT_MUTATION = gql`
    mutation CreateCollectMutation ($loadedQty: Float!, $tripNumber: Int!, $supermarket: ID!, $vehicle: ID!, $actualLoad: Float!) {
        createCollect(
            loadedQty: $loadedQty,
            tripNumber: $tripNumber,
            supermarketId: $supermarket,
            vehicleId: $vehicle,
        ) {
            id
            loadedQty
            tripNumber
            createdAt
            supermarket {
                city
                address
            }
            vehicle {
                radioCode
            }
        }
        updateVehicle(
            id: $vehicle
            actualLoad: $actualLoad
        ) {
            id
            actualLoad
        }
    }
`

// TODO: Complete mutation with collect adn vehicle data reset
const POST_DELIVERY_MUTATION = gql`
    mutation CreateDeliveryMutation ($vehicle: ID!, $deliveredQty: Float!, $tripNumber: Int!) {
        createDelivery(
            vehicleId: $vehicle,
            deliveredQty: $deliveredQty,
            tripNumber: $tripNumber,
        ) {
            id
            createdAt
            deliveredQty
            tripNumber
            vehicle {
                id
            }
        }
    }
`


export default compose(
  graphql(GET_VEHICLE_DATA, {
    name: 'vehicleData',
    options: (ownProps) => ({variables: {id: ownProps.navigation.state.params.selectedVehicle}})
  }),
  graphql(GET_MESSAGES_DATA, {
    name: 'messageData',
    options: (ownProps) => ({variables: {id: ownProps.navigation.state.params.selectedVehicle}})
  }),
  graphql(UPDATE_VEHICLE_POSITION, {name: 'updateVehiclePosition'}),
  graphql(SET_MESSAGE_READED, {name: 'setMessageReaded'}),
  graphql(POST_COLLECT_MUTATION, {name: 'postCollectMutation'}),
  graphql(POST_DELIVERY_MUTATION, {name: 'postDeliveryMutation'}),
)(RetireManager)