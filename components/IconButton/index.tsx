import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconButtonProps {
  style?: any;
  icon:
    | 'ios-options-sharp'
    | 'ios-arrow-back-sharp'
    | 'ios-chevron-back-sharp'
    | 'ios-chevron-forward-sharp'
    | 'ios-checkmark';
  size: number;
  color: string;
  onPress: () => void;
}
interface IconButtonState {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 5,
  },
});

class IconButton extends Component<IconButtonProps, IconButtonState> {
  onPress = () => {
    this.props.onPress();
  };

  render() {
    const { style, icon, size, color } = this.props;
    const dimensions = { width: size, height: size };
    return (
      <View style={style ? [styles.container, style] : [styles.container]}>
        <TouchableOpacity
          style={[styles.button, dimensions]}
          onPress={this.onPress}
        >
          <Ionicons name={icon} size={size} color={color} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default IconButton;
