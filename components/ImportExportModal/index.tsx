import React, { Component } from 'react';
import { StyleSheet, Text, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Linking } from 'expo';

import BasicModal from '../BasicModal';
import PrimaryButton from '../Button';

import * as T from '../../lib/types';

type ImportedFileData = {
  budgets?: T.Budget[];
  expenses?: T.Expense[];
};

type ExportFileData = {
  budgets: T.Budget[];
  expenses: T.Expense[];
};

interface ImportExportModalProps {
  isVisible: boolean;
  onDismiss: () => void;
  onImportData: (
    replaceData: boolean,
    budgets: T.Budget[],
    expenses: T.Expense[],
  ) => Promise<boolean>;
  onExportData: () => Promise<ExportFileData>;
  showAlert: (title: string, message: string) => void;
}
interface ImportExportModalState {
  isSubmitting: boolean;
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

  note: {
    color: '#999',
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
    marginTop: 30,
  },

  button: {
    marginTop: 20,
  },
});

class ImportExportModal extends Component<
  ImportExportModalProps,
  ImportExportModalState
> {
  constructor(props: ImportExportModalProps) {
    super(props);

    this.state = {
      isSubmitting: false,
    };
  }

  onLearnMore = async () => {
    Linking.openURL('https://budgets.calm.sh/import-export-file-format');
  };

  onRequestImport = async () => {
    const { onImportData, onDismiss, showAlert } = this.props;
    const { isSubmitting } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return;
    }

    const importFile = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
    });

    if (importFile.type === 'cancel') {
      return;
    }

    const importFileContents = await FileSystem.readAsStringAsync(
      importFile.uri,
    );

    let importedFileData: ImportedFileData = {};

    try {
      importedFileData = JSON.parse(importFileContents);
    } catch (error) {
      importedFileData = {};
    }

    if (
      !Object.prototype.hasOwnProperty.call(importedFileData, 'budgets') &&
      !Object.prototype.hasOwnProperty.call(importedFileData, 'expenses')
    ) {
      showAlert(
        'Error!',
        'Could not parse the file. Please confirm what you chose is correct.',
      );
      return;
    }

    const budgets = importedFileData.budgets || [];
    const expenses = importedFileData.expenses || [];

    Alert.alert(
      'Merge or Replace?',
      'Do you want to merge this with your existing data, or replace it?',
      [
        {
          text: 'Wait, cancel.',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Merge',
          onPress: async () => {
            this.setState({ isSubmitting: true });
            const success = await onImportData(false, budgets, expenses);
            this.setState({ isSubmitting: false });
            if (success) {
              onDismiss();
            }
          },
          style: 'default',
        },
        {
          text: 'Replace',
          onPress: async () => {
            this.setState({ isSubmitting: true });
            const success = await onImportData(true, budgets, expenses);
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

  onRequestExport = async () => {
    const { onExportData } = this.props;
    const { isSubmitting } = this.state;

    if (isSubmitting) {
      // Ignore sequential taps
      return;
    }

    this.setState({ isSubmitting: true });

    const exportData = await onExportData();

    const exportContents = JSON.stringify(exportData, null, 2);
    const fileName = `data-export-${new Date()
      .toISOString()
      .substr(0, 19)
      .replace(/:/g, '-')}.json`;
    const destinationFileUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(destinationFileUri, exportContents);

    await Sharing.shareAsync(destinationFileUri);

    this.setState({ isSubmitting: false });
  };

  render() {
    const { isVisible, onDismiss } = this.props;
    const { isSubmitting } = this.state;

    return (
      <BasicModal
        isVisible={isVisible}
        isSubmitting={isSubmitting}
        onDismiss={onDismiss}
        onConfirm={onDismiss}
      >
        <Text style={styles.label}>Import</Text>

        <Text style={styles.note}>
          Import a JSON file exported from Budgets before.
        </Text>

        <PrimaryButton
          style={styles.button}
          type="secondary"
          text="Learn more"
          onPress={this.onLearnMore}
        />

        <PrimaryButton
          style={styles.button}
          type="secondary"
          text="Import Data"
          onPress={this.onRequestImport}
        />

        <PrimaryButton
          style={styles.button}
          type="primary"
          text="Export Data"
          onPress={this.onRequestExport}
        />
      </BasicModal>
    );
  }
}

export default ImportExportModal;
