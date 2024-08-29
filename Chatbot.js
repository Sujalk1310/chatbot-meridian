import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import clogo from './Image/clogo.png';
import bestwrk from './Image/bestwrk.png'
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Sample questions for preliminary user details
const questions = [
  "Please provide your details: name / location / email and phone no (optional)",
];

const Chatbot = () => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('Home');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [visibleFAQIndex, setVisibleFAQIndex] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userDetails, setUserDetails] = useState({
    name: '',
    location: '',
    email: '',
    phone: '',
  });
  const [showForm, setShowForm] = useState(false); // State to manage form visibility
  const [activeService, setActiveService] = useState(false)
  const [preliminaryMessageSent, setPreliminaryMessageSent] = useState(false);
  const [isRealTimeChat, setIsRealTimeChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const chatEndRef = useRef(null);
  const ws = useRef(null);

  // FAQs for Home and Help tabs
  const homeFAQs = [
    { question: t("What cloud services does Meridian Solutions offer?"), answer: t("Meridian Solutions provides comprehensive cloud services, including migration services, managed IT services, and custom application development. We specialize in transitioning business applications to the cloud, optimizing cloud usage, and offering proactive guidance to ensure seamless integration and performance.") },
    { question: t("How does Meridian Solutions ensure data security?"), answer: t("We prioritize data security through a multi-layered approach that includes endpoint backup solutions, secure migration services, and continuous monitoring. Our security solutions are designed to protect your data from threats and ensure compliance with industry standards.") },
    { question: t("What support options are available for clients?"), answer: t("We offer various support options, including dedicated support, incident-based support, onsite FMS support, and shared factory support. Our managed support services are tailored to meet your specific needs, ensuring reliable and efficient resolution of any issues.") },
    { question: t("What are the benefits of partnering with Meridian Solutions?"), answer: t("Partnering with Meridian Solutions offers numerous benefits, including access to a team of experts with deep technical proficiency, customized solutions tailored to your business needs, and a commitment to innovation and excellence. Our customer-centric approach ensures that we place your needs at the forefront of every solution, fostering a collaborative environment for collective success.") }
  ];

  const helpFAQs = [
    { question: t("How do I contact customer support?"), answer: t("You can connect with our support team using email, Toll-free number & support portal.") },
    { question: t("What are your support hours?"), answer: t("Standard support is available between 9AM to 6PM on all working days.") },
    { question: t("What types of issues does your support team handle?"), answer: t("O365, Azure & D365 related technical issues & troubleshooting support.") },
    { question: t("What languages does your support team provide assistance in?"), answer: t("We use English as a communication language for support process.") },
    { question: t("What is the average turnaround time for resolving support tickets?"), answer: t("The initial response time will 30 mins after raising support request.") },
  ];

  useEffect(() => {
    // Update FAQ content when the language changes
    setVisibleFAQIndex(null);
    resetChat();
  }, [i18n.language]);

  useEffect(() => {
    if (isChatbotOpen) {
      if (messages.length === 0) {
        appendMessage('bot', t("Welcome to Meridian! How can I assist you today?"), true);
      } 
      else if (!preliminaryMessageSent && messages[messages.length - 1]?.sender === 'user') {
        appendMessage('bot', t("Before we go further, I need some information from you."), true);
        setPreliminaryMessageSent(true);
      }
       else if (preliminaryMessageSent && messages[messages.length - 1]?.sender === 'user') {
        handlePreliminaryQuestions();
      }
    }
  }, [isChatbotOpen, messages, preliminaryMessageSent, t]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  const resetChat = () => {
    setMessages([]); // Clear messages
    setPreliminaryMessageSent(false); // Reset preliminary message flag
    setIsRealTimeChat(false); // Deactivate real-time chat mode
    setCurrentQuestion(0); // Reset question index
    setUserDetails({
      name: '',
      location: '',
      email: '',
      phone: '',
    }); // Reset user details
    // Optionally you can reset any other state as required
  };
  
  const handlePreliminaryQuestions = () => {
    const questionIndex = currentQuestion;

    if (questionIndex < questions.length) {
      appendMessage('bot', t(questions[questionIndex]), true);
      setCurrentQuestion(questionIndex + 1);
    } else if (!isRealTimeChat) {
      appendMessage('bot', t("Thank you for sharing your details. Feel free to ask me anything!"), true);
      setIsRealTimeChat(true); // Activate real-time chat mode
      console.log('Real-time chat mode activated.');
      setActiveService(true)
    }
  };

  const appendMessage = (sender, message, isStreaming = false) => {
    console.log('Appending message:', sender, message); // Debugging line

    if (isStreaming) {
      streamMessage(sender, message);
    } else {
      setMessages(prevMessages => [...prevMessages, { sender, message }]);
    }
  };

  const streamMessage = (sender, fullMessage) => {
    const typingSpeed = 30; // Adjust typing speed if needed
    let index = 0; // To keep track of the current character index

    const updateMessage = () => {
      setMessages(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        
        if (lastMessage?.sender === sender) {
          const updatedMessage = fullMessage.slice(0, index);
          return [
            ...prevMessages.slice(0, -1),
            { ...lastMessage, message: updatedMessage } // Update with partial message
          ];
        }
        
        return [...prevMessages, { sender, message: fullMessage.slice(0, index) }];
      });

      if (index < fullMessage.length) {
        index += 1;
        setTimeout(updateMessage, typingSpeed);
      } else {
        setMessages(prevMessages => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage?.sender === sender) {
            return [
              ...prevMessages.slice(0, -1),
              { ...lastMessage, message: fullMessage } // Set final message
            ];
          }
          return [...prevMessages, { sender, message: fullMessage }];
        });
      }
    };

    updateMessage();
  };

  const sendMessage = async () => {
    if (userInput.trim()) {
      const message = userInput.trim();
      appendMessage('user', message);
  
      if(activeService){
        setIsLoading(true);
      try {
        const response = await fetch('https://chatbotappbackend.azurewebsites.net/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            original_query_string: message,
            conversation_id: '1'
          }),
        });
  
        if (!response.ok) {
          console.error('API request failed with status:', response.status);
          appendMessage('bot', t("Failed to send message. Please try again later."), true);
          return;
        }
        const data = await response.json();
        const botResponse = data.response?.bot_response || t("Received an unexpected response.");
        streamMessage('bot', botResponse);
        setUserInput('');
        setIsLoading(false); 
        //handleAPIResponse(data);
      } catch (error) {
        console.error('Error sending message to API:', error);
        appendMessage('bot', t("An error occurred while sending the message. Please try again later."), true);
        setIsLoading(false); 
      }
    }else{
      setActiveService(false)
      handleUserResponse(message);
      setUserInput('');
    }
    }
  };

  const handleAPIResponse = (data) => {
    console.log('API Response Data:', data); // Log API response data
    if (data.message) {
      appendMessage('bot', data.message, true);
    } else {
      appendMessage('bot', t("Received an unexpected response."), true);
    }
  };

  const handleUserResponse = (response) => {
    const updatedDetails = { ...userDetails };
    if (currentQuestion === 1) updatedDetails.name = response;
    else if (currentQuestion === 2) updatedDetails.location = response;
    else if (currentQuestion === 3) updatedDetails.email = response;
    else if (currentQuestion === 4) updatedDetails.phone = response;

    setUserDetails(updatedDetails);
  };

  const handleInputChange = (e) => setUserInput(e.target.value);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      appendMessage('user', `${t('Uploaded file')}: ${e.target.files[0].name}`);
    }
  };

  const handleFileClick = () => document.getElementById('file-input').click();

  const handleFAQToggle = (index) => setVisibleFAQIndex(prevIndex => (prevIndex === index ? null : index));

  const handleLanguageChange = (e) => i18n.changeLanguage(e.target.value);

  const handleCloseChatbot = () => {
    console.log('Close button clicked'); // Debugging line
    setIsChatbotOpen(false);
  };


  return (
    <div className={`chatbot-popup ${isChatbotOpen ? 'open' : 'closed'}`}>
      <div className="chat-header">
        <img src={clogo} alt="logo" />
        <img src={bestwrk} className="new-image" alt="New Image" />
        <button id="close-btn" onClick={handleCloseChatbot}>&times;</button>
      </div>
      <div className="chat-tabs">
        <button className={`tab-link ${activeTab === 'Home' ? 'active' : ''}`} onClick={() => setActiveTab('Home')}>
          {t('Home')}
        </button>
        <button className={`tab-link ${activeTab === 'Message' ? 'active' : ''}`} onClick={() => setActiveTab('Message')}>
          {t('Message')}
        </button>
        <button className={`tab-link ${activeTab === 'Help' ? 'active' : ''}`} onClick={() => setActiveTab('Help')}>
          {t('Help')}
        </button>
        <select onChange={handleLanguageChange} value={i18n.language}>
          <option value="en">English</option>
          <option value="ar">Arabic</option>
          <option value="hi">Hindi</option>
          <option value="pl">Polish</option>
          <option value="zh">Standard Chinese</option>
        </select>
      </div>
      <div id="Home" className={`tab-content ${activeTab === 'Home' ? 'active' : ''}`}>
        <h2 className="animate-text">{t('Welcome to Meridian')}</h2>
        <p className="animate-text">{t('Tier 1 Cloud Solutions Partner and Gold Certified Cloud Productivity Partner of Microsoft, we offer expert services across diverse verticals.')}</p>
        <h3 className="animate-text">{t('FAQ')}</h3>
        {homeFAQs.map((faq, index) => (
          <div className="faq-section" key={index}>
            <button className="faq-toggle" onClick={() => handleFAQToggle(index)}>
              {faq.question}
              {visibleFAQIndex === index && <div className="progress-bar"></div>}
            </button>
            <div className="faq-content" style={{ display: visibleFAQIndex === index ? 'block' : 'none' }}>
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
      <div id="Message" className={`tab-content messagetab ${activeTab === 'Message' ? 'active' : ''}`}>
      <div className="chat-box">
  {messages.map((msg, index) => (
    <div key={index} className={msg.sender === 'user' ? 'user-message' : 'bot-message'}>
      {msg.message}
    </div>
  ))}
  <div ref={chatEndRef} />
</div>

{isLoading && (
              <div className="loading-animation">
                {/* Add your loading animation here */}
                <div className="loader"></div>
              </div>
            )}
        <div className="bot-messeage">
          <input
            type="text"
            id="user-input"
            placeholder={t('Type a message...')}
            value={userInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
          <input
            type="file"
            id="file-input"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <button
            id="upload-btn"
            onClick={handleFileClick}
            title={t('Attach File')}
          >
            <i className="fas fa-paperclip"></i>
          </button>
          <button id="send-btn" onClick={sendMessage}>
              <i className="fas fa-paper-plane"></i>
            </button>
        </div>
      </div>
      <div id="Help" className={`tab-content ${activeTab === 'Help' ? 'active' : ''}`}>
        <h3 className="animate-text">{t('Help')}</h3>
        {helpFAQs.map((faq, index) => (
          <div className="faq-section" key={index}>
            <button className="faq-toggle" onClick={() => handleFAQToggle(index)}>
              {t(faq.question)}
              {visibleFAQIndex === index && <div className="progress-bar"></div>}
            </button>
            <div className="faq-content" style={{ display: visibleFAQIndex === index ? 'block' : 'none' }}>
              <p>{t(faq.answer)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Chatbot;