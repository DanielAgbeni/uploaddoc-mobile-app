import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from '../types/navigation.types';

const prefix = Linking.createURL('/');

export const linkingConfig: LinkingOptions<RootStackParamList> = {
  prefixes: [
    prefix,
    'uploaddoc://',
    'https://uploaddoc.app',
    'https://*.uploaddoc.app',
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          SignIn: 'signin',
          SignUp: 'signup',
          ForgotPassword: 'forgot-password',
        },
      },
      Main: {
        screens: {
          DocumentsTab: {
            screens: {
              DocumentsList: 'documents',
              SubmitDocument: 'documents/submit',
            },
          },
          VendorsTab: {
            screens: {
              VendorsList: 'vendors',
              VendorDetails: 'vendors/:vendorId',
            },
          },
          DashboardTab: 'dashboard',
          AccountTab: {
            screens: {
              Profile: 'account',
              EditProfile: 'account/edit',
              TransactionHistory: 'account/transactions',
              Settings: 'account/settings',
            },
          },
        },
      },
    },
  },
};
