import { useState, useEffect } from "react";
import {
    selectFlight,
    selectFare,
    submitFlightDetails,
    selectTicketType,
    submitPayment,
} from "./api";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    flight: any;
    initialSessionId: string;
}

// Skeleton Component for loading states
const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-800/50 rounded-xl ${className}`}></div>
);

// Loading Skeletons for Cards
const CardSkeleton = () => (
    <div className="border border-gray-800 rounded-2xl p-5 space-y-4 bg-gray-900/50">
        <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <Skeleton className="h-8 w-1/4" />
        <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    </div>
);

export default function BookingModal({
    isOpen,
    onClose,
    flight,
    initialSessionId,
}: BookingModalProps) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState(initialSessionId);
    const [htmlContent, setHtmlContent] = useState<string>("");

    // Dynamic Data from API
    const [fareOptions, setFareOptions] = useState<any[]>([]);
    const [ticketTypeOptions, setTicketTypeOptions] = useState<any[]>([]);

    // Form States
    const [selectedFareIndex, setSelectedFareIndex] = useState<number>(0);
    const [userDetails, setUserDetails] = useState({
        first_name: "",
        last_name: "",
        gender: "male",
        email: "",
        phone_number: "",
    });
    const [selectedTicketIndex, setSelectedTicketIndex] = useState<number>(0);
    const [paymentDetails, setPaymentDetails] = useState({
        cardholder_name: "",
        card_number: "",
        expiry_mm_yy: "",
        cvc: "",
        card_brand: "visa",
    });

    // Step 0: Initialize - Call Select Flight
    useEffect(() => {
        if (isOpen && step === 0 && flight) {
            const initBooking = async () => {
                setLoading(true);
                setError(null);
                try {
                    // Always use the raw time exactly as received from the search API
                    // (same approach as Agoda flow) to match backend expectations.
                    const flightTime = flight.rawDepartureTime || flight.departureTime;

                    console.log("Initializing booking with:", { sessionId, flightTime, rawDepartureTime: flight.rawDepartureTime, displayedDepartureTime: flight.departureTime });

                    const res = await selectFlight({
                        session_id: sessionId,
                        flight_time: flightTime,
                    });

                    if (res.session_id) setSessionId(res.session_id);

                    if (res.fares && Array.isArray(res.fares)) {
                        setFareOptions(res.fares);
                    }

                    setHtmlContent(res.html || res.data || (typeof res === 'string' ? res : ""));
                    setStep(1);
                } catch (err: any) {
                    console.error("Failed to select flight:", err);
                    setError("Failed to initialize booking. Please check logs.");
                } finally {
                    setLoading(false);
                }
            };
            initBooking();
        }
    }, [isOpen, step, flight]);


    const handleSelectFare = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await selectFare({
                session_id: sessionId,
                card_index: selectedFareIndex
            });
            if (res.session_id) setSessionId(res.session_id);
            setHtmlContent(res.html || res.data || (typeof res === 'string' ? res : ""));
            setStep(2);
        } catch (err) {
            setError("Failed to select fare.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await submitFlightDetails({
                session_id: sessionId,
                ...userDetails
            });
            if (res.session_id) setSessionId(res.session_id);

            if (res.ticket_types && Array.isArray(res.ticket_types)) {
                setTicketTypeOptions(res.ticket_types);
            }

            setHtmlContent(res.html || res.data || (typeof res === 'string' ? res : ""));
            setStep(3); // Ticket Type Selection
        } catch (err) {
            setError("Failed to submit details.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectTicketType = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await selectTicketType({
                session_id: sessionId,
                ticket_index: selectedTicketIndex
            });
            if (res.session_id) setSessionId(res.session_id);
            setHtmlContent(res.html || res.data || (typeof res === 'string' ? res : ""));
            setStep(4);
        } catch (err) {
            setError("Failed to select ticket type.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPayment = async () => {
        setLoading(true);
        setError(null);
        try {
            await submitPayment({
                session_id: sessionId,
                ...paymentDetails
            });
            setStep(5); // Success
        } catch (err) {
            setError("Payment failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800 shadow-2xl relative">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors z-20">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="p-6 sm:p-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {step === 0 && "Checking Availability..."}
                        {step === 1 && "Select Your Fare"}
                        {step === 2 && "Passenger Details"}
                        {step === 3 && "Ticket Flexibility"}
                        {step === 4 && "Secure Payment"}
                        {step === 5 && "Booking Confirmed"}
                    </h2>
                    {step > 0 && step < 5 && (
                        <div className="flex gap-1 mb-8">
                            {[1, 2, 3, 4].map(s => (
                                <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-blue-500' : 'bg-gray-800'}`}></div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-4">
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Select Fare */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        {fareOptions.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-4">
                                                {fareOptions.map((fare, idx) => {
                                                    const isSelected = selectedFareIndex === idx;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => setSelectedFareIndex(idx)}
                                                            className={`cursor-pointer group border rounded-2xl p-5 transition-all duration-300 relative overflow-hidden ${isSelected ? 'bg-blue-900/20 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'}`}
                                                        >
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div>
                                                                    <h4 className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-gray-200'}`}>{fare.fare_title || fare.title || `Fare Option ${idx + 1}`}</h4>
                                                                    {fare.total_price && <span className="text-xl font-bold text-green-400 block">{fare.total_price}</span>}
                                                                </div>
                                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-600 group-hover:border-gray-500'}`}>
                                                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>}
                                                                </div>
                                                            </div>

                                                            {/* Features List */}
                                                            {fare.features && Array.isArray(fare.features) && (
                                                                <div className="space-y-2 mt-4 pt-4 border-t border-gray-700/50">
                                                                    {fare.features.map((feat: any, i: number) => {
                                                                        const desc = typeof feat === 'object' ? feat.description : feat;
                                                                        return (
                                                                            <div key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                                                                <svg className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-blue-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                                <span className="leading-snug">{desc}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            /* Fallback only if no dynamic fares found */
                                            <div className="flex gap-4 flex-wrap">
                                                {[0, 1, 2].map((idx) => (
                                                    <label key={idx} className={`flex-1 flex items-center justify-center min-w-[120px] px-4 py-6 border rounded-2xl cursor-pointer transition-all ${selectedFareIndex === idx ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'}`}>
                                                        <input type="radio" name="fare" className="hidden" checked={selectedFareIndex === idx} onChange={() => setSelectedFareIndex(idx)} />
                                                        <span className="font-semibold">Option {idx + 1}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={handleSelectFare} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-900/50">
                                        Continue to Details
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Passenger Details */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-400 ml-1">First Name</label>
                                            <input type="text" value={userDetails.first_name} onChange={e => setUserDetails({ ...userDetails, first_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="e.g. John" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-400 ml-1">Last Name</label>
                                            <input type="text" value={userDetails.last_name} onChange={e => setUserDetails({ ...userDetails, last_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="e.g. Doe" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 ml-1">Gender</label>
                                        <select value={userDetails.gender} onChange={e => setUserDetails({ ...userDetails, gender: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 ml-1">Email Address</label>
                                        <input type="email" value={userDetails.email} onChange={e => setUserDetails({ ...userDetails, email: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="john@example.com" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 ml-1">Phone Number</label>
                                        <input type="tel" value={userDetails.phone_number} onChange={e => setUserDetails({ ...userDetails, phone_number: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="+91 9876543210" />
                                    </div>
                                    <button onClick={handleSubmitDetails} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-blue-900/50">
                                        Submit & Continue
                                    </button>
                                </div>
                            )}

                            {/* Step 3: Ticket Type */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        {ticketTypeOptions.length > 0 ? (
                                            <div className="flex flex-col gap-4">
                                                {ticketTypeOptions.map((ticket, idx) => {
                                                    const isSelected = selectedTicketIndex === idx;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => setSelectedTicketIndex(idx)}
                                                            className={`cursor-pointer group border rounded-2xl p-6 transition-all duration-300 relative overflow-hidden ${isSelected ? 'bg-purple-900/20 border-purple-500 shadow-xl shadow-purple-500/10' : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800 hover:border-gray-600'}`}
                                                        >
                                                            <div className="flex justify-between items-start mb-4">
                                                                <div>
                                                                    <h4 className={`font-bold text-xl ${isSelected ? 'text-white' : 'text-gray-200'}`}>{ticket.title || ticket.name || ticket.label || `Option ${idx + 1}`}</h4>
                                                                    {ticket.price && <span className="text-lg font-semibold text-green-400 block mt-1">{ticket.price}</span>}
                                                                </div>
                                                                <div className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-600 group-hover:border-gray-500'}`}>
                                                                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>}
                                                                </div>
                                                            </div>

                                                            {/* Description text */}
                                                            {(ticket.description || ticket.subtitle) && (
                                                                <p className="text-sm text-gray-400 mb-4 pb-4 border-b border-gray-700/50">
                                                                    {ticket.description || ticket.subtitle}
                                                                </p>
                                                            )}

                                                            {/* Features / Benefits List */}
                                                            {(ticket.features || ticket.benefits || ticket.inclusions) && (
                                                                <div className="space-y-3">
                                                                    {(ticket.features || ticket.benefits || ticket.inclusions).map((feat: any, i: number) => {
                                                                        const desc = typeof feat === 'object' ? (feat.description || feat.text || JSON.stringify(feat)) : feat;
                                                                        return (
                                                                            <div key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                                                                <svg className={`w-5 h-5 shrink-0 ${isSelected ? 'text-purple-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                                <span className="leading-snug">{desc}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            /* Fallback */
                                            <div className="grid grid-cols-2 gap-4">
                                                {[0, 1].map((idx) => (
                                                    <label key={idx} className={`flex flex-col items-center justify-center p-6 border rounded-2xl cursor-pointer transition-all ${selectedTicketIndex === idx ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500'}`}>
                                                        <input type="radio" name="ticketType" className="hidden" checked={selectedTicketIndex === idx} onChange={() => setSelectedTicketIndex(idx)} />
                                                        <span className="font-bold text-lg mb-1">{idx === 0 ? "Standard" : "Flexible"}</span>
                                                        <span className="text-xs opacity-70">{idx === 0 ? "Best value" : "Free cancellation"}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={handleSelectTicketType} className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-900/50">
                                        Continue to Payment
                                    </button>
                                </div>
                            )}

                            {/* Step 4: Payment */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="bg-gray-800/80 p-5 rounded-2xl mb-4 border border-gray-700/50 shadow-inner">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-400 text-sm">Amount to Pay</span>
                                            <span className="text-2xl font-bold text-green-400">₹{flight.price.toLocaleString("en-IN")}</span>
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-1 flex items-center gap-2">
                                            <span className="bg-gray-700 px-1.5 py-0.5 rounded">{flight.airline}</span>
                                            <span>{flight.flightNumber}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 ml-1">Cardholder Name</label>
                                        <input type="text" value={paymentDetails.cardholder_name} onChange={e => setPaymentDetails({ ...paymentDetails, cardholder_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" placeholder="Name on card" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-400 ml-1">Card Number</label>
                                        <div className="relative">
                                            <input type="text" value={paymentDetails.card_number} onChange={e => setPaymentDetails({ ...paymentDetails, card_number: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" placeholder="0000 0000 0000 0000" />
                                            <svg className="w-6 h-6 absolute left-3 top-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-400 ml-1">Expiry Date</label>
                                            <input type="text" value={paymentDetails.expiry_mm_yy} onChange={e => setPaymentDetails({ ...paymentDetails, expiry_mm_yy: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" placeholder="MM/YY" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-gray-400 ml-1">CVC</label>
                                            <input type="text" value={paymentDetails.cvc} onChange={e => setPaymentDetails({ ...paymentDetails, cvc: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all" placeholder="123" />
                                        </div>
                                    </div>

                                    <button onClick={handleSubmitPayment} className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-green-900/50">
                                        Pay & Confirm Booking
                                    </button>
                                </div>
                            )}

                            {/* Step 5: Success */}
                            {step === 5 && (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-500/50 animate-bounce-short">
                                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-3">Booking Confirmed!</h3>
                                    <p className="text-gray-400 mb-10 text-lg">Your flight has been successfully booked and tickets have been sent to your email.</p>
                                    <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 px-10 rounded-xl transition-all border border-gray-700 hover:border-gray-500">
                                        Close Window
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
