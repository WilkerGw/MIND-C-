import { useState, useRef, useEffect } from "react";
import {
    ChatBubbleOutline,
    Close,
    Send,
    SmartToy
} from "@mui/icons-material";
import { sendMessageToAI } from "../../services/chatService";

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            text: 'Olá! Sou seu assistente virtual. Como posso ajudar com os dados do ERP hoje?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await sendMessageToAI(userMessage.text, "user-123"); // Replace with actual user ID context if available

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] h-[500px] bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">

                    {/* Header */}
                    <div className="bg-emerald-700 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white">
                            <SmartToy fontSize="medium" />
                            <div>
                                <h3 className="font-bold text-sm">Mind ERP AI</h3>
                                <span className="text-xs text-emerald-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-emerald-600 transition-colors"
                        >
                            <Close fontSize="small" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-900/50 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                                            ? 'bg-emerald-600 text-white rounded-br-none'
                                            : 'bg-zinc-700 text-zinc-100 rounded-bl-none'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-zinc-700 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-zinc-800 border-t border-zinc-700">
                        <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Pergunte sobre vendas, estoque..."
                                className="w-full bg-zinc-900 text-white placeholder-zinc-500 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-emerald-500 hover:text-emerald-400 disabled:opacity-50 disabled:hover:text-emerald-500 transition-colors"
                            >
                                <Send fontSize="small" />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={toggleChat}
                className={`p-4 rounded-full shadow-lg shadow-emerald-900/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center ${isOpen ? 'bg-zinc-700 text-white rotate-90' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                    }`}
            >
                {isOpen ? <Close /> : <ChatBubbleOutline />}
            </button>
        </div>
    );
}
