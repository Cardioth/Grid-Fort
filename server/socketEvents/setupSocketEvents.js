const { getUniCreditsListener } = require('./getUniCreditsListener');
const { startGameListener } = require('./startGameListener');
const { getCollectionListener } = require('./getCollectionListener');
const { adminListeners } = require('./adminListeners');
const { getProfileListener } = require('./getProfileListener');
const { verifySignatureListener } = require('./verifySignatureListener');
const { endGameListener } = require('./endGameListener');
const { saveDeckListener } = require('./saveDeckListener');
const { getDecksListener } = require('./getDecksListener');
const { deleteDeckListener } = require('./deleteDeckListener');
const { createDeckListener } = require('./createDeckListener');

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
    saveDeckListener(socket, username);
    getDecksListener(socket, username);
    deleteDeckListener(socket, username);
    createDeckListener(socket, username);
  };
  
  module.exports = { setupSocketEvents };
  