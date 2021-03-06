const initialState = {
  privateKey: '',
  publicKey: '',
  username: '',
  id: '',
};

const user = (state = initialState, action) => {
  switch (action.type) {
    case 'CREATE_USER': {
      return {
        ...action.payload,
        id: action.payload.publicKey,
      };
    }
    case 'SEND_ENCRYPTED_MESSAGE_CHANGE_USERNAME':
      return {
        ...state,
        username: action.payload.newUsername,
      };
    default:
      return state;
  }
};

export default user;
