const { getUniCreditsListener } = require('./getUniCreditsListener');
const { startGameListener } = require('./startGameListener');
const { getCollectionListener } = require('./getCollectionListener');
const { adminListeners } = require('./adminListeners');
const { getProfileListener } = require('./getProfileListener');
const { verifySignatureListener } = require('./verifySignatureListener');
const { endGameListener } = require('./endGameListener');

const setupSocketEvents = (socket, username) => {
    // Define the event listeners for this socket
    socket.on('disconnect', () => {
      console.log('User disconnected:', username);
    });
  
    if(username === 'admin') {
      socket.emit('privs', 'admin');
      adminListeners(socket, username);
    } else {
      socket.emit('privs', 'user');
    }
  
    getUniCreditsListener(socket, username);
    startGameListener(socket, username);
    getCollectionListener(socket, username);
    getProfileListener(socket, username);
    verifySignatureListener(socket, username);
    endGameListener(socket, username);
  };
  
  module.exports = { setupSocketEvents };
  