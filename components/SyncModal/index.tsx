import React, { Component } from 'react';
import { StyleSheet, Text, TextInput, Keyboard, Alert } from 'react-native';
import { Linking } from 'expo';

import BasicModal from '../BasicModal';
import PrimaryButton from '../Button';

interface SyncModalProps {
  isVisible: boolean;
  onDismiss: () => void;
  onConfirm: (newSyncToken: string) => Promise<void>;
  onSyncRequest: () => Promise<void>;
  onDeleteData: () => Promise<boolean>;
  syncToken: string;
  lastSyncDate: string;
}
interface SyncModalState {
  isSubmitting: boolean;
  syncToken: string;
}

// TODO: Get these colors from the withLayout, according to the light/dark mode
const styles = StyleSheet.create({
  label: {
    color: '#000',
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 38,
  },

  input: {
    color: '#999',
    fontSize: 26,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 8,
  },

  redNote: {
    color: '#930',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 30,
  },

  note: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 30,
  },

  syncNote: {
    color: '#999',
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 10,
    paddingHorizontal: 10,
  },

  firstButton: {
    marginTop: 68,
  },

  button: {
    marginTop: 20,
  },

  deleteButton: {
    marginTop: 68,
  },
});

class SyncModal extends Component<SyncModalProps, SyncModalState> {
  constructor(props: SyncModalProps) {
    super(props);

    this.state = {
      isSubmitting: false,
      syncToken: props.syncToken,
    };
  }

  componentDidMount() {
    this.setState({ syncToken: this.props.syncToken });
  }

  componentDidUpdate(prevProps: SyncModalProps) {
    if (!prevProps.syncToken && this.props.syncToken) {
      this.setState({ syncToken: this.props.syncToken });
    }
  }

  onConfirm = async () => {
    const { onConfirm, onDismiss } = this.props;
    const { isSubmitting, syncToken } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return;
    }

    this.setState({ isSubmitting: true });

    await onConfirm(syncToken);

    this.setState({ isSubmitting: false });
    onDismiss();
  };

  onGetToken = async () => {
    Linking.openURL('https://budgets.calm.sh/get-sync-token');
  };

  onForceSync = async () => {
    const { onSyncRequest } = this.props;
    const { isSubmitting } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return;
    }

    this.setState({ isSubmitting: true });

    await onSyncRequest();

    this.setState({ isSubmitting: false });
  };

  requestDataDelete = () => {
    const { onDismiss, onDeleteData } = this.props;

    Alert.alert(
      'Are you sure?',
      'Are you sure you want to delete all data?\nThis action is irreversible.',
      [
        {
          text: 'No, cancel.',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Yes!',
          onPress: async () => {
            this.setState({ isSubmitting: true });
            const success = await onDeleteData();
            this.setState({ isSubmitting: false });
            if (success) {
              onDismiss();
            }
          },
          style: 'destructive',
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  render() {
    const {
      isVisible,
      onDismiss,
      lastSyncDate,
      syncToken: currentSyncToken,
    } = this.props;
    const { isSubmitting, syncToken } = this.state;

    const hasSyncEnabled = Boolean(currentSyncToken) && Boolean(lastSyncDate);

    return (
      <BasicModal
        isVisible={isVisible}
        isSubmitting={isSubmitting}
        onDismiss={onDismiss}
        onConfirm={this.onConfirm}
      >
        <Text style={styles.label}>Sync Token</Text>
        <TextInput
          placeholderTextColor="#CCC"
          style={styles.input}
          placeholder="Paste here"
          onChangeText={(text) => this.setState({ syncToken: text })}
          value={syncToken}
          autoCapitalize="none"
          autoCompleteType="off"
          keyboardType="default"
          onSubmitEditing={() => Keyboard.dismiss()}
          returnKeyType="done"
          secureTextEntry
        />

        {!hasSyncEnabled && Boolean(currentSyncToken) && (
          <>
            <Text style={styles.redNote}>
              It seems your sync token above isn't working, for some reason.
              {'\n'}Please confirm you have no extra spaces and there's no
              trailing slash.
            </Text>
          </>
        )}

        {hasSyncEnabled && (
          <>
            <Text style={styles.note}>
              Congrats on setting up a Sync Token!
            </Text>

            <Text style={styles.note}>
              The button below will open a website where you can reach me to get
              help, if you're having any issues.
            </Text>
          </>
        )}

        {!hasSyncEnabled && (
          <>
            <Text style={styles.note}>
              You can pay me a small amount yearly to get a Sync Token, or you
              can setup one yourself.
            </Text>

            <Text style={styles.note}>
              The button below will open a website where you can learn more
              about both options.
            </Text>

            <Text style={styles.note}>
              If you choose to pay for the subscription, you'll get an email
              with the Sync Token that you can paste here.
            </Text>
          </>
        )}

        <PrimaryButton
          style={[styles.button, styles.firstButton]}
          type="primary"
          text={hasSyncEnabled ? 'Get Help' : 'Get a Sync Token'}
          onPress={this.onGetToken}
        />

        {hasSyncEnabled && (
          <>
            <PrimaryButton
              style={styles.button}
              type="secondary"
              text="Force Sync Now"
              onPress={this.onForceSync}
            />

            <Text style={styles.syncNote}>Last sync: {lastSyncDate}</Text>
          </>
        )}

        <PrimaryButton
          style={styles.deleteButton}
          type="delete"
          text="Delete All Data"
          onPress={this.requestDataDelete}
        />
      </BasicModal>
    );
  }
}

export default SyncModal;
