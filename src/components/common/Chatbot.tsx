import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { executeAgentAction, type AgentExecutionResult } from '../../services/agentActionService';
import {
  X,
  Send,
  User,
  RotateCcw,
  Loader2,
  AlertCircle,
  HelpCircle,
  GripHorizontal,
  Move,
  Mic,
  MicOff,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { sendChatMessage, type ChatMessage } from '../../services/chatService';

const SUGGESTED_QUESTIONS = [
  'Go to dashboard',
  'Open my uploads',
  'Show recent images',
  'View pricing & plans',
  'Open settings',
  'What formats are supported?',
  'How do daily credits work?',
];

const formatCurrentTime = (): string => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

let msgCounter = 0;
const createMsgId = (prefix: string): string => {
  msgCounter += 1;
  return `${prefix}-${Date.now()}-${msgCounter}`;
};

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  sender: 'assistant',
  text:
    "👋 Hi there! I'm **SnapCut Agent**, powered by Gemini AI.\n\nI can answer questions or navigate the site for you via **voice or text**:\n- 🚀 *\"Go to dashboard\"*\n- ✂️ *\"Open my uploads\"*\n- 🖼️ *\"Show recent images\"*\n- 💳 *\"View pricing & plans\"*\n- ⚙️ *\"Open settings\"*",
  timestamp: 'Just now',
};

export const Chatbot: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Position coordinates for freely moving the trigger button & chat window
  const [buttonPos, setButtonPos] = useState<{ x: number; y: number } | null>(null);
  const [windowPos, setWindowPos] = useState<{ x: number; y: number } | null>(null);
  const [isWindowDragging, setIsWindowDragging] = useState(false);
  const [isButtonDragging, setIsButtonDragging] = useState(false);

  // Drag tracking refs
  const buttonDragRef = useRef<{
    isDragging: boolean;
    hasMoved: boolean;
    startPointer: { x: number; y: number };
    startPos: { x: number; y: number };
  }>({
    isDragging: false,
    hasMoved: false,
    startPointer: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
  });

  const windowDragRef = useRef<{
    isDragging: boolean;
    startPointer: { x: number; y: number };
    startPos: { x: number; y: number };
  }>({
    isDragging: false,
    startPointer: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
  });

  const chatWindowRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Initialize and clamp positions upon resize
  useEffect(() => {
    const initPositions = () => {
      // Default floating trigger button at bottom-right
      const defaultBtnX = Math.max(16, window.innerWidth - 88);
      const defaultBtnY = Math.max(16, window.innerHeight - 88);
      setButtonPos((prev) => prev ?? { x: defaultBtnX, y: defaultBtnY });

      // Default window position
      const w = Math.min(420, window.innerWidth - 24);
      const h = Math.min(580, window.innerHeight - 24);
      const defaultWinX = Math.max(16, window.innerWidth - w - 24);
      const defaultWinY = Math.max(16, window.innerHeight - h - 96);
      setWindowPos((prev) => prev ?? { x: defaultWinX, y: defaultWinY });
    };

    initPositions();

    const handleResize = () => {
      setButtonPos((prev) => {
        if (!prev) return prev;
        return {
          x: Math.min(Math.max(8, prev.x), window.innerWidth - 76),
          y: Math.min(Math.max(8, prev.y), window.innerHeight - 76),
        };
      });

      setWindowPos((prev) => {
        if (!prev) return prev;
        const w = Math.min(420, window.innerWidth - 24);
        const h = Math.min(580, window.innerHeight - 24);
        return {
          x: Math.min(Math.max(8, prev.x), window.innerWidth - w - 8),
          y: Math.min(Math.max(8, prev.y), window.innerHeight - h - 8),
        };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom('auto');
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom('smooth');
    }
  }, [isOpen, messages, isLoading]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle click outside to close (without any blur overlay)
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (chatWindowRef.current && chatWindowRef.current.contains(target)) {
        return;
      }
      if (triggerButtonRef.current && triggerButtonRef.current.contains(target)) {
        return;
      }
      setIsOpen(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // ==========================================
  // Drag Handlers for Floating Trigger Button
  // ==========================================
  const handleButtonPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;

    const curPos = buttonPos || {
      x: window.innerWidth - 88,
      y: window.innerHeight - 88,
    };

    buttonDragRef.current = {
      isDragging: true,
      hasMoved: false,
      startPointer: { x: e.clientX, y: e.clientY },
      startPos: curPos,
    };
    setIsButtonDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleButtonPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!buttonDragRef.current.isDragging) return;
    const dx = e.clientX - buttonDragRef.current.startPointer.x;
    const dy = e.clientY - buttonDragRef.current.startPointer.y;

    if (Math.hypot(dx, dy) > 5) {
      buttonDragRef.current.hasMoved = true;
    }

    const newX = Math.min(
      Math.max(8, buttonDragRef.current.startPos.x + dx),
      window.innerWidth - 76
    );
    const newY = Math.min(
      Math.max(8, buttonDragRef.current.startPos.y + dy),
      window.innerHeight - 76
    );

    setButtonPos({ x: newX, y: newY });
  };

  const handleButtonPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!buttonDragRef.current.isDragging) return;
    buttonDragRef.current.isDragging = false;
    setIsButtonDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { }

    // If it was a click and did not move, toggle open/close
    if (!buttonDragRef.current.hasMoved) {
      setIsOpen((prev) => !prev);
    }
  };

  // ==========================================
  // Drag Handlers for Chat Window Header
  // ==========================================
  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    // Don't initiate drag if clicking buttons
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) return;

    const w = Math.min(420, window.innerWidth - 24);
    const h = Math.min(580, window.innerHeight - 24);

    const curPos = windowPos || {
      x: Math.max(16, window.innerWidth - w - 24),
      y: Math.max(16, window.innerHeight - h - 96),
    };

    windowDragRef.current = {
      isDragging: true,
      startPointer: { x: e.clientX, y: e.clientY },
      startPos: curPos,
    };
    setIsWindowDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!windowDragRef.current.isDragging) return;
    const dx = e.clientX - windowDragRef.current.startPointer.x;
    const dy = e.clientY - windowDragRef.current.startPointer.y;

    const w = Math.min(420, window.innerWidth - 24);
    const h = Math.min(580, window.innerHeight - 24);

    const newX = Math.min(
      Math.max(8, windowDragRef.current.startPos.x + dx),
      window.innerWidth - w - 8
    );
    const newY = Math.min(
      Math.max(8, windowDragRef.current.startPos.y + dy),
      window.innerHeight - h - 8
    );

    setWindowPos({ x: newX, y: newY });
  };

  const handleHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!windowDragRef.current.isDragging) return;
    windowDragRef.current.isDragging = false;
    setIsWindowDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch { }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    if (text.length > 1000) {
      setErrorMessage('Message exceeds 1,000 characters limit.');
      return;
    }

    setErrorMessage(null);
    setInputValue('');

    const userMsg: ChatMessage = {
      id: createMsgId('user'),
      sender: 'user',
      text,
      timestamp: formatCurrentTime(),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const { reply, action } = await sendChatMessage(text, newHistory);
      let actionResult: AgentExecutionResult | null = null;

      if (action) {
        actionResult = executeAgentAction(action, { user, isAdmin, navigate });
      }

      const assistantMsg: ChatMessage = {
        id: createMsgId('bot'),
        sender: 'assistant',
        text: actionResult && actionResult.redirectedToLogin
          ? `${reply}\n\n${actionResult.message}`
          : reply,
        timestamp: formatCurrentTime(),
        action,
        actionExecuted: Boolean(actionResult?.executed),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorText = err.message || 'Unable to connect to AI assistant. Please try again.';
      setErrorMessage(errorText);
      const errorMsg: ChatMessage = {
        id: createMsgId('err'),
        sender: 'assistant',
        text: `⚠️ **Error:** ${errorText}`,
        timestamp: formatCurrentTime(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch {}
    };
  }, []);

  const toggleVoiceInput = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Voice commands are not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        setIsListening(false);
        try {
          recognition.stop();
        } catch {}

        if (transcript) {
          setInputValue('');
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser to speak commands.');
        } else if (event.error === 'audio-capture') {
          setErrorMessage('No microphone detected. Please connect a microphone to use voice commands.');
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Voice recognition note: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setErrorMessage('Could not access microphone. Please check browser permissions.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        id: createMsgId('welcome'),
        timestamp: formatCurrentTime(),
      },
    ]);
    setErrorMessage(null);
    setInputValue('');
  };

  // Lightweight inline markdown formatter
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed text-sm">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1.5" />;
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const bulletContent = trimmed.slice(2);
            return (
              <div key={idx} className="flex items-start gap-2 ml-1">
                <span className="text-cyan-400 font-bold mt-1 text-xs">•</span>
                <span className="flex-1">{formatInlineStyles(bulletContent)}</span>
              </div>
            );
          }

          return <p key={idx}>{formatInlineStyles(line)}</p>;
        })}
      </div>
    );
  };

  const formatInlineStyles = (content: string): React.ReactNode => {
    const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 rounded bg-black/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* ========================================== */}
      {/* Draggable Chat Dialog Window */}
      {/* ========================================== */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          role="dialog"
          aria-label="SnapCut AI Assistant"
          style={{
            position: 'fixed',
            left: windowPos ? `${windowPos.x}px` : undefined,
            top: windowPos ? `${windowPos.y}px` : undefined,
            right: !windowPos ? '24px' : undefined,
            bottom: !windowPos ? '96px' : undefined,
            zIndex: 60,
          }}
          className={`w-[calc(100vw-1.5rem)] sm:w-[420px] h-[580px] max-h-[85vh] bg-[#090D16] border border-cyan-500/40 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.85),0_0_35px_rgba(0,242,254,0.25)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
            isWindowDragging ? 'ring-2 ring-cyan-400/60 shadow-[0_30px_90px_rgba(0,242,254,0.35)]' : ''
          }`}
        >
          {/* Draggable Header */}
          <div
            onPointerDown={handleHeaderPointerDown}
            onPointerMove={handleHeaderPointerMove}
            onPointerUp={handleHeaderPointerUp}
            onPointerCancel={handleHeaderPointerUp}
            style={{ touchAction: 'none' }}
            className={`px-4 py-3 bg-[#0D121F] border-b border-white/10 flex items-center justify-between select-none ${isWindowDragging ? 'cursor-grabbing bg-[#111827]' : 'cursor-grab'
              } transition-colors`}
            title="Click and drag anywhere on this header to move the chat window"
          >
            {/* Left: Avatar with exact AI Globe Logo */}
            <div className="flex items-center gap-3">
              <div className="relative group/avatar">
                <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-cyan-400 via-sky-400 to-indigo-500 shadow-[0_0_12px_rgba(0,242,254,0.5)] overflow-hidden">
                  <img
                    src="/chatbot-logo.png"
                    alt="SnapCut AI"
                    className="w-full h-full object-cover rounded-full select-none pointer-events-none"
                    draggable={false}
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0D121F] animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Outfit'] font-bold text-sm text-white">SnapCut AI</h3>
                  <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-semibold shadow-[0_0_8px_rgba(0,242,254,0.2)]">
                    Gemini AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Support, credits & cutout assistant</p>
              </div>
            </div>

            {/* Center: Drag indicator badge */}
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-slate-400 font-mono hover:text-cyan-300 hover:border-cyan-500/30 transition">
              <GripHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Drag</span>
            </div>

            {/* Right: Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Viewport */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Message Avatar */}
                  {isUser ? (
                    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full shrink-0 p-[1.5px] bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_10px_rgba(0,242,254,0.4)] overflow-hidden">
                      <img
                        src="/chatbot-logo.png"
                        alt="AI"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm ${isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-[0_4px_15px_rgba(0,242,254,0.25)] rounded-tr-sm'
                      : msg.isError
                        ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200 rounded-tl-sm'
                        : 'bg-[#121724] border border-white/10 text-slate-200 rounded-tl-sm'
                      }`}
                  >
                    {renderFormattedText(msg.text)}

                    {/* Agentic Navigation Action Pill */}
                    {msg.action && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-mono">
                          <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>Action: <strong className="text-white">{msg.action.label}</strong></span>
                        </div>
                        <button
                          type="button"
                          onClick={() => executeAgentAction(msg.action!, { user, isAdmin, navigate })}
                          className="px-2.5 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition flex items-center gap-1"
                        >
                          <span>Go</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div
                      className={`text-[10px] mt-1 text-right ${isUser ? 'text-cyan-100/70' : 'text-slate-500'
                        }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Live Voice Listening Indicator */}
            {isListening && (
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-3 animate-pulse">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold text-white">Listening...</span>
                <span className="text-[11px] text-slate-400 font-mono ml-auto">Speak a command (e.g. &ldquo;Go to dashboard&rdquo;)</span>
              </div>
            )}

            {/* Typing / Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full shrink-0 p-[1.5px] bg-gradient-to-tr from-cyan-400 to-indigo-500 shadow-[0_0_8px_rgba(0,242,254,0.4)] overflow-hidden">
                  <img
                    src="/chatbot-logo.png"
                    alt="AI"
                    className="w-full h-full object-cover rounded-full animate-pulse"
                  />
                </div>
                <div className="bg-[#121724] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-300 flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-400 font-mono ml-1">Thinking with Gemini AI...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          {messages.length <= 2 && !isLoading && (
            <div className="px-4 pb-2 border-t border-white/5 pt-2">
              <p className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-cyan-400" />
                <span>Suggested questions:</span>
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSendMessage(question)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition text-left"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate flex-1">{errorMessage}</span>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white text-xs font-semibold"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-[#0D121F] border-t border-white/10">
            <div className="relative flex items-center">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? 'Listening... speak your question...' : 'Ask about cutouts, credits, API...'}
                rows={1}
                maxLength={1000}
                className={`w-full pl-3.5 pr-20 py-2.5 bg-[#07090e] border rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none resize-none max-h-24 transition ${
                  isListening
                    ? 'border-cyan-400 ring-1 ring-cyan-400'
                    : 'border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400'
                }`}
              />
              <div className="absolute right-1.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-lg transition ${
                    isListening
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse'
                      : 'text-slate-400 hover:text-cyan-300 hover:bg-white/5'
                  }`}
                  title={isListening ? 'Listening... click to stop' : 'Voice command (speech-to-text)'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-[0_0_10px_rgba(0,242,254,0.3)]"
                  title="Send message (Enter)"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-slate-500 font-mono">
              <span>Press Enter to send</span>
              <span>{inputValue.length}/1000</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Draggable Free-Moving Trigger Button Logo */}
      {/* ========================================== */}
      <div
        ref={triggerButtonRef}
        onPointerDown={handleButtonPointerDown}
        onPointerMove={handleButtonPointerMove}
        onPointerUp={handleButtonPointerUp}
        onPointerCancel={handleButtonPointerUp}
        style={{
          position: 'fixed',
          left: buttonPos ? `${buttonPos.x}px` : undefined,
          top: buttonPos ? `${buttonPos.y}px` : undefined,
          right: !buttonPos ? '24px' : undefined,
          bottom: !buttonPos ? '24px' : undefined,
          touchAction: 'none',
          zIndex: 55,
        }}
        className={`select-none group/btn ${isButtonDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105'
          } transition-transform duration-150`}
        title={
          isOpen
            ? 'Click to close AI chat (or drag anywhere to move)'
            : 'Click to chat with SnapCut AI (or drag anywhere to move)'
        }
      >
        <div className="relative flex items-center justify-center">
          {/* Cybernetic Ambient Pulse Halo */}
          <div className="absolute -inset-2.5 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 opacity-60 blur-lg group-hover/btn:opacity-95 group-hover/btn:blur-xl transition duration-500 pointer-events-none animate-pulse" />

          {/* Outer High-Tech Glowing Orbit Ring */}
          <div className="relative w-16 h-16 rounded-full p-[2.5px] bg-gradient-to-tr from-cyan-300 via-sky-400 to-indigo-600 shadow-[0_0_30px_rgba(0,242,254,0.65)] group-hover/btn:shadow-[0_0_45px_rgba(0,242,254,0.95)] transition-all duration-300">
            {/* The Expert AI Globe Logo */}
            <div className="w-full h-full rounded-full overflow-hidden bg-[#050811] relative flex items-center justify-center">
              <img
                src="/chatbot-logo.png"
                alt="SnapCut AI Assistant"
                className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 ${isOpen ? 'scale-95 opacity-80' : 'scale-105 group-hover/btn:scale-115'
                  }`}
                draggable={false}
              />

              {/* Glass surface reflection shine */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-cyan-500/20 pointer-events-none rounded-full" />

              {/* Glowing X overlay when open */}
              {isOpen && (
                <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center rounded-full border border-cyan-400/50">
                  <X className="w-6 h-6 text-cyan-300 drop-shadow-[0_0_8px_rgba(0,242,254,0.85)]" />
                </div>
              )}
            </div>

            {/* Live Status Indicator Dot */}
            <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#090D16] flex items-center justify-center shadow-[0_0_10px_rgba(52,211,153,0.9)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            </div>
          </div>

          {/* Sleek Tooltip: Drag to move */}
          {!isOpen && !isButtonDragging && (
            <div className="absolute -top-9 whitespace-nowrap px-2.5 py-1 rounded-full bg-[#090D16] border border-cyan-500/40 text-cyan-300 text-[11px] font-mono shadow-[0_4px_15px_rgba(0,0,0,0.6)] pointer-events-none opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
              <Move className="w-3 h-3 text-cyan-400" />
              <span>SnapCut AI • Drag to move</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
