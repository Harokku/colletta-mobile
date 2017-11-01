import React, {Component} from 'react'
import {Button, Picker, Text, View} from 'react-native';
import {graphql, gql} from 'react-apollo';
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


class MessagesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVehicle: null,
    }
  }

  static navigationOptions = {
    title: 'Msg da Coordinamento'
  };

  subscribeToNewMessages = () => {
    this.props.messagesData.subscribeToMore({
      document: gql`
          subscription {
              InstaMessage(filter: {
                  mutation_in: [CREATED]
              }) {
                  node{
                      id
                      message
                      createdAt
                  }
              }
          }
      `,
      updateQuery: (previous, {subscriptionData}) => {
        const newAllMessages = [
          subscriptionData.data.InstaMessage.node,
          ...previous,
        ];
        return {
          ...previous,
          allInstaMessages: newAllMessages,
        }
      }
    })
  };

  componentDidMount() {
    this.subscribeToNewMessages;
  }

  render() {
    const {params} = this.props.navigation.state;

    if (this.props.messagesData && this.props.messagesData.loading) {
      return (
        <View style={styles.container}>
          <Text>Loading your messagesData...</Text>
        </View>
      )
    }

    if (this.props.messagesData && this.props.messagesData.error) {
      return (
        <View style={styles.container}>
          <Text>Error loading interface, please restart</Text>
        </View>
      )
    }

    const messages = this.props.messagesData.allInstaMessages;

    const messagesList = messages.map(message => {
      return (
        <View key={message.id}>
          <Text>Ricevuto alle: {moment(message.createdAt).format("kk:mm").toString()}</Text>
          <Text>({moment(message.createdAt).fromNow().toString()})</Text>
          <Text style={styles.mainText}>{message.message}</Text>
        </View>
      )
    })

    return (
      <View style={styles.container}>
        {messagesList}
      </View>
    )
  }
}

const GET_MESSAGES_DATA = gql`
    query MessagesForVehicle ($id: ID!) {
        allInstaMessages(filter: {
            vehicle: {
                id: $id
            }
        }, orderBy: createdAt_DESC,
            first: 3)
        {
            id
            message
            createdAt
        }
    }
`

export default graphql(GET_MESSAGES_DATA, {
  name: 'messagesData',
  options: (ownProps) => ({variables: {id: ownProps.navigation.state.params.selectedVehicle}})
})(MessagesList)