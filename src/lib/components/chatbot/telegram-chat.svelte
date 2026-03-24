<script lang="ts">
	import {
		MessageSquare,
		X,
		Send,
		Bot,
		User,
		Loader2,
		Rocket,
		ChevronRight,
	} from "@lucide/svelte";
	import { onMount, tick } from "svelte";
	import { fade, fly, slide } from "svelte/transition";
	import { chatState } from "$lib/store";

	let isOpen = $state(false);
	let message = $state("");
	let chatBox: HTMLElement | undefined = $state();
	let messageInput: HTMLTextAreaElement | undefined = $state();
	let isWaitingForAgent = $state(false);
	let isPolling = $state(false);
	let timeoutTimer: any = $state(null);
	let showEmailForm = $state(false);
	let userEmail = $state("");
	let isSubmittingEmail = $state(false);
	let emailCaptured = $state(false);
	let engagementTimer: any = $state(null);
	let sessionId = $state("");

	let originalTitle = $state("");
	let titleInterval: any = $state(null);
	let unreadCount = $state(0);

	type Message = {
		id: string;
		text: string;
		sender: "user" | "agent" | "system";
		timestamp: Date;
		options?: string[];
	};

	let messages: Message[] = $state([
		{
			id: "welcome",
			text: "👋 Hi there! I'm your AI Agent. How can I assist you with AI CRUD Pro today?",
			sender: "agent",
			timestamp: new Date(),
		},
	]);

	const scrollToBottom = async () => {
		await tick();
		if (chatBox) {
			chatBox.scrollTo({
				top: chatBox.scrollHeight,
				behavior: "auto"
			});
		}
	};

	$effect(() => {
		if (isOpen && messages.length > 0) {
			scrollToBottom();
		}
	});

	onMount(() => {
		const unsubscribe = chatState.subscribe((state) => {
			if (state.isOpen || state.prefilledMessage) {
				if (state.isOpen && !isOpen) {
					isOpen = true;
					localStorage.removeItem("chat_manually_closed");
					clearNotification();
					startPolling();
					scrollToBottom();
				}
				if (state.prefilledMessage) {
					message = state.prefilledMessage;
					chatState.update((s) => ({ ...s, isOpen: false, prefilledMessage: "" }));
					tick().then(() => {
						if (messageInput) {
							messageInput.focus();
							messageInput.selectionStart = messageInput.selectionEnd = messageInput.value.length;
						}
					});
				}
			}
		});

		(async () => {
			sessionId = localStorage.getItem("chat_session_id") || "";
			if (!sessionId) {
				sessionId = Math.random().toString(36).substring(2, 15);
				localStorage.setItem("chat_session_id", sessionId);
			}

			try {
				const res = await fetch(`/api/chat/history?sessionId=${sessionId}`);
				if (res.ok) {
					const data = await res.json();
					if (data.messages?.length > 0) {
						messages = data.messages.map((m: any) => ({
							id: `history-${Math.random()}`,
							text: m.text,
							sender: m.sender,
							timestamp: new Date(m.timestamp),
						}));
						scrollToBottom();
					}
				}
			} catch (e) {
				console.error("Failed to fetch chat history", e);
			}

			const businessType = localStorage.getItem("chat_business_type");
			const annualRevenue = localStorage.getItem("chat_annual_revenue");

			if (businessType && annualRevenue) {
				emailCaptured = true;
			} else if (localStorage.getItem("chat_manually_closed") !== "true" && messages.length <= 1) {
				engagementTimer = setTimeout(() => {
					const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
					if (!isMobile && !isOpen && messages.length <= 1 && !localStorage.getItem("chat_business_type") && localStorage.getItem("chat_manually_closed") !== "true") {
						pushEngagementQuestions();
					}
				}, 5000);
			}
		})();

		if (typeof document !== "undefined") {
			originalTitle = document.title;
			const handleVisibilityChange = () => { if (!document.hidden && isOpen) clearNotification(); };
			document.addEventListener("visibilitychange", handleVisibilityChange);
		}

		return () => {
			if (engagementTimer) clearTimeout(engagementTimer);
			if (titleInterval) clearInterval(titleInterval);
			unsubscribe();
		};
	});

	const playNotificationSound = () => {
		try {
			const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
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
		} catch (e) {}
	};

	const clearNotification = () => {
		unreadCount = 0;
		if (titleInterval) { clearInterval(titleInterval); titleInterval = null; }
		if (typeof document !== "undefined" && originalTitle) document.title = originalTitle;
	};

	const notifyVisitor = () => {
		if (!isOpen || (typeof document !== "undefined" && document.hidden)) {
			playNotificationSound();
			unreadCount++;
			if (!titleInterval && typeof document !== "undefined") {
				originalTitle = document.title;
				let flip = false;
				titleInterval = setInterval(() => {
					document.title = flip ? originalTitle : `💬 (${unreadCount}) New Message!`;
					flip = !flip;
				}, 1000);
			}
		}
	};

	async function getMetadata() {
		let country = "Unknown", city = "Unknown";
		try {
			const geoRes = await fetch("https://ipapi.co/json/");
			if (geoRes.ok) { const g = await geoRes.json(); country = g.country_name || "Unknown"; city = g.city || "Unknown"; }
		} catch (e) {}
		return {
			country, city,
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
		messages = [...messages, {
			id: `agent-engagement-1`,
			text: "While you're looking around, what best describes your current development setup?",
			sender: "agent",
			timestamp: new Date(),
			options: ["Self-hosted / Local", "Cloud-native", "Serverless"],
		}];
		isOpen = true;
		scrollToBottom();
	};

	const handleOptionClick = async (optionText: string, messageId: string) => {
		messages = messages.map((m) => m.id === messageId ? { ...m, options: undefined } : m);
		messages = [...messages, { id: `user-reply-${Date.now()}`, text: optionText, sender: "user", timestamp: new Date() }];

		if (["Self-hosted / Local", "Cloud-native", "Serverless"].includes(optionText)) {
			localStorage.setItem("chat_business_type", optionText);
			setTimeout(async () => {
				messages = [...messages, {
					id: `agent-revenue-${Date.now()}`,
					text: "Cool! And how many database entities are you typically managing?",
					sender: "agent",
					timestamp: new Date(),
					options: ["1-10 entities", "10-50 entities", "50+ entities"],
				}];
				scrollToBottom();
			}, 800);
		} else if (optionText.includes("entities")) {
			localStorage.setItem("chat_annual_revenue", optionText);
			setTimeout(async () => {
				messages = [...messages, {
					id: `agent-wow-${Date.now()}`,
					text: "That's seriously impressive! 🚀 Let me know if you need any customized architectural help outgrowing your current setup.",
					sender: "agent",
					timestamp: new Date(),
				}];
				scrollToBottom();
				fetch("/api/chat/send", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						text: `[Visitor Poll] Stack: ${localStorage.getItem("chat_business_type")}, Scale: ${optionText}`,
						isSystem: true, sessionId, metadata: await getMetadata(),
					}),
				}).catch(console.error);
				startPolling();
			}, 800);
		}
		scrollToBottom();
	};

	const startPolling = async () => {
		if (isPolling) return;
		isPolling = true;
		const poll = async () => {
			if (!isOpen) { isPolling = false; return; }
			try {
				const response = await fetch(`/api/chat/receive?sessionId=${sessionId}`);
				if (response.ok) {
					const data = await response.json();
					if (data.messages?.length > 0) {
						isWaitingForAgent = false;
						if (timeoutTimer) clearTimeout(timeoutTimer);
						let hasNew = false;
						for (const msg of data.messages) {
							messages = [...messages, { id: `agent-${Date.now()}-${Math.random()}`, text: msg.text, sender: "agent", timestamp: new Date(msg.timestamp) }];
							hasNew = true;
						}
						if (hasNew) { scrollToBottom(); notifyVisitor(); }
					}
				}
			} catch (e) { console.error("Polling error", e); }
			if (isOpen) setTimeout(poll, 3000);
			else isPolling = false;
		};
		poll();
	};

	const triggerTimeout = () => {
		if (!isWaitingForAgent) return;
		messages = [...messages, {
			id: "timeout-system",
			text: "Our team is currently assisting other customers. Please leave your email address so we can get right back to you!",
			sender: "system",
			timestamp: new Date(),
		}];
		showEmailForm = true;
		isWaitingForAgent = false;
		scrollToBottom();
	};

	const sendMessage = async () => {
		if (!message.trim()) return;
		const userMsg = message.trim();
		message = "";
		messages = [...messages, { id: `user-${Date.now()}`, text: userMsg, sender: "user", timestamp: new Date() }];
		scrollToBottom();
		isWaitingForAgent = true;
		if (messages.filter((m) => m.sender === "user").length === 1) {
			timeoutTimer = setTimeout(triggerTimeout, 60000);
		}
		try {
			fetch("/api/chat/send", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ text: userMsg, isSystem: false, sessionId, metadata: await getMetadata() }),
			});
			startPolling();
		} catch (error) { console.error("Error sending message:", error); }
	};

	const submitEmail = async () => {
		if (!userEmail.includes("@")) return;
		isSubmittingEmail = true;
		localStorage.setItem("chat_user_email", userEmail);
		try {
			await fetch("/api/chat/email", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: userEmail, sessionId }),
			});
			showEmailForm = false;
			emailCaptured = true;
			messages = [...messages, { id: "email-captured", text: "Thanks! We've saved your email and will reach out to you shortly.", sender: "system", timestamp: new Date() }];
			scrollToBottom();
		} catch (e) { console.error("Failed to submit email", e); }
		finally { isSubmittingEmail = false; }
	};

	const handleKeydown = (e: KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
	};
</script>

<!-- ── Chat window + bubble ── -->
<div class="widget-root">

	<!-- Chat Window -->
	{#if isOpen}
		<div class="chat-window" transition:fly={{ y: 16, duration: 260, opacity: 0 }}>

			<!-- Header -->
			<div class="chat-header">
				<div class="header-accent"></div>
				<div class="header-left">
					<div class="avatar">
						<Bot size={18} />
					</div>
					<div class="header-info">
						<span class="header-name">Talk to a Human</span>
						<span class="header-status">
							<span class="status-ring">
								<span class="status-ping"></span>
								<span class="status-dot"></span>
							</span>
							Online · Replies in mins
						</span>
					</div>
				</div>
				<button
					class="close-btn"
					onclick={() => { isOpen = false; localStorage.setItem("chat_manually_closed", "true"); }}
					aria-label="Close chat"
				>
					<X size={16} />
				</button>
			</div>

			<!-- Messages -->
			<div class="messages" bind:this={chatBox}>
				<div class="lattice" aria-hidden="true"></div>

				{#each messages as msg (msg.id)}
					{#if msg.sender === "system"}
						<div class="system-msg" transition:fade={{ duration: 200 }}>
							{msg.text}
						</div>
					{:else}
						<div
							class="msg-row {msg.sender === 'user' ? 'msg-row--user' : 'msg-row--agent'}"
							transition:fly={{ y: 10, duration: 300, opacity: 0 }}
						>
							{#if msg.sender === "agent"}
								<div class="msg-avatar msg-avatar--agent"><Bot size={14} /></div>
							{/if}

							<div class="msg-content">
								<div class="bubble {msg.sender === 'user' ? 'bubble--user' : 'bubble--agent'}">
									<p class="bubble-text">{msg.text}</p>

									{#if msg.options}
										<div class="options">
											{#each msg.options as option}
												<button
													class="option-btn"
													onclick={() => handleOptionClick(option, msg.id)}
												>
													{option}
													<ChevronRight size={14} class="option-arrow" />
												</button>
											{/each}
										</div>
									{/if}
								</div>
								<span class="msg-time {msg.sender === 'user' ? 'msg-time--right' : ''}">
									{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
								</span>
							</div>

							{#if msg.sender === "user"}
								<div class="msg-avatar msg-avatar--user"><User size={14} /></div>
							{/if}
						</div>
					{/if}
				{/each}

				<!-- Email capture -->
				{#if showEmailForm}
					<div class="email-card" transition:slide={{ duration: 350 }}>
						<div class="email-card-header">
							<div class="email-icon"><Rocket size={15} /></div>
							<span class="email-title">Stay Connected</span>
						</div>
						<p class="email-desc">Our team is busy right now. Drop your email and we'll reply instantly.</p>
						<div class="email-form">
							<input
								id="fallback-email"
								type="email"
								bind:value={userEmail}
								placeholder="your@email.com"
								class="email-input"
								onkeydown={(e) => { if (e.key === "Enter") submitEmail(); }}
							/>
							<button
								class="email-submit"
								onclick={submitEmail}
								disabled={isSubmittingEmail || !userEmail.includes("@")}
								aria-label="Submit email"
							>
								{#if isSubmittingEmail}
									<Loader2 size={15} class="spin" />
								{:else}
									<Send size={15} />
								{/if}
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Input -->
			<div class="input-area" onclick={clearNotification}>
				<div class="input-wrap">
					<textarea
						bind:this={messageInput}
						bind:value={message}
						onkeydown={handleKeydown}
						onfocus={clearNotification}
						placeholder="Ask anything…"
						rows="1"
						class="msg-input"
					></textarea>
					<button
						class="send-btn"
						onclick={sendMessage}
						disabled={!message.trim()}
						aria-label="Send message"
					>
						<Send size={14} />
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Bubble toggle -->
	<button
		class="bubble-btn"
		onclick={() => {
			isOpen = !isOpen;
			if (isOpen) { localStorage.removeItem("chat_manually_closed"); clearNotification(); startPolling(); }
		}}
		aria-label="Toggle chat"
	>
		{#if unreadCount > 0 && !isOpen}
			<span class="badge" transition:fade={{ duration: 150 }}>{unreadCount}</span>
		{/if}
		{#if isOpen}
			<X size={20} class="bubble-icon" />
		{:else}
			<MessageSquare size={20} class="bubble-icon" />
		{/if}
	</button>
</div>

<style>
	/* ── Root ── */
	.widget-root {
		position: fixed;
		bottom: 24px;
		right: 24px;
		z-index: 100;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 12px;
		font-family: 'Karla', var(--font-sans, system-ui), sans-serif;
	}

	/* ── Chat window ── */
	.chat-window {
		width: 360px;
		height: 520px;
		display: flex;
		flex-direction: column;
		background: #ffffff;
		border-radius: 20px;
		overflow: hidden;
		box-shadow:
			0 4px 6px -1px rgba(0,0,0,.06),
			0 20px 50px -10px rgba(0,0,0,.15),
			0 0 0 1px rgba(0,0,0,.06);
	}

	@media (max-width: 420px) {
		.chat-window { width: calc(100vw - 32px); height: 480px; }
	}

	/* ── Header ── */
	.chat-header {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px 14px 18px;
		background: #fff;
		border-bottom: 1px solid var(--border, #e5d9c8);
		flex-shrink: 0;
	}

	.header-accent {
		position: absolute;
		inset: 0 0 auto 0;
		height: 2px;
		background: linear-gradient(90deg, var(--gold-deep, #8a6010), var(--gold, #b07d1a), var(--gold-bright, #d4920e));
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.avatar {
		width: 38px;
		height: 38px;
		border-radius: 12px;
		background: linear-gradient(135deg, var(--gold-bg, #fef3d8), #fff);
		border: 1px solid var(--border-gold, rgba(201, 146, 34, 0.27));
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--gold, #b07d1a);
		flex-shrink: 0;
	}

	.header-name {
		display: block;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -.02em;
		color: var(--text-primary, #1c140a);
		line-height: 1.2;
	}

	.header-status {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 10.5px;
		font-weight: 600;
		color: var(--text-muted, #7a6a52);
		text-transform: uppercase;
		letter-spacing: .08em;
		margin-top: 3px;
	}

	.status-ring {
		position: relative;
		width: 8px;
		height: 8px;
		flex-shrink: 0;
	}
	.status-ping {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: #4ade80;
		opacity: .6;
		animation: ping 1.4s cubic-bezier(0,0,.2,1) infinite;
	}
	.status-dot {
		position: absolute;
		inset: 1px;
		border-radius: 50%;
		background: #22c55e;
	}

	.close-btn {
		width: 30px;
		height: 30px;
		border-radius: 8px;
		border: none;
		background: transparent;
		color: var(--text-dim, #b8a88a);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background .15s, color .15s;
	}
	.close-btn:hover { background: var(--bg-panel, #f4efe6); color: var(--gold, #b07d1a); }

	/* ── Messages area ── */
	.messages {
		flex: 1;
		overflow-y: auto;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		position: relative;
		background: var(--bg-base, #faf7f2);
		scroll-behavior: smooth;
	}

	.messages::-webkit-scrollbar { width: 3px; }
	.messages::-webkit-scrollbar-track { background: transparent; }
	.messages::-webkit-scrollbar-thumb { background: var(--border-gold, rgba(201, 146, 34, 0.27)); border-radius: 4px; }

	.lattice {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 1L39 20L20 39L1 20Z' fill='none' stroke='%23b07d1a' stroke-opacity='0.04' stroke-width='0.5'/%3E%3C/svg%3E");
		background-size: 40px 40px;
	}

	/* ── System message ── */
	.system-msg {
		align-self: center;
		background: var(--gold-bg, #fef3d8);
		color: var(--gold-deep, #8a6010);
		font-size: 10.5px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: .1em;
		padding: 5px 14px;
		border-radius: 20px;
		border: 1px solid var(--border-gold, rgba(201, 146, 34, 0.27));
		position: relative;
		z-index: 1;
		text-align: center;
		max-width: 80%;
	}

	/* ── Message row ── */
	.msg-row {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		position: relative;
		z-index: 1;
	}
	.msg-row--user { justify-content: flex-end; padding-left: 40px; }
	.msg-row--agent { padding-right: 40px; }

	.msg-avatar {
		width: 28px;
		height: 28px;
		border-radius: 9px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.msg-avatar--agent {
		background: linear-gradient(135deg, var(--gold-bg, #fef3d8), #fff);
		border: 1px solid var(--border-gold, rgba(201, 146, 34, 0.27));
		color: var(--gold, #b07d1a);
	}
	.msg-avatar--user {
		background: var(--text-primary, #1c140a);
		border: 1px solid var(--border-gold, rgba(201, 146, 34, 0.27));
		color: var(--gold-bright, #d4920e);
	}

	.msg-content { display: flex; flex-direction: column; max-width: 100%; }

	/* ── Bubbles ── */
	.bubble {
		border-radius: 16px;
		padding: 11px 15px;
		max-width: 260px;
	}
	.bubble--agent {
		background: #fff;
		border: 1px solid var(--border, #e5d9c8);
		border-bottom-left-radius: 4px;
		box-shadow: var(--shadow-sm);
	}
	.bubble--user {
		background: var(--text-primary, #1c140a);
		border: 1px solid rgba(255,255,255,.06);
		border-bottom-right-radius: 4px;
		box-shadow: var(--shadow-md);
	}

	.bubble-text {
		font-size: 13.5px;
		line-height: 1.6;
		white-space: pre-wrap;
		font-weight: 500;
	}
	.bubble--agent .bubble-text { color: var(--text-primary, #1c140a); }
	.bubble--user  .bubble-text { color: rgba(255,255,255,.92); }

	.msg-time {
		font-size: 9.5px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: .08em;
		color: var(--text-muted, #7a6a52);
		margin-top: 4px;
		padding: 0 2px;
	}
	.msg-time--right { text-align: right; }

	/* ── Option buttons ── */
	.options {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 10px;
	}
	.option-btn {
		width: 100%;
		text-align: left;
		font-size: 12.5px;
		font-weight: 600;
		padding: 9px 13px;
		border-radius: 10px;
		border: 1px solid var(--border, #e5d9c8);
		background: var(--bg-panel, #f4efe6);
		color: var(--text-primary, #1c140a);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: border-color .15s, background .15s, box-shadow .15s;
	}
	.option-btn:hover {
		border-color: var(--gold, #b07d1a);
		background: #fff;
		box-shadow: 0 2px 8px var(--gold-glow, rgba(201, 146, 34, 0.08));
	}
	.option-arrow {
		opacity: 0;
		transform: translateX(-4px);
		transition: opacity .15s, transform .15s;
		color: var(--gold, #b07d1a);
	}
	.option-btn:hover .option-arrow { opacity: 1; transform: translateX(0); }

	/* ── Email capture card ── */
	.email-card {
		background: linear-gradient(135deg, #fff, var(--gold-bg, #fef3d8));
		border: 1px solid var(--border-gold, rgba(201, 146, 34, 0.27));
		border-radius: 16px;
		padding: 18px;
		position: relative;
		z-index: 1;
		box-shadow: var(--shadow-md);
	}

	.email-card-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.email-icon {
		width: 28px;
		height: 28px;
		border-radius: 8px;
		background: var(--gold-bg, #fef3d8);
		border: 1px solid var(--border-gold, rgba(201, 146, 34, 0.27));
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--gold, #b07d1a);
		flex-shrink: 0;
	}

	.email-title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: .1em;
		color: var(--text-primary, #1c140a);
	}

	.email-desc {
		font-size: 12px;
		color: var(--text-muted, #7a6a52);
		line-height: 1.5;
		margin-bottom: 12px;
	}

	.email-form { display: flex; gap: 8px; }

	.email-input {
		flex: 1;
		height: 38px;
		border-radius: 10px;
		border: 1px solid var(--border, #e5d9c8);
		background: var(--bg-panel, #f4efe6);
		padding: 0 13px;
		font-size: 13px;
		font-weight: 500;
		color: var(--text-primary, #1c140a);
		outline: none;
		transition: border-color .15s, box-shadow .15s;
	}
	.email-input::placeholder { color: var(--text-dim, #b8a88a); }
	.email-input:focus {
		border-color: var(--gold, #b07d1a);
		background: #fff;
		box-shadow: 0 0 0 3px var(--gold-glow, rgba(201, 146, 34, 0.08));
	}

	.email-submit {
		width: 38px;
		height: 38px;
		border-radius: 10px;
		border: none;
		background: var(--text-primary, #1c140a);
		color: var(--gold-bright, #d4920e);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		transition: background .15s, transform .1s;
	}
	.email-submit:hover { background: #000; }
	.email-submit:active { transform: scale(.94); }
	.email-submit:disabled { opacity: .3; cursor: not-allowed; }

	/* ── Input area ── */
	.input-area {
		padding: 12px 14px 14px;
		background: #fff;
		border-top: 1px solid var(--border, #e5d9c8);
		flex-shrink: 0;
	}

	.input-wrap {
		display: flex;
		align-items: flex-end;
		gap: 0;
		border: 1px solid var(--border, #e5d9c8);
		border-radius: 14px;
		background: var(--bg-panel, #f4efe6);
		overflow: hidden;
		transition: border-color .15s, box-shadow .15s;
	}
	.input-wrap:focus-within {
		border-color: var(--gold, #b07d1a);
		background: #fff;
		box-shadow: 0 0 0 3px var(--gold-glow, rgba(201, 146, 34, 0.08));
	}

	.msg-input {
		flex: 1;
		min-height: 42px;
		max-height: 120px;
		resize: none;
		border: none;
		background: transparent;
		padding: 11px 14px;
		font-size: 13.5px;
		font-weight: 500;
		color: var(--text-primary, #1c140a);
		line-height: 1.5;
		outline: none;
		font-family: inherit;
	}
	.msg-input::placeholder { color: var(--text-dim, #b8a88a); }

	.send-btn {
		width: 36px;
		height: 36px;
		margin: 3px;
		border-radius: 10px;
		border: none;
		background: var(--text-primary, #1c140a);
		color: var(--gold-bright, #d4920e);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
		transition: background .15s, transform .1s, opacity .15s;
	}
	.send-btn:hover { background: #000; }
	.send-btn:active { transform: scale(.9); }
	.send-btn:disabled { opacity: .2; cursor: not-allowed; }

	/* ── Floating bubble ── */
	.bubble-btn {
		position: relative;
		width: 52px;
		height: 52px;
		border-radius: 16px;
		border: 1px solid var(--border-gold, rgba(201, 146, 34, 0.27));
		background: var(--text-primary, #1c140a);
		color: var(--gold-bright, #d4920e);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow:
			0 4px 12px rgba(0,0,0,.2),
			0 0 0 4px var(--gold-glow, rgba(201, 146, 34, 0.08));
		transition: transform .15s, box-shadow .15s;
	}
	.bubble-btn:hover {
		transform: scale(1.05);
		box-shadow:
			0 6px 20px rgba(0,0,0,.25),
			0 0 0 6px var(--gold-glow, rgba(201, 146, 34, 0.1));
	}
	.bubble-btn:active { transform: scale(.94); }

	.badge {
		position: absolute;
		top: -6px;
		right: -6px;
		min-width: 20px;
		height: 20px;
		padding: 0 5px;
		border-radius: 10px;
		background: var(--gold, #b07d1a);
		color: #fff;
		font-size: 10px;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 0 0 3px #fff;
	}

	/* ── Animations ── */
	@keyframes ping {
		75%, 100% { transform: scale(2); opacity: 0; }
	}
	:global(.spin) { animation: spin .8s linear infinite; }
	@keyframes spin { to { transform: rotate(360deg); } }
</style>