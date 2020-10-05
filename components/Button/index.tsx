import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';

interface ButtonProps {
  style?: any;
  text: string;
  onPress: () => void;
  type: 'primary' | 'secondary' | 'delete';
  isDisabled?: boolean;
}
interface ButtonState {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 5,
    minWidth: '50%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
  },
  secondary: {
    backgroundColor: '#666',
  },
  delete: {
    backgroundColor: '#930',
  },
});

class Button extends Component<ButtonProps, ButtonState> {
  onPress = () => {
    this.props.onPress();
  };

  render() {
    const { text, type, style, isDisabled } = this.props;
    return (
      <View style={style ? [styles.container, style] : [styles.container]}>
        <TouchableOpacity
          disabled={isDisabled}
          style={
            type === 'primary' ? [styles.button] : [styles.button, styles[type]]
          }
          onPress={this.onPress}
        >
          <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

export default Button;
