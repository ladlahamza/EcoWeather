import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Clipboard,
  Alert,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleGenerativeAI } from "@google/generative-ai";

class AIScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputText: '',
      aiResponse: '',
      loading: false,
      chatHistory: [],
      isTyping: false,
      savedChats: [],
      selectedChat: null,
    };
  }

  async componentDidMount() {
    await this.loadSavedChats();
    const savedChatHistory = await AsyncStorage.getItem('chatHistory');
    if (savedChatHistory) {
      this.setState({ chatHistory: JSON.parse(savedChatHistory) });
    }
  }

  loadSavedChats = async () => {
    try {
      const savedChats = await AsyncStorage.getItem('savedChats');
      if (savedChats) {
        this.setState({ savedChats: JSON.parse(savedChats) });
      }
    } catch (error) {
      console.error('Error loading saved chats:', error);
    }
  };

  saveChatHistory = async (chatHistory) => {
    try {
      await AsyncStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  setInputText = (text) => {
    this.setState({ inputText: text });
  };

  delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  generateAIResponse = async () => {
    const { inputText, chatHistory } = this.state;

    if (!inputText.trim()) {
      this.setState({ aiResponse: 'Please enter a query.' });
      return;
    }

    this.setState({ loading: true, isTyping: true, aiResponse: '' });

    try {
      const apiKey = 'AIzaSyA2OD5WSqvFf_9i6xwRjXEZzgWRNZzJRtU'; // Replace with your actual API Key
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      let attempts = 3;
      let generatedText = '';

      for (let i = 0; i < attempts; i++) {
        try {
          const result = await model.generateContent(inputText);
          if (result && result.response && result.response.text) {
            generatedText = await result.response.text();
          } else {
            generatedText = 'No response received from Evo.';
          }
          break;
        } catch (error) {
          if (error.message.includes('503') && i < attempts - 1) {
            console.log(`Retrying... (${i + 1})`);
            await this.delay(3000);
          } else {
            throw error;
          }
        }
      }

      const updatedChatHistory = [
        ...chatHistory,
        { role: 'user', content: inputText },
        { role: 'Evo-ai', content: generatedText },
      ];

      this.setState(
        {
          chatHistory: updatedChatHistory,
          inputText: '',
          aiResponse: generatedText,
          isTyping: false,
        },
        () => {
          this.saveChatHistory(updatedChatHistory);
        }
      );
    } catch (error) {
      console.error('Error generating AI response:', error);
      this.setState({
        aiResponse: error.message.includes('503')
          ? 'Evo is currently overloaded. Please try again later.'
          : `Error: ${error.message}`,
        isTyping: false,
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  startNewChat = () => {
    Alert.alert(
      'New Chat',
      'Are you sure you want to start a new chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => this.setState({ chatHistory: [], aiResponse: '' }) },
      ]
    );
  };

  deleteChatHistory = async () => {
    Alert.alert(
      'Delete Chat History',
      'Are you sure you want to delete the chat history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            await AsyncStorage.removeItem('chatHistory');
            this.setState({ chatHistory: [], aiResponse: '' });
          },
        },
      ]
    );
  };

  copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied to Clipboard', 'The text has been copied to your clipboard.');
  };

  editUserMessage = (index) => {
    const { chatHistory } = this.state;
    const message = chatHistory[index].content;
    this.setInputText(message);
    const updatedChatHistory = chatHistory.slice(0, index);
    this.setState({ chatHistory: updatedChatHistory });
  };

  regenerateAIResponse = async () => {
    const { chatHistory } = this.state;
    const lastUserMessage = chatHistory[chatHistory.length - 2].content;
    this.setInputText(lastUserMessage);
    this.generateAIResponse();
  };

  rateAIResponse = (index, rating) => {
    const { chatHistory } = this.state;
    const updatedChatHistory = [...chatHistory];
    updatedChatHistory[index].rating = rating;
    this.setState({ chatHistory: updatedChatHistory });
    Alert.alert('Rating Submitted', `You rated Evo's response as ${rating}.`);
  };

  saveChat = async () => {
    const { chatHistory } = this.state;
    const chatName = `Chat_${new Date().toLocaleString()}`;
    const savedChats = [...this.state.savedChats, { name: chatName, history: chatHistory }];
    this.setState({ savedChats });
    await AsyncStorage.setItem('savedChats', JSON.stringify(savedChats));
    Alert.alert('Chat Saved', `The chat has been saved as "${chatName}".`);
  };

  loadChat = async (index) => {
    const { savedChats } = this.state;
    const selectedChat = savedChats[index];
    this.setState({ chatHistory: selectedChat.history, selectedChat: index });
  };

  shareChat = async () => {
    const { chatHistory } = this.state;
    const chatText = chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    try {
      await Share.share({
        message: chatText,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share the chat.');
    }
  };

  render() {
    const { inputText, aiResponse, loading, chatHistory, isTyping, savedChats, selectedChat } = this.state;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Evo - AI Assistant</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={this.startNewChat}>
              <Text style={styles.headerButtonText}>New Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={this.deleteChatHistory}>
              <Text style={styles.headerButtonText}>Delete History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContentContainer}
          keyboardShouldPersistTaps="handled"
          ref={(ref) => (this.scrollView = ref)}
          onContentSizeChange={() => this.scrollView.scrollToEnd({ animated: true })}
        >
          <View style={styles.messagesContainer}>
            {chatHistory.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageContainer,
                  message.role === 'user'
                    ? styles.userMessageContainer
                    : styles.aiMessageContainer,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.role === 'user' ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {message.content}
                </Text>
                {message.role === 'ai' && (
                  <View style={styles.messageActions}>
                    <TouchableOpacity onPress={() => this.copyToClipboard(message.content)}>
                      <Text style={styles.actionText}>Copy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.rateAIResponse(index, '👍')}>
                      <Text style={styles.actionText}>👍</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.rateAIResponse(index, '👎')}>
                      <Text style={styles.actionText}>👎</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {message.role === 'user' && (
                  <TouchableOpacity onPress={() => this.editUserMessage(index)}>
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {isTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>Evo is typing...</Text>
            </View>
          )}

          {loading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loaderText}>Evo is thinking...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your question..."
            value={inputText}
            onChangeText={this.setInputText}
            multiline
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.sendButton} onPress={this.generateAIResponse}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={this.regenerateAIResponse}>
            <Text style={styles.footerButtonText}>Regenerate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={this.saveChat}>
            <Text style={styles.footerButtonText}>Save Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={this.shareChat}>
            <Text style={styles.footerButtonText}>Share Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.savedChatsContainer}>
          <Text style={styles.savedChatsTitle}>Saved Chats</Text>
          {savedChats.map((chat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.savedChatButton,
                selectedChat === index && styles.selectedSavedChatButton,
              ]}
              onPress={() => this.loadChat(index)}
            >
              <Text style={styles.savedChatButtonText}>{chat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fc',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  headerButton: {
    backgroundColor: '#2980b9',
    padding: 10,
    borderRadius: 10,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 16,
  },
  chatContentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messagesContainer: {
    marginBottom: 20,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#3498db',
    borderTopRightRadius: 0,
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecf0f1',
    borderTopLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#34495e',
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  actionText: {
    color: '#3498db',
    marginLeft: 10,
  },
  typingIndicator: {
    alignSelf: 'flex-start',
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  typingText: {
    color: '#34495e',
    fontSize: 14,
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 16,
    color: '#3498db',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: '#f2f2f2',
    color: '#333',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  footerButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 20,
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  savedChatsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  savedChatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 10,
  },
  savedChatButton: {
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  selectedSavedChatButton: {
    backgroundColor: '#3498db',
  },
  savedChatButtonText: {
    color: '#34495e',
    fontSize: 14,
  },
});

export default AIScreen;