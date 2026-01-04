import { useState, useEffect } from "react";
import {
    selectAgodaFlight,
    submitAgodaDetails,
    submitAgodaUPI
} from "./api";
import type { AgodaFlightDetailsRequest } from "./types";

interface AgodaBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    flight: any;
    initialSessionId: string;
}

// Skeleton Component
const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-gray-800/50 rounded-xl ${className}`}></div>
);

const CardSkeleton = () => (
    <div className="border border-gray-800 rounded-2xl p-5 space-y-4 bg-gray-900/50">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
    </div>
);

export default function AgodaBookingModal({
    isOpen,
    onClose,
    flight,
    initialSessionId,
}: AgodaBookingModalProps) {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState(initialSessionId);

    // Data State
    const [flightData, setFlightData] = useState<any>(null); // From Step 1

    // Form States
    const [contactDetails, setContactDetails] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: ""
    });
    const [passengerDetails, setPassengerDetails] = useState({
        first_name: "",
        last_name: "",
        gender: "male",
        nationality: "IN",
        dob_day: "",
        dob_month: "",
        dob_year: ""
    });

    const [upiId, setUpiId] = useState("");

    // Step 0: Initialize - Call Select Flight
    useEffect(() => {
        if (isOpen && step === 0 && flight) {
            const initBooking = async () => {
                setLoading(true);
                setError(null);
                try {
                    // Use the raw time exactly as received from search API (e.g. "9:50 pm")
                    const departureTime = flight.rawDepartureTime || flight.departureTime;

                    console.log("Agoda Init:", { sessionId, departureTime });

                    const res = await selectAgodaFlight({
                        session_id: sessionId,
                        departure_time: departureTime,
                    });

                    if (res.session_id) setSessionId(res.session_id);
                    setFlightData(res);
                    setStep(1); // Ready to show summary
                } catch (err: any) {
                    console.error("Agoda Select Failed:", err);
                    setError("Failed to select flight. Please check availability.");
                } finally {
                    setLoading(false);
                }
            };
            initBooking();
        }
    }, [isOpen, step, flight]);

    const handleSubmitDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const params: AgodaFlightDetailsRequest = {
                session_id: sessionId,
                contact_first_name: contactDetails.first_name,
                contact_last_name: contactDetails.last_name,
                contact_email: contactDetails.email,
                contact_phone: contactDetails.phone,
                passenger_first_name: passengerDetails.first_name,
                passenger_last_name: passengerDetails.last_name,
                gender: passengerDetails.gender,
                dob_day: passengerDetails.dob_day,
                dob_month: passengerDetails.dob_month,
                dob_year: passengerDetails.dob_year,
                nationality: passengerDetails.nationality
            };

            const res = await submitAgodaDetails(params);
            if (res.session_id) setSessionId(res.session_id);

            setStep(2); // Move to UPI
        } catch (err) {
            setError("Failed to submit passenger details.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitUPI = async () => {
        setLoading(true);
        setError(null);
        try {
            await submitAgodaUPI({
                session_id: sessionId,
                upi_id: upiId
            });
            setStep(3); // Success
        } catch (err) {
            setError("UPI Payment initiation failed.");
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
                        {step === 0 && "Connecting to Agoda..."}
                        {step === 1 && "Confirm Flight Details"}
                        {step === 2 && "Payment Details"}
                        {step === 3 && "Booking Initiated"}
                    </h2>

                    {/* Progress Bar */}
                    {step > 0 && step < 3 && (
                        <div className="flex gap-1 mb-8">
                            {[1, 2].map(s => (
                                <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-teal-500' : 'bg-gray-800'}`}></div>
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
                        </div>
                    ) : (
                        <>
                            {/* Step 1: Flight Summary & Continue */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    {/* Display whatever data came back - robustly */}
                                    <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
                                        <h3 className="text-xl font-bold text-white mb-4">Pricing Details</h3>

                                        {flightData && flightData.price_breakdown ? (
                                            <div className="space-y-3">
                                                {Object.entries(flightData.price_breakdown).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
                                                        <span className="text-gray-400 capitalize text-sm">{key.replace(/_/g, ' ')}</span>
                                                        <span className={`font-semibold ${key === 'total_final' ? 'text-teal-400 text-lg' : 'text-gray-200'}`}>{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : flightData ? (
                                            <div className="space-y-3">
                                                {Object.entries(flightData).map(([key, value]) => {
                                                    if (key === 'session_id') return null;
                                                    if (typeof value === 'object' && value !== null) {
                                                        return (
                                                            <div key={key} className="border-t border-gray-700 pt-2 mt-2">
                                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</p>
                                                                <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap font-mono bg-black/20 p-2 rounded">{JSON.stringify(value, null, 2)}</pre>
                                                            </div>
                                                        )
                                                    }
                                                    return (
                                                        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-0">
                                                            <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                                                            <span className="font-semibold text-white">{String(value)}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400">Flight selected. Proceed to details.</p>
                                        )}
                                    </div>

                                    <div className="space-y-6 pt-4">
                                        <h3 className="text-xl font-bold text-white">Passenger Details</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Contact First Name</label>
                                                <input type="text" value={contactDetails.first_name} onChange={e => setContactDetails({ ...contactDetails, first_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Contact Last Name</label>
                                                <input type="text" value={contactDetails.last_name} onChange={e => setContactDetails({ ...contactDetails, last_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Email</label>
                                                <input type="email" value={contactDetails.email} onChange={e => setContactDetails({ ...contactDetails, email: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Phone</label>
                                                <input type="tel" value={contactDetails.phone} onChange={e => setContactDetails({ ...contactDetails, phone: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-700/50 my-4"></div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Passenger First Name</label>
                                                <input type="text" value={passengerDetails.first_name} onChange={e => setPassengerDetails({ ...passengerDetails, first_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Passenger Last Name</label>
                                                <input type="text" value={passengerDetails.last_name} onChange={e => setPassengerDetails({ ...passengerDetails, last_name: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">DOB Day</label>
                                                <input type="text" placeholder="DD" value={passengerDetails.dob_day} onChange={e => setPassengerDetails({ ...passengerDetails, dob_day: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Month</label>
                                                <input type="text" placeholder="MM(Jan - Dec)" value={passengerDetails.dob_month} onChange={e => setPassengerDetails({ ...passengerDetails, dob_month: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Year</label>
                                                <input type="text" placeholder="YYYY" value={passengerDetails.dob_year} onChange={e => setPassengerDetails({ ...passengerDetails, dob_year: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Gender</label>
                                                <select value={passengerDetails.gender} onChange={e => setPassengerDetails({ ...passengerDetails, gender: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all">
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-semibold text-gray-400 ml-1">Nationality</label>
                                                <input type="text" value={passengerDetails.nationality} onChange={e => setPassengerDetails({ ...passengerDetails, nationality: e.target.value })} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all" />
                                            </div>
                                        </div>

                                        <button onClick={handleSubmitDetails} className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-teal-900/50 mt-4">
                                            Confirm & Proceed to Payment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: UPI Payment */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="text-center mb-6">
                                        <div className="bg-teal-900/30 p-4 rounded-xl inline-block">
                                            <h4 className="text-teal-400 font-bold">Secure Payment via UPI</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-gray-400 ml-1">Enter UPI ID</label>
                                        <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="username@upi" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-teal-500 transition-all" />
                                        <p className="text-xs text-gray-500 ml-1">Example: 9876543210@ybl, username@okhdfcbank</p>
                                    </div>

                                    <button onClick={handleSubmitUPI} className="w-full mt-6 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-teal-900/50">
                                        Pay Now
                                    </button>
                                </div>
                            )}

                            {/* Step 3: Success */}
                            {step === 3 && (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-teal-500/50 animate-bounce-short">
                                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-3">Booking Initiated!</h3>
                                    <p className="text-gray-400 mb-10 text-lg">Your payment request has been sent. Please check your UPI app to complete the transaction.</p>
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
