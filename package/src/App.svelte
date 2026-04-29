<script lang="ts">
  import {
    MessageSquare,
    X,
    Send,
    Bot,
    User,
    Loader2,
    Rocket,
  } from "@lucide/svelte";
  import { onMount, tick } from "svelte";
  import { fade, fly, slide } from "svelte/transition";

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
        console.log("Applying prefilled message:", chatTrigger.prefilledMessage);
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
        const res = await fetch(`/api/chat/history?sessionId=${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            // Map history to our Message type
            messages = data.messages.map((m: any) => ({
              id: `history-${Math.random()}`,
              text: m.text,
              sender: m.sender,
              timestamp: new Date(m.timestamp),
            }));
          }
        }
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
        document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    try {
      const geoRes = await fetch("https://ipapi.co/json/");
      if (geoRes.ok) {
        const geoData = await geoRes.json();
        country = geoData.country_name || "Unknown";
        city = geoData.city || "Unknown";
      }
    } catch (e) {}

    return {
      country,
      city,
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
    const msgIndex = messages.findIndex(m => m.id === messageId);
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
        fetch("/api/chat/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `[Visitor Poll] Business: ${localStorage.getItem("chat_business_type")}, Revenue: ${optionText}`,
            isSystem: true,
            sessionId: sessionId,
            metadata: await getMetadata(),
          }),
        }).catch((e) => console.error(e));

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
      fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userMsg,
          isSystem: false,
          sessionId: sessionId,
          metadata: await getMetadata(),
        }),
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
      await fetch("/api/chat/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          sessionId: sessionId,
        }),
      });

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

<div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
  <!-- Chat Window -->
  {#if isOpen}
    <div
      transition:fade={{ duration: 200 }}
      class="mb-4 flex h-[480px] w-[350px] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800 sm:w-[400px]"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between bg-zinc-900 px-5 py-4 text-white dark:bg-white dark:text-zinc-900"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/20"
          >
            <Bot class="h-6 w-6 text-primary-400 dark:text-primary-600" />
          </div>
          <div>
            <h3 class="font-semibold leading-none">Litekart Agent</h3>
            <p class="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
              We typically reply in minutes
            </p>
          </div>
        </div>
        <button
          onclick={() => {
            isOpen = false;
            localStorage.setItem("chat_manually_closed", "true");
          }}
          class="rounded-full p-2 transition-colors hover:bg-white/10 dark:hover:bg-black/10 text-zinc-400 hover:text-white dark:text-zinc-500 dark:hover:text-black"
          aria-label="Close chat"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Messages -->
      <div
        bind:this={chatBox}
        class="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/10"
      >
        {#each messages as msg (msg.id)}
          {#if msg.sender === "system"}
            <div
              class="flex justify-center my-4"
              transition:fly={{ y: 10, duration: 200 }}
            >
              <div
                class="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs px-3 py-2 rounded-lg text-center shadow-inner max-w-[85%]"
              >
                {msg.text}
              </div>
            </div>
          {:else}
            <div
              class="flex {msg.sender === 'user'
                ? 'justify-end'
                : 'justify-start'}"
              transition:fly={{ y: 10, duration: 200 }}
            >
              {#if msg.sender === "agent"}
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 mr-2 self-end"
                >
                  <Bot class="h-4 w-4 text-primary-600 dark:text-primary-400" />
                </div>
              {/if}

              <div
                class="max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm {msg.sender ===
                'user'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-br-none'
                  : 'bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 rounded-bl-none'}"
              >
                <p
                  class="text-sm leading-relaxed whitespace-pre-wrap font-medium"
                >
                  {msg.text}
                </p>

                {#if msg.options}
                  <div class="mt-3 flex flex-col gap-2">
                    {#each msg.options as option}
                      <button
                        onclick={() => handleOptionClick(option, msg.id)}
                        class="w-full text-left bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-sm py-2 px-3 rounded-xl transition-colors border border-zinc-200 dark:border-zinc-700 font-semibold text-zinc-800 dark:text-zinc-200"
                      >
                        {option}
                      </button>
                    {/each}
                  </div>
                {/if}

                <span
                  class="mt-1 block text-[10px] opacity-50 {msg.sender ===
                  'user'
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
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 ml-2 self-end"
                >
                  <User class="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </div>
              {/if}
            </div>
          {/if}
        {/each}

        {#if isWaitingForAgent && !showEmailForm}
          <div class="flex justify-start" transition:fade>
            <div
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 mr-2 self-end"
            >
              <Bot class="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div
              class="bg-white border border-zinc-100 dark:bg-zinc-900 dark:border-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex gap-1 items-center"
            >
              <span class="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
              ></span>
              <span
                class="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                style="animation-delay: 0.2s"
              ></span>
              <span
                class="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"
                style="animation-delay: 0.4s"
              ></span>
            </div>
          </div>
        {/if}

        {#if showEmailForm}
          <div
            class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm mt-4"
            transition:slide
          >
            <label
              for="fallback-email"
              class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
              >Email Address</label
            >
            <div class="flex gap-2">
              <input
                id="fallback-email"
                type="email"
                bind:value={userEmail}
                placeholder="you@example.com"
                class="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:text-white"
                onkeydown={(e) => {
                  if (e.key === "Enter") submitEmail();
                }}
              />
              <button
                onclick={submitEmail}
                disabled={isSubmittingEmail || !userEmail.includes("@")}
                class="flex shrink-0 items-center justify-center rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 font-medium disabled:opacity-50 transition-transform active:scale-95 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                {#if isSubmittingEmail}
                  <Loader2 class="h-4 w-4 animate-spin" />
                {:else}
                  <Rocket class="h-4 w-4" />
                {/if}
              </button>
            </div>
          </div>
        {/if}
      </div>

      <!-- Input Area -->
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="border-t border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
        onclick={clearNotification}
      >
        <div
          class="relative flex items-end overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 focus-within:ring-2 focus-within:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:ring-white/20"
        >
          <textarea
            bind:this={messageInput}
            bind:value={message}
            onkeydown={handleKeydown}
            onfocus={clearNotification}
            placeholder="Type a message..."
            rows="1"
            class="max-h-[120px] min-h-[44px] w-full resize-none bg-transparent py-3 pl-4 pr-12 text-sm outline-none dark:text-white dark:placeholder:text-zinc-500"
          ></textarea>
          <button
            onclick={sendMessage}
            disabled={!message.trim()}
            class="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white transition-all disabled:opacity-50 disabled:bg-zinc-300 dark:bg-white dark:text-zinc-900 dark:disabled:bg-zinc-700 hover:scale-105 active:scale-95"
            aria-label="Send message"
          >
            <Send class="h-4 w-4" />
          </button>
        </div>
        <div class="mt-2 text-center">
          <span
            class="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium tracking-wide uppercase"
            >Powered by Litekart AI</span
          >
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
    class="group flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 shadow-xl ring-4 ring-zinc-900/20 transition-all hover:scale-105 active:scale-95 dark:bg-white dark:ring-white/20"
    aria-label="Toggle chat"
  >
    {#if isOpen}
      <X
        class="h-6 w-6 text-white dark:text-zinc-900 transition-transform duration-300 group-hover:rotate-90"
      />
    {:else}
      <MessageSquare class="h-6 w-6 text-white dark:text-zinc-900" />
    {/if}
  </button>
</div>
