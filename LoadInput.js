import React from 'react'
import {View, Text, TextInput} from 'react-native'
import PropTypes from 'prop-types'

const measureUnitsEnum = {
  kg: 'Kili',
  pkg: 'Pacchi',
}

const styles = {
  textInput: {
    height: 40,
    borderBottomColor: '#8196FF',
    textAlign: 'center',
    borderWidth: 2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
  }
}

function LoadInput(props) {
  const measureUnit = props.measureUnit;

  return(
    <View>
      <Text>Inserisci il totale caricato in {measureUnitsEnum[measureUnit]}</Text>
      <TextInput
        style={styles.textInput}
        caretHidden={false}
        keyboardType={'numeric'}
        maxLength={5}
        value={props.text}
        onChangeText={(text) => props.onTextChange(text, measureUnit)}
      />
    </View>
  )
}

LoadInput.propTypes = {
  measureUnit: PropTypes.oneOf(['kg', 'pkg']).isRequired,
};

export default LoadInput