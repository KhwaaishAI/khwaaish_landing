import { useRef, useEffect } from "react";
import HomeChatBar from "../home/HomeChatBar";

interface Message {
    text: string;
    sender: "user" | "ai";
}

interface ActiveChatProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    selectedCompany: string | null;
    onSelectCompany: (company: string | null) => void;
}

export default function ActiveChat({
    messages,
    onSendMessage,
    selectedCompany,
    onSelectCompany,
}: ActiveChatProps) {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-6">
                <div className="max-w-3xl mx-auto space-y-6 w-full">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === "user"
                                    ? "bg-[#2F2F2F] text-white"
                                    : "bg-transparent text-white/90"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <div className="pb-6">
                <div className="max-w-3xl mx-auto w-full">
                    <HomeChatBar
                        placeholder="Message Khwaaish..."
                        onSendMessage={onSendMessage}
                        selectedCompany={selectedCompany}
                        onSelectCompany={onSelectCompany}
                    />
                </div>
            </div>
        </div>
    );
}
