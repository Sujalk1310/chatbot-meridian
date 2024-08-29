import React, { useState } from 'react';
import chat from './Image/chat.png';
import './App.css';
import Chatbot from './Chatbot';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';


function App() {
  const [isChatbotVisible, setChatbotVisible] = useState(false);

  const toggleChatbot = () => {
    setChatbotVisible(!isChatbotVisible);
  };

  return (
    <I18nextProvider i18n={i18n}>
      <div className="App">
        <button id="chatbot-toggle-btn" onClick={toggleChatbot}>
          <img src={chat} alt="buttonpng" />
        </button>
        {isChatbotVisible && <Chatbot />}
      </div>
    </I18nextProvider>
  );
}

export default App;
