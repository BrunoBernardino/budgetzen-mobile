import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconButtonProps {
  style?: any;
  icon: string;
  size: number;
  color: string;
  onPress: () => void;
}
interface IconButtonState {}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  button: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

class IconButton extends Component<IconButtonProps, IconButtonState> {
  onPress = () => {
    this.props.onPress();
  };

  render() {
    const { style, icon, size, color } = this.props;
    return (
      <View style={style ? [styles.container, style] : [styles.container]}>
        <TouchableOpacity style={styles.button} onPress={this.onPress}>
          <Ionicons name={icon} size={size} color={color} />
        </TouchableOpacity>
      </View>
    );
  }
}

export default IconButton;
