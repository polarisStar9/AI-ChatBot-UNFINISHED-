const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");

// api
const API_KEY = "?";
const API_URL = `?`;

let userMessage = "";
const chatHistory = [];

// message elements
const createMsgElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

// scroll to bottom of container
const scrollToBottom = () => container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

// process typing effect for bot response
const typingEffect = (text, textElement, botMsgDiv) => {
    textElement.textContent = "";
    const words = text.split(" ");
    let wordIndex = 0;

    // set interval to type every word
    const typingInterval = setInterval(() => {
        if(wordIndex < words.length) {
            textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];

            scrollToBottom();
        } else {
            botMsgDiv.classList.remove("loading");
            clearInterval(typingInterval);
        }
    }, 40);
}

// make api call & generate bot response
const generateResponse = async (botMsgDiv) => {
    const textElement = botMsgDiv.querySelector(".message-text");

    // user message to chat histoy
    chatHistory.push({
        role: "user",
        parts: [{ text: userMessage }]
    });

    try {
        // send chat history to api to get response
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({ contents: chatHistory })
        });

        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);

        // process bot response and display w/ typing effect
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
        typingEffect(responseText, textElement, botMsgDiv);
    } catch (error) {
        console.log(error)
    }
}

// form submit
const handleFormSubmit = (e) => {
    e.preventDefault();
    userMessage = promptInput.value.trim();
    if(!userMessage) return;

    promptInput.value = "";
    
    // user message & add chats container
    const userMsgHTML = `<p class="message-text"></p>`;
    const userMsgDiv = createMsgElement(userMsgHTML, "user-message");

    userMsgDiv.querySelector(".message-text").textContent = userMessage;
    chatsContainer.appendChild(userMsgDiv);
    scrollToBottom();

    setTimeout(() => {
        // bot message & add chats container after 600ms
        const botMsgHTML = `<img src="polaris.png" class="avatar"><p class="message-text">Please wait...</p>`;
        const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
        chatsContainer.appendChild(botMsgDiv);
        scrollToBottom();
        generateResponse(botMsgDiv);
    }, 600);
}

promptForm.addEventListener("submit", handleFormSubmit);