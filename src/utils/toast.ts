import { showMessage } from "react-native-flash-message";

export const onError = (message: string) => {
    showMessage({
      message: message,
      type: "danger"
    });
  },
  onSuccess = (message: string) => {
    showMessage({
      message: message,
      type: "success"
    });
  },
  onInfo = (message: string) => {
    showMessage({
      message: message,
      type: "info"
    });
  };
