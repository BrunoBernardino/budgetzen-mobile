import React, { ReactNode } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Modal,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import IconButton from '../IconButton';

interface BasicModalProps {
  isVisible: boolean;
  isSubmitting?: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  children: ReactNode;
}

// TODO: Get these colors from the withLayout, according to the light/dark mode
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000',
  },

  headerContainer: {
    flexDirection: 'row',
    backgroundColor: '#000',
  },

  headerButton: {
    color: '#fff',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  scrollContent: {
    paddingBottom: 40,
  },
});

const BasicModal: React.SFC<BasicModalProps> = (
  props: BasicModalProps,
): JSX.Element => {
  const { isVisible, isSubmitting, onDismiss, onConfirm, children } = props;
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isVisible}
      onRequestClose={() => {}}
    >
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <SafeAreaView style={styles.wrapper} removeClippedSubviews={false}>
        <View style={styles.headerContainer} removeClippedSubviews={false}>
          {!isSubmitting && (
            <>
              <IconButton
                icon="ios-arrow-round-back"
                size={42}
                color={styles.headerButton.color}
                onPress={onDismiss}
                style={[styles.headerButton, { alignItems: 'flex-start' }]}
              />
              <IconButton
                icon="ios-checkmark"
                size={42}
                color={styles.headerButton.color}
                onPress={onConfirm}
                style={[styles.headerButton, { alignItems: 'flex-end' }]}
              />
            </>
          )}
          {isSubmitting && (
            <View
              style={{
                alignItems: 'flex-end',
                flex: 1,
                justifyContent: 'center',
                height: 55,
                marginRight: 20,
              }}
            >
              <ActivityIndicator
                color={styles.headerButton.color}
                size="small"
                animating
              />
            </View>
          )}
        </View>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          removeClippedSubviews={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

BasicModal.defaultProps = {
  isSubmitting: false,
};

export default BasicModal;
