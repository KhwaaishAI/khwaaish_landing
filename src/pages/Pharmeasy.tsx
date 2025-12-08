import React, { useState } from "react";
import FlowerLoader from "../components/FlowerLoader";
import PopupLoader from "../components/PopupLoader";
import VoiceRecorderButton from "../components/VoiceRecorderButton";

const BaseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

interface Message {
    id: string;
    role: "user" | "system";
    content: string;
}

export default function Pharmeasy() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showChat, setShowChat] = useState(false);

    // Reusing similar logic as Instamart for consistency, assuming similar API structure for now to fix crash
    // In a real scenario, this would be specific to Pharmeasy API
    const [showPhonePopup, setShowPhonePopup] = useState(false);
    const [showOtpPopup, setShowOtpPopup] = useState(false);

    const pushSystem = (text: string) =>
        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "system", content: text },
        ]);

    const pushUser = (text: string) =>
        setMessages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), role: "user", content: text },
        ]);

    const handleSend = async () => {
        if (!messageInput.trim()) return;

        setShowChat(true);
        pushUser(messageInput);
        const userText = messageInput;
        setMessageInput("");
        setIsLoading(true);

        try {
            // Using pharmeasy endpoint
            const res = await fetch(`${BaseURL}api/pharmeasy/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: userText }),
            });

            const data = await res.json();

            // Basic response handling
            if (data.results) {
                pushSystem(
                    JSON.stringify({
                        type: "product_list",
                        products: data.results,
                    })
                );
            } else {
                pushSystem(data.message || "I found some medicines for you.");
            }

        } catch (err) {
            console.log("Pharmeasy search error:", err);
            pushSystem("Something went wrong! " + err);
        }

        setIsLoading(false);
    };

    const renderMessage = (m: Message) => {
        let parsed: any;
        try {
            parsed = JSON.parse(m.content);
        } catch {
            parsed = m.content;
        }

        let content: React.ReactNode = null;

        if (typeof parsed === "object" && parsed?.type === "product_list") {
            content = (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {parsed.products?.map((p: any, idx: number) => (
                        <div key={idx} className="bg-gray-800 p-3 rounded-lg">
                            <img src={p.image_url} alt={p.name} className="w-full h-32 object-contain bg-white rounded-md mb-2" />
                            <p className="font-bold text-sm line-clamp-2">{p.name}</p>
                            <p className="text-green-400">₹{p.price}</p>
                        </div>
                    ))}
                </div>
            )
        } else {
            content = <p>{String(parsed)}</p>;
        }

        return (
            <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"
                    }`}
            >
                <div
                    className={`${m.role === "user"
                            ? "bg-white/15 text-white border-white/20"
                            : "bg-gray-900/80 text-gray-100 border-gray-800"
                        } 
          max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-2xl px-4 py-3 border`}
                >
                    {content}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen w-screen bg-black text-white">
            {/* Sidebar - copied structure */}
            <aside
                className={
                    `fixed left-0 top-0 z-40 h-full border-r border-gray-800 bg-black transition-transform duration-300 ` +
                    `w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`
                }
            >
                <div className="flex justify-between items-center gap-2 px-4 py-3">
                    <button
                        className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <img src="/images/LOGO.png" alt="Khwaaish AI" className="h-12 w-auto object-contain" />
                    </button>
                    <button
                        onClick={() => setSidebarOpen((v) => !v)}
                        className="p-1 hover:bg-gray-900 rounded"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                    </button>
                </div>
                <div className="px-3">
                    <button
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-900 transition-colors"
                        onClick={() => {
                            setShowChat(true);
                            setMessages([]);
                            setMessageInput("");
                        }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        <span>New chat</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative">
                <div className="sticky top-0 left-0 right-0 z-20 p-2 flex items-center justify-between">
                    {!sidebarOpen && (
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="absolute left-4 top-4 z-40 p-1 hover:bg-gray-900 rounded"
                        >
                            <img src="/images/Circle.png" alt="Open" className="h-8 w-8 object-contain" />
                        </button>
                    )}
                    <div className="ml-auto flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-sm font-semibold">P</div>
                    </div>
                </div>

                {showChat ? (
                    <div className="relative min-h-screen w-full bg-black overflow-hidden flex flex-col">
                        <div className="flex-1 h-[calc(100vh-80px)] overflow-y-auto px-4 py-6 space-y-4 pb-24">
                            {messages.map((m) => renderMessage(m))}
                            {isLoading && <FlowerLoader />}
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="fixed bottom-0 left-0 right-0 z-40 mx-auto max-w-4xl px-4 py-4 bg-gradient-to-t from-black via-black/80 to-transparent"
                        >
                            <div className="flex items-center gap-3 rounded-full px-4 py-3 border border-gray-800 bg-white/10 backdrop-blur">
                                <input
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    className="flex-1 bg-transparent text-white placeholder-white/60 outline-none"
                                    placeholder="Search medicines..."
                                />
                                <button type="submit" className="p-2 bg-teal-500 rounded-full hover:bg-teal-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <img src="/logo/pharmeasy.jpg" alt="PharmEasy" className="h-20 w-20 object-contain rounded-xl" />
                        <h2 className="text-3xl font-bold">PharmEasy with Khwaaish AI</h2>
                        <p className="text-gray-400">Order medicines and healthcare products instantly.</p>

                        <div className="w-full max-w-xl">
                            <div className="flex items-center gap-3 rounded-full px-6 py-4 border border-gray-800 bg-gray-900/50 hover:bg-gray-900 transition-colors cursor-text" onClick={() => setShowChat(true)}>
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <span className="text-gray-400 text-lg">Search for medicines...</span>
                            </div>
                        </div>
                    </div>
                )}
            </main>

        </div>
    );
}
