import React from 'react';
import {StyleSheet} from 'react-native';
import { StackNavigator } from 'react-navigation'
import {ApolloProvider, createNetworkInterface, ApolloClient} from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import VehicleList from './VehicleList'
import RetireManager from './RetireManager'
import MessagesList from './MessagesList'


const NavigationApp = StackNavigator({
  Home: {screen: VehicleList},
  Retire: {screen: RetireManager},
  Messages: {screen: MessagesList},
});

export default class extends React.Component {

 constructor(...args) {
   super(...args);

   const networkInterface = createNetworkInterface({
     uri: 'https://api.graph.cool/simple/v1/cj89ot70n053c0122icvpl52q'
   });

   const wsClient = new SubscriptionClient('wss://subscriptions.graph.cool/v1/cj89ot70n053c0122icvpl52q', {
     reconnect: true,
   });

   const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
     networkInterface,
     wsClient,
   );

   this.client = new ApolloClient({
     networkInterface: networkInterfaceWithSubscriptions
   });
 }

 render() {
   return (
     <ApolloProvider client={this.client}>
       <NavigationApp/>
     </ApolloProvider>
   )
 }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
