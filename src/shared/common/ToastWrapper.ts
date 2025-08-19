// toastService.ts
import Toast from 'react-native-toast-message';

type AlertType = 'success' | 'error' | 'info' | 'warning';

export const showAlert = ({
    title,
    message,
    alertType,
    shouldHideAfterDelay = true,
}: {
    title: string;
    message: string;
    alertType: AlertType;
    shouldHideAfterDelay?: boolean;
}) => {
    Toast.show({
        type: alertType,
        text1: title,
        text2: message,
        visibilityTime: shouldHideAfterDelay ? 4000 : 999999,
        autoHide: shouldHideAfterDelay,
        position: 'top',
    });
};

export const hideAlert = () => {
    Toast.hide();
};
