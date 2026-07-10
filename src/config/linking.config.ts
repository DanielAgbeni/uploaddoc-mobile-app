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
              // Primary submit route — also handles /submit shortcut
              SubmitDocument: {
                path: 'documents/submit',
                parse: {
                  vendorId: (id: string) => id,
                  vendorName: (name: string) => decodeURIComponent(name),
                  isVendorLocked: (v: string) => v === 'true',
                  sharedFileUri: (uri: string) => decodeURIComponent(uri),
                  sharedFileName: (name: string) => decodeURIComponent(name),
                  sharedFileMimeType: (type: string) => decodeURIComponent(type),
                },
              },
              Notifications: 'documents/notifications',
            },
          },
          VendorsTab: {
            screens: {
              VendorsList: 'vendors',
              VendorDetails: 'vendors/:vendorId',
              // So vendor-scoped deep links also resolve to SubmitDocument
              SubmitDocument: {
                path: 'vendors/submit',
                parse: {
                  vendorId: (id: string) => id,
                  vendorName: (name: string) => decodeURIComponent(name),
                  isVendorLocked: (v: string) => v === 'true',
                },
              },
            },
          },
          DashboardTab: {
            screens: {
              Dashboard: 'dashboard',
              Notifications: 'dashboard/notifications',
            },
          },
          AccountTab: {
            screens: {
              Profile: 'account',
              EditProfile: 'account/edit',
              TransactionHistory: 'account/transactions',
              Settings: 'account/settings',
              CloudSync: 'account/cloud-sync',
            },
          },
        },
      },
    },
  },
};

