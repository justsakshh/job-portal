import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

// Reference to the messages collection
const messagesCollection = collection(db, 'messages');

/**
 * Generates a unique conversation ID based on two user IDs.
 * Sorting ensures the ID is the same regardless of who sends the message first.
 */
export const generateConversationId = (uid1, uid2) => {
  return [uid1, uid2].sort().join('_');
};

/**
 * Sends a new message.
 */
export const sendMessage = async (senderId, receiverId, text) => {
  if (!text.trim()) throw new Error("Message cannot be empty");

  const conversationId = generateConversationId(senderId, receiverId);

  const messageData = {
    senderId,
    receiverId,
    conversationId,
    text: text.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isRead: false
  };

  try {
    const docRef = await addDoc(messagesCollection, messageData);
    
    // Also update/create a lightweight conversation document for the Inbox list
    const convoRef = doc(db, 'conversations', conversationId);
    await updateDoc(convoRef, {
      participants: [senderId, receiverId],
      lastMessage: text.trim(),
      updatedAt: serverTimestamp()
    }).catch(async (error) => {
      // If update fails because document doesn't exist, create it
      if (error.code === 'not-found') {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(convoRef, {
          participants: [senderId, receiverId],
          lastMessage: text.trim(),
          updatedAt: serverTimestamp()
        });
      } else {
        throw error;
      }
    });

    return docRef.id;
  } catch (error) {
    console.error("Error sending message: ", error);
    throw error;
  }
};

/**
 * Listens to messages for a specific conversation in real-time.
 */
export const listenMessages = (conversationId, callback) => {
  const q = query(
    messagesCollection,
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

/**
 * Updates a message's text.
 */
export const updateMessage = async (messageId, newText) => {
  if (!newText.trim()) throw new Error("Message cannot be empty");
  
  const messageRef = doc(db, 'messages', messageId);
  try {
    await updateDoc(messageRef, {
      text: newText.trim(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating message: ", error);
    throw error;
  }
};

/**
 * Marks a message as read.
 */
export const markAsRead = async (messageId) => {
  const messageRef = doc(db, 'messages', messageId);
  try {
    await updateDoc(messageRef, {
      isRead: true
    });
  } catch (error) {
    console.error("Error marking message as read: ", error);
    throw error;
  }
};

/**
 * Deletes a message.
 */
export const deleteMessage = async (messageId) => {
  const messageRef = doc(db, 'messages', messageId);
  try {
    await deleteDoc(messageRef);
  } catch (error) {
    console.error("Error deleting message: ", error);
    throw error;
  }
};
