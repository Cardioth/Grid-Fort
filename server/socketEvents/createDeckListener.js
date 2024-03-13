function createDeckListener(socket) {
    socket.on('createDeck', async (deckName) => {
        try {
            // Check if the deck has a valid name
            if (deckName.length > 20) {
                socket.emit('createDeckResponse', 'Deck name is too long');
                return;
            }
            if (deckName.length < 1) {
                socket.emit('createDeckResponse', 'Deck name is too short');
                return;
            }
            if (!/^[a-zA-Z ]+$/.test(deckName)) {
                socket.emit('createDeckResponse', 'Deck name can only contain letters and spaces');
                return;
            }
            socket.emit('createDeckResponse', 'Deck created');
        } catch (error) {
            console.error('Error saving deck:', error);
            socket.emit('createDeckResponse', 'Unable to create deck');
        }
    });
}

exports.createDeckListener = createDeckListener;