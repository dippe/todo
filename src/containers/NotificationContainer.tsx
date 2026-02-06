import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../types/state';
import { clearNotification } from '../store/slices/uiSlice';
import { Notification } from '../components/Notification';

const mapState = (state: RootState) => ({
  notification: state.ui.notification,
});

const mapDispatch = {
  onClose: clearNotification,
};

const connector = connect(mapState, mapDispatch);

type PropsFromRedux = ConnectedProps<typeof connector>;

const NotificationContainer: React.FC<PropsFromRedux> = ({
  notification,
  onClose,
}) => {
  if (!notification) {
    return null;
  }

  return (
    <Notification
      message={notification.message}
      type={notification.type}
      onClose={onClose}
    />
  );
};

export default connector(NotificationContainer);
