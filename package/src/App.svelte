<script lang="ts">
  import {
    MessageSquare,
    X,
    Send,
    Bot,
    User,
    Rocket,
    Loader2,
  } from "@lucide/svelte";
  import { onMount, tick } from "svelte";
  import { fade, fly, slide } from "svelte/transition";
  import { GET, POST } from "./lib/fetch";

  type Message = {
    id: string;
    text: string;
    sender: "user" | "agent" | "system";
    timestamp: Date;
    options?: string[];
  };

  // State using runes
  let isOpen = $state(false);
  let message = $state("");
  let chatBox = $state<HTMLElement | null>(null);
  let messageInput = $state<HTMLTextAreaElement | null>(null);
  let isWaitingForAgent = $state(false);
  let isPolling = $state(false);
  let showEmailForm = $state(false);
  let userEmail = $state("");
  let isSubmittingEmail = $state(false);
  let emailCaptured = $state(false);
  let sessionId = $state("");
  let unreadCount = $state(0);
  let originalTitle = $state("");
  let titleInterval = $state<ReturnType<typeof setTimeout> | null>(null);
  let engagementTimer = $state<ReturnType<typeof setTimeout> | null>(null);

  let messages = $state<Message[]>([
    {
      id: "welcome",
      text: "👋 Hi there! I'm your AI Agent. How can I assist you with Litekart today?",
      sender: "agent",
      timestamp: new Date(),
    },
  ]);

  // Chat state trigger (previously a store)
  let chatTrigger = $state({
    isOpen: false,
    prefilledMessage: "",
    autoSend: false,
  });

  // Effect for scrolling to bottom when messages change or chat opens
  $effect(() => {
    if (messages.length || isOpen) {
      tick().then(() => {
        if (chatBox) {
          chatBox.scrollTop = chatBox.scrollHeight;
        }
      });
    }
  });

  // Effect for handling chat trigger
  $effect(() => {
    if (chatTrigger.isOpen || chatTrigger.prefilledMessage) {
      console.log("ChatTrigger received:", $state.snapshot(chatTrigger));

      if (chatTrigger.isOpen && !isOpen) {
        console.log("Opening chat via trigger...");
        isOpen = true;
        localStorage.removeItem("chat_manually_closed");
        clearNotification();
        startPolling();
      }

      if (chatTrigger.prefilledMessage) {
        console.log(
          "Applying prefilled message:",
          chatTrigger.prefilledMessage,
        );
        message = chatTrigger.prefilledMessage;

        const capturedMessage = chatTrigger.prefilledMessage;

        // Clear the trigger
        chatTrigger.isOpen = false;
        chatTrigger.prefilledMessage = "";

        // Focus the textarea
        tick().then(() => {
          if (messageInput) {
            messageInput.focus();
            messageInput.selectionStart = messageInput.selectionEnd =
              capturedMessage.length;
          }
        });
      }
    }
  });

  onMount(() => {
    (async () => {
      // Initialize or retrieve sessionId
      sessionId = localStorage.getItem("chat_session_id") || "";
      if (!sessionId) {
        sessionId = Math.random().toString(36).substring(2, 15);
        localStorage.setItem("chat_session_id", sessionId);
      }

      // 1. Fetch chat history
      try {
        const data = await GET(`/api/chat/history`);
        messages = data.map((m: any) => ({
          id: `history-${Math.random()}`,
          text: m.message,
          sender: m.isSystem ? "agent": "user",
          timestamp: new Date(m.createdAt),
        }));
      } catch (e) {
        console.error("Failed to fetch chat history", e);
      }

      // Check for existing answers in localStorage
      const businessType = localStorage.getItem("chat_business_type");
      const annualRevenue = localStorage.getItem("chat_annual_revenue");

      if (businessType && annualRevenue) {
        emailCaptured = true;
      } else if (localStorage.getItem("chat_manually_closed") === "true") {
        // Do nothing
      } else if (messages.length <= 1) {
        // After 5 seconds on the website, auto-trigger the engagement bot if no history
        engagementTimer = setTimeout(() => {
          if (!isOpen && messages.length <= 1) {
            if (
              !localStorage.getItem("chat_business_type") &&
              localStorage.getItem("chat_manually_closed") !== "true"
            ) {
              pushEngagementQuestions();
            }
          }
        }, 5000);
      }
    })();

    // Set original title early
    if (typeof document !== "undefined") {
      originalTitle = document.title;

      const handleVisibilityChange = () => {
        if (!document.hidden && isOpen) clearNotification();
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        if (engagementTimer) clearTimeout(engagementTimer);
        if (titleInterval) clearInterval(titleInterval);
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );
      };
    }
  });

  // Notification Logic
  const playNotificationSound = () => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const clearNotification = () => {
    unreadCount = 0;
    if (titleInterval) {
      clearInterval(titleInterval);
      titleInterval = null;
    }
    if (typeof document !== "undefined" && originalTitle) {
      document.title = originalTitle;
    }
  };

  const notifyVisitor = () => {
    if (!isOpen || (typeof document !== "undefined" && document.hidden)) {
      playNotificationSound();
      unreadCount++;
      if (!titleInterval && typeof document !== "undefined") {
        originalTitle = document.title;
        let isShowingOriginal = false;
        titleInterval = setInterval(() => {
          document.title = isShowingOriginal
            ? originalTitle
            : `💬 (${unreadCount}) New Message!`;
          isShowingOriginal = !isShowingOriginal;
        }, 1000);
      }
    }
  };

  // Helper to send metadata with messages
  async function getMetadata() {
    let country = "Unknown";
    let city = "Unknown";
    let ip = "";
    try {
      const geoRes = await fetch("https://ipapi.co/json/");
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        country = geoData.country_name || "Unknown";
        city = geoData.city || "Unknown";
        ip = geoData.ip || "";
      }
    } catch (e) {}

    return {
      country,
      city,
      ip,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      url: window.location.href,
      referrer: document.referrer || "Direct",
      ua: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      email: localStorage.getItem("chat_user_email") || "",
    };
  }

  const pushEngagementQuestions = () => {
    messages.push({
      id: `agent-engagement-1`,
      text: "While you're looking around, what best describes your current business?",
      sender: "agent",
      timestamp: new Date(),
      options: ["Ecommerce marketplace", "Shopify store", "Ecommerce store"],
    });
    isOpen = true;
  };

  const handleOptionClick = async (optionText: string, messageId: string) => {
    // Remove options from the clicked message
    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex !== -1) {
      messages[msgIndex] = { ...messages[msgIndex], options: undefined };
    }

    messages.push({
      id: `user-reply-${Date.now()}`,
      text: optionText,
      sender: "user",
      timestamp: new Date(),
    });

    if (
      optionText === "Ecommerce marketplace" ||
      optionText === "Shopify store" ||
      optionText === "Ecommerce store"
    ) {
      localStorage.setItem("chat_business_type", optionText);
      setTimeout(async () => {
        messages.push({
          id: `agent-revenue-${Date.now()}`,
          text: "Awesome! And what is your current annual revenue?",
          sender: "agent",
          timestamp: new Date(),
          options: ["> 100K", "> 1M", "> 1B"],
        });
      }, 800);
    } else if (optionText.includes(">")) {
      localStorage.setItem("chat_annual_revenue", optionText);
      setTimeout(async () => {
        messages.push({
          id: `agent-wow-${Date.now()}`,
          text: "That's seriously impressive! 🚀 Let me know if you need any customized architectural help outgrowing your current setup.",
          sender: "agent",
          timestamp: new Date(),
        });

        // Send notification to Telegram silently
        POST("/api/chat/send", {
          message: `[Visitor Poll] Business: ${localStorage.getItem("chat_business_type")}, Revenue: ${optionText}`,
          isSystem: true,
          metadata: await getMetadata(),
        }),
          startPolling();
      }, 800);
    }
  };

  const startPolling = async () => {
    if (isPolling) return;
    isPolling = true;

    const poll = async () => {
      if (!isOpen) {
        isPolling = false;
        return;
      }

      try {
        const response = await fetch(
          `/api/chat/receive?sessionId=${sessionId}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            isWaitingForAgent = false;

            let hasNew = false;
            for (const msg of data.messages) {
              messages.push({
                id: `agent-${Date.now()}-${Math.random()}`,
                text: msg.text,
                sender: "agent",
                timestamp: new Date(msg.timestamp),
              });
              hasNew = true;
            }

            if (hasNew) {
              notifyVisitor();
            }
          }
        }
      } catch (e) {
        console.error("Polling error", e);
      }

      if (isOpen) {
        setTimeout(poll, 3000);
      } else {
        isPolling = false;
      }
    };

    poll();
  };

  const triggerTimeout = () => {
    if (!isWaitingForAgent) return;

    messages.push({
      id: "timeout-system",
      text: "Our team is currently assisting other customers. Please leave your email address so we can get right back to you!",
      sender: "system",
      timestamp: new Date(),
    });
    showEmailForm = true;
    isWaitingForAgent = false;
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message.trim();
    message = "";

    messages.push({
      id: `user-${Date.now()}`,
      text: userMsg,
      sender: "user",
      timestamp: new Date(),
    });

    isWaitingForAgent = true;

    if (messages.filter((m) => m.sender === "user").length === 1) {
      setTimeout(triggerTimeout, 60000);
    }

    try {
      await POST("/api/chat/send", {
        message: userMsg,
        isSystem: false,
        metadata: await getMetadata(),
      });

      startPolling();
    } catch (error) {
      console.error("Error sending message API:", error);
    }
  };

  const submitEmail = async () => {
    if (!userEmail.includes("@")) return;
    isSubmittingEmail = true;
    localStorage.setItem("chat_user_email", userEmail);

    try {
      await POST("/api/chat/email", {
        email: userEmail,
      });

      /*await fetch("/api/chat/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          sessionId: sessionId,
        }),
      });*/

      showEmailForm = false;
      emailCaptured = true;

      messages.push({
        id: "email-captured",
        text: "Thanks! We've saved your email and will reach out to you shortly.",
        sender: "system",
        timestamp: new Date(),
      });
    } catch (e) {
      console.error("Failed to submit email", e);
    } finally {
      isSubmittingEmail = false;
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
</script>

<div class="chat-container">
  <!-- Chat Window -->
  {#if isOpen}
    <div transition:fade={{ duration: 200 }} class="chat-window">
      <!-- Header -->
      <div class="chat-header">
        <div class="header-info">
          <div class="bot-icon-container">
            <Bot class="bot-icon-large" />
          </div>
          <div>
            <h3 class="header-title">Litekart Agent</h3>
            <p class="header-subtitle">We typically reply in minutes</p>
          </div>
        </div>
        <button
          onclick={() => {
            isOpen = false;
            localStorage.setItem("chat_manually_closed", "true");
          }}
          class="close-button"
          aria-label="Close chat"
        >
          <X class="close-icon" />
        </button>
      </div>

      <!-- Messages -->
      <div bind:this={chatBox} class="messages-container">
        {#each messages as msg (msg.id)}
          {#if msg.sender === "system"}
            <div
              class="system-message-wrapper"
              transition:fly={{ y: 10, duration: 200 }}
            >
              <div class="system-message">
                {msg.text}
              </div>
            </div>
          {:else}
            <div
              class="message-row {msg.sender === 'user'
                ? 'user-row'
                : 'agent-row'}"
              transition:fly={{ y: 10, duration: 200 }}
            >
              {#if msg.sender === "agent"}
                <div class="message-bot-icon-container">
                  <Bot class="bot-icon-small" />
                </div>
              {/if}

              <div
                class="message-bubble {msg.sender === 'user'
                  ? 'user-bubble'
                  : 'agent-bubble'}"
              >
                <p class="message-text">
                  {msg.text}
                </p>

                {#if msg.options}
                  <div class="message-options">
                    {#each msg.options as option}
                      <button
                        onclick={() => handleOptionClick(option, msg.id)}
                        class="option-button"
                      >
                        {option}
                      </button>
                    {/each}
                  </div>
                {/if}

                <span
                  class="message-timestamp {msg.sender === 'user'
                    ? 'text-right'
                    : 'text-left'}"
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {#if msg.sender === "user"}
                <div class="message-user-icon-container">
                  <User class="user-icon-small" />
                </div>
              {/if}
            </div>
          {/if}
        {/each}

        {#if isWaitingForAgent && !showEmailForm}
          <div class="typing-indicator-wrapper" transition:fade>
            <div class="message-bot-icon-container">
              <Bot class="bot-icon-small" />
            </div>
            <div class="typing-bubble">
              <span class="dot"></span>
              <span class="dot" style="animation-delay: 0.2s"></span>
              <span class="dot" style="animation-delay: 0.4s"></span>
            </div>
          </div>
        {/if}

        {#if showEmailForm}
          <div class="email-form-container" transition:slide>
            <label for="fallback-email" class="email-label">Email Address</label
            >
            <div class="email-input-group">
              <input
                id="fallback-email"
                type="email"
                bind:value={userEmail}
                placeholder="you@example.com"
                class="email-input"
                onkeydown={(e) => {
                  if (e.key === "Enter") submitEmail();
                }}
              />
              <button
                onclick={submitEmail}
                disabled={isSubmittingEmail || !userEmail.includes("@")}
                class="email-submit-button"
              >
                {#if isSubmittingEmail}
                  <Loader2 class="spinner-icon" />
                {:else}
                  <Rocket class="rocket-icon" />
                {/if}
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Input Area -->
      <div class="input-area" onclick={clearNotification}>
        <div class="input-wrapper">
          <textarea
            bind:this={messageInput}
            bind:value={message}
            onkeydown={handleKeydown}
            onfocus={clearNotification}
            placeholder="Type a message..."
            rows="1"
            class="message-textarea"
          ></textarea>
          <button
            onclick={sendMessage}
            disabled={!message.trim()}
            class="send-button"
            aria-label="Send message"
          >
            <Send class="send-icon" />
          </button>
        </div>
        <div class="powered-by">
          <span>Powered by Litekart AI</span>
        </div>
      </div>
    </div>
  {/if}

  <!-- Floating Bubble Button -->
  <button
    onclick={() => {
      isOpen = !isOpen;
      if (isOpen) {
        localStorage.removeItem("chat_manually_closed");
        clearNotification();
        startPolling();
      }
    }}
    class="floating-toggle-button"
    aria-label="Toggle chat"
  >
    {#if isOpen}
      <X class="toggle-icon {isOpen ? 'rotated' : ''}" />
    {:else}
      <MessageSquare class="toggle-icon" />
    {/if}
  </button>
</div>

<style>
  :root {
    --primary-400: #60a5fa;
    --primary-500: #3b82f6;
    --primary-600: #2563eb;
    --primary-900: #1e3a8a;
    --zinc-50: #fafafa;
    --zinc-100: #f4f4f5;
    --zinc-200: #e4e4e7;
    --zinc-300: #d4d4d8;
    --zinc-400: #a1a1aa;
    --zinc-500: #71717a;
    --zinc-600: #52525b;
    --zinc-700: #3f3f46;
    --zinc-800: #27272a;
    --zinc-900: #18181b;
    --zinc-950: #09090b;
    --white: #ffffff;
    --black: #000000;
  }

  .chat-container {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    font-family: inherit;
  }

  .chat-window {
    margin-bottom: 1rem;
    display: flex;
    height: 480px;
    width: 350px;
    flex-direction: column;
    overflow: hidden;
    border-radius: 1rem;
    background-color: var(--white);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 1px solid var(--zinc-200);
  }

  @media (min-width: 640px) {
    .chat-window {
      width: 400px;
    }
  }

  @media (prefers-color-scheme: dark) {
    .chat-window {
      background-color: var(--zinc-950);
      border-color: var(--zinc-800);
    }
  }

  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--zinc-900);
    padding: 1rem 1.25rem;
    color: var(--white);
  }

  @media (prefers-color-scheme: dark) {
    .chat-header {
      background-color: var(--white);
      color: var(--zinc-900);
    }
  }

  .header-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .bot-icon-container {
    display: flex;
    height: 2.5rem;
    width: 2.5rem;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: rgba(59, 130, 246, 0.2);
  }

  :global(.bot-icon-large) {
    height: 1.5rem !important;
    width: 1.5rem !important;
    color: var(--primary-400) !important;
  }

  @media (prefers-color-scheme: dark) {
    :global(.bot-icon-large) {
      color: var(--primary-600) !important;
    }
  }

  .header-title {
    font-weight: 600;
    line-height: 1;
    margin: 0;
    font-size: 1rem;
  }

  .header-subtitle {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--zinc-400);
    margin-bottom: 0;
  }

  @media (prefers-color-scheme: dark) {
    .header-subtitle {
      color: var(--zinc-500);
    }
  }

  .close-button {
    border-radius: 9999px;
    padding: 0.5rem;
    transition: background-color 0.2s;
    background: transparent;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--zinc-400);
  }

  .close-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--white);
  }

  @media (prefers-color-scheme: dark) {
    .close-button {
      color: var(--zinc-500);
    }
    .close-button:hover {
      background-color: rgba(0, 0, 0, 0.1);
      color: var(--black);
    }
  }

  :global(.close-icon) {
    height: 1.25rem !important;
    width: 1.25rem !important;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background-color: rgba(244, 244, 245, 0.5);
  }

  @media (prefers-color-scheme: dark) {
    .messages-container {
      background-color: rgba(24, 24, 27, 0.1);
    }
  }

  .system-message-wrapper {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
  }

  .system-message {
    background-color: var(--zinc-100);
    color: var(--zinc-600);
    font-size: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    text-align: center;
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
    max-width: 85%;
  }

  @media (prefers-color-scheme: dark) {
    .system-message {
      background-color: var(--zinc-800);
      color: var(--zinc-300);
    }
  }

  .message-row {
    display: flex;
  }

  .user-row {
    justify-content: flex-end;
  }

  .agent-row {
    justify-content: flex-start;
  }

  .message-bot-icon-container {
    display: flex;
    height: 2rem;
    width: 2rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: var(--zinc-100);
    margin-right: 0.5rem;
    align-self: flex-end;
  }

  @media (prefers-color-scheme: dark) {
    .message-bot-icon-container {
      background-color: rgba(30, 58, 138, 0.3);
    }
  }

  :global(.bot-icon-small) {
    height: 1rem !important;
    width: 1rem !important;
    color: var(--primary-600) !important;
  }

  @media (prefers-color-scheme: dark) {
    :global(.bot-icon-small) {
      color: var(--primary-400) !important;
    }
  }

  .message-bubble {
    max-width: 80%;
    border-radius: 1rem;
    padding: 0.625rem 1rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .user-bubble {
    background-color: var(--zinc-900);
    color: var(--white);
    border-bottom-right-radius: 0;
  }

  @media (prefers-color-scheme: dark) {
    .user-bubble {
      background-color: var(--white);
      color: var(--zinc-900);
    }
  }

  .agent-bubble {
    background-color: var(--white);
    border: 1px solid var(--zinc-100);
    color: var(--zinc-800);
    border-bottom-left-radius: 0;
  }

  @media (prefers-color-scheme: dark) {
    .agent-bubble {
      background-color: var(--zinc-900);
      border-color: var(--zinc-800);
      color: var(--zinc-100);
    }
  }

  .message-text {
    font-size: 0.875rem;
    line-height: 1.625;
    white-space: pre-wrap;
    font-weight: 500;
    margin: 0;
  }

  .message-options {
    margin-top: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .option-button {
    width: 100%;
    text-align: left;
    background-color: var(--zinc-50);
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.75rem;
    transition: background-color 0.2s;
    border: 1px solid var(--zinc-200);
    font-weight: 600;
    color: var(--zinc-800);
    cursor: pointer;
  }

  .option-button:hover {
    background-color: var(--zinc-100);
  }

  @media (prefers-color-scheme: dark) {
    .option-button {
      background-color: var(--zinc-800);
      border-color: var(--zinc-700);
      color: var(--zinc-200);
    }
    .option-button:hover {
      background-color: var(--zinc-700);
    }
  }

  .message-timestamp {
    margin-top: 0.25rem;
    display: block;
    font-size: 0.625rem;
    opacity: 0.5;
  }

  .text-right {
    text-align: right;
  }
  .text-left {
    text-align: left;
  }

  .message-user-icon-container {
    display: flex;
    height: 2rem;
    width: 2rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: var(--zinc-200);
    margin-left: 0.5rem;
    align-self: flex-end;
  }

  @media (prefers-color-scheme: dark) {
    .message-user-icon-container {
      background-color: var(--zinc-800);
    }
  }

  :global(.user-icon-small) {
    height: 1rem !important;
    width: 1rem !important;
    color: var(--zinc-600) !important;
  }

  @media (prefers-color-scheme: dark) {
    :global(.user-icon-small) {
      color: var(--zinc-400) !important;
    }
  }

  .typing-indicator-wrapper {
    display: flex;
    justify-content: flex-start;
  }

  .typing-bubble {
    background-color: var(--white);
    border: 1px solid var(--zinc-100);
    border-radius: 1rem;
    border-bottom-left-radius: 0;
    padding: 0.75rem 1rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  @media (prefers-color-scheme: dark) {
    .typing-bubble {
      background-color: var(--zinc-900);
      border-color: var(--zinc-800);
    }
  }

  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    background-color: var(--zinc-400);
    animation: bounce 1s infinite ease-in-out;
  }

  @keyframes bounce {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .email-form-container {
    background-color: var(--white);
    border: 1px solid var(--zinc-200);
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    margin-top: 1rem;
  }

  @media (prefers-color-scheme: dark) {
    .email-form-container {
      background-color: var(--zinc-900);
      border-color: var(--zinc-800);
    }
  }

  .email-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--zinc-700);
    margin-bottom: 0.5rem;
  }

  @media (prefers-color-scheme: dark) {
    .email-label {
      color: var(--zinc-300);
    }
  }

  .email-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .email-input {
    flex: 1;
    border-radius: 0.5rem;
    border: 1px solid var(--zinc-300);
    background-color: transparent;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }

  .email-input:focus {
    border-color: var(--zinc-500);
    box-shadow: 0 0 0 1px var(--zinc-500);
  }

  @media (prefers-color-scheme: dark) {
    .email-input {
      border-color: var(--zinc-700);
      color: var(--white);
    }
    .email-input:focus {
      border-color: var(--zinc-500);
    }
  }

  .email-submit-button {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background-color: var(--zinc-900);
    color: var(--white);
    padding: 0.5rem 1rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: transform 0.1s;
  }

  .email-submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .email-submit-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  .email-submit-button:hover:not(:disabled) {
    background-color: var(--zinc-800);
  }

  @media (prefers-color-scheme: dark) {
    .email-submit-button {
      background-color: var(--white);
      color: var(--zinc-900);
    }
    .email-submit-button:hover:not(:disabled) {
      background-color: var(--zinc-200);
    }
  }

  :global(.spinner-icon) {
    height: 1rem !important;
    width: 1rem !important;
    animation: spin 1s linear infinite !important;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  :global(.rocket-icon) {
    height: 1rem !important;
    width: 1rem !important;
  }

  .input-area {
    border-top: 1px solid var(--zinc-100);
    background-color: var(--white);
    padding: 1rem;
  }

  @media (prefers-color-scheme: dark) {
    .input-area {
      border-color: var(--zinc-800);
      background-color: var(--zinc-950);
    }
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: flex-end;
    overflow: hidden;
    border-radius: 0.75rem;
    border: 1px solid var(--zinc-200);
    background-color: var(--zinc-50);
    transition: box-shadow 0.2s;
  }

  .input-wrapper:focus-within {
    box-shadow: 0 0 0 2px rgba(24, 24, 27, 0.1);
  }

  @media (prefers-color-scheme: dark) {
    .input-wrapper {
      border-color: var(--zinc-700);
      background-color: var(--zinc-900);
    }
    .input-wrapper:focus-within {
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
    }
  }

  .message-textarea {
    max-height: 120px;
    min-height: 44px;
    width: 100%;
    resize: none;
    background: transparent;
    padding: 0.75rem 3rem 0.75rem 1rem;
    font-size: 0.875rem;
    outline: none;
    border: none;
    line-height: inherit;
  }

  @media (prefers-color-scheme: dark) {
    .message-textarea {
      color: var(--white);
    }
    .message-textarea::placeholder {
      color: var(--zinc-500);
    }
  }

  .send-button {
    position: absolute;
    bottom: 0.25rem;
    right: 0.25rem;
    display: flex;
    height: 2.25rem;
    width: 2.25rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background-color: var(--zinc-900);
    color: var(--white);
    transition: all 0.2s;
    border: none;
    cursor: pointer;
  }

  .send-button:disabled {
    opacity: 0.5;
    background-color: var(--zinc-300);
    cursor: not-allowed;
  }

  .send-button:hover:not(:disabled) {
    transform: scale(1.05);
  }

  .send-button:active:not(:disabled) {
    transform: scale(0.95);
  }

  @media (prefers-color-scheme: dark) {
    .send-button {
      background-color: var(--white);
      color: var(--zinc-900);
    }
    .send-button:disabled {
      background-color: var(--zinc-700);
    }
  }

  :global(.send-icon) {
    height: 1rem !important;
    width: 1rem !important;
  }

  .powered-by {
    margin-top: 0.5rem;
    text-align: center;
    font-size: 0.625rem;
    color: var(--zinc-400);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  @media (prefers-color-scheme: dark) {
    .powered-by {
      color: var(--zinc-500);
    }
  }

  .floating-toggle-button {
    display: flex;
    height: 3.5rem;
    width: 3.5rem;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background-color: var(--zinc-900);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    border: 4px solid rgba(24, 24, 27, 0.2);
    transition: all 0.2s;
    cursor: pointer;
    color: var(--white);
  }

  .floating-toggle-button:hover {
    transform: scale(1.05);
  }

  .floating-toggle-button:active {
    transform: scale(0.95);
  }

  @media (prefers-color-scheme: dark) {
    .floating-toggle-button {
      background-color: var(--white);
      color: var(--zinc-900);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  :global(.toggle-icon) {
    height: 1.5rem !important;
    width: 1.5rem !important;
    transition: transform 0.3s !important;
  }

  :global(.rotated) {
    transform: rotate(90deg) !important;
  }
</style>
