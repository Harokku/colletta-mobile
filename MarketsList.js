import React, {Component} from 'react'
import { View, Text, Picker} from 'react-native'
import { graphql, gql} from 'react-apollo'

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
  },
}



class MarketsList extends Component {
  constructor(props) {
    super(props)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data.networkStatus === 7 && this.props.data.loading) {
      if (this.props.selectedMarket === '') {
        this.props.onSelMarketChange(nextProps.data.allSupermarkets[0].id)
      }
    }
  }

  render() {
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

    const marketsToList = this.props.data.allSupermarkets


    return (
      <View>
        <Picker
          style={{width: 300}}
          selectedValue={this.props.selectedMarket}
          onValueChange={(itemValue, itemIndex) => this.props.onSelMarketChange(itemValue)}
        >
          {marketsToList.map(market => (
            <Picker.Item key={market.id} label={market.city + ' - ' + market.name} value={market.id}/>
          ))}
        </Picker>
      </View>
    )
  }
}

const GET_MARKETS = gql`
  query getMarkets{
    allSupermarkets (orderBy: city_ASC) {
      id
      city
      name
    }
  }`

export default graphql(GET_MARKETS)(MarketsList)