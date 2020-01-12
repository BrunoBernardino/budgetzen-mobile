import React from 'react';
import { StyleSheet, Text, SafeAreaView } from 'react-native';

interface NotificationProps {
  isShowing?: boolean;
  message: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 5,
  },

  visible: {
    display: 'flex',
  },

  text: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

const Loading: React.SFC<NotificationProps> = (
  props: NotificationProps,
): JSX.Element => {
  return (
    <SafeAreaView
      style={
        props.isShowing
          ? [styles.container, styles.visible]
          : [styles.container]
      }
    >
      <Text style={styles.text}>{props.message}</Text>
    </SafeAreaView>
  );
};

Loading.defaultProps = {
  isShowing: false,
};

export default Loading;
