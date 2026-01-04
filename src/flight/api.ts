import type { AgodaFlightRequest, BookingFlightRequest, AgodaSelectFlightRequest, AgodaFlightDetailsRequest, AgodaUPIRequest } from "./types";

// const API_BASE_URL = "https://api.khwaaish.com";
const API_BASE_URL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_BASE_URL;

// Helper for verbose logging
const logApiCall = (name: string, url: string, payload: any) => {
    console.group(`API Call: ${name}`);
    console.log(`URL: ${url}`);
    console.log("Method: POST");
    console.log("Headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }");
    console.log("Payload:", JSON.stringify(payload, null, 2));
    console.groupEnd();
};

const logApiResponse = (name: string, status: number, data: any) => {
    console.group(`API Response: ${name}`);
    console.log(`Status: ${status}`);
    console.log("Data:", data);
    console.groupEnd();
};

const logApiError = (name: string, error: any) => {
    console.group(`API Error: ${name}`);
    console.error(error);
    console.groupEnd();
}

// Robust Fetch with Retry
async function fetchWithRetry(url: string, options: RequestInit, retries = 2, delay = 3500): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response;
            }
            // If it's the last attempt, return the error response without throwing yet (let caller handle)
            // OR if it's a 4xx error that likely won't be fixed by retry, maybe return immediately? 
            // BUT user said "second time works", implying even 500s or 400s might be transient context issues.
            // I'll check status. 500s are definitely retryable.

            console.warn(`Attempt ${i + 1} failed with status ${response.status}. Retrying in ${delay}ms...`);

            if (i === retries) return response;

            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed with network error. Retrying in ${delay}ms...`, error);
            if (i === retries) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error("Unreachable");
}


export async function searchAgodaFlights(params: AgodaFlightRequest) {
    const endpoint = `${API_BASE_URL}/api/agoda/flights/search`;
    logApiCall("Agoda Search", endpoint, params);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Agoda API Failed (${response.status}):`, errorText);
            throw new Error(`Agoda API failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Agoda Search", response.status, data);
        return data;
    } catch (error) {
        logApiError("Agoda Search", error);
        throw error;
    }
}

export async function searchBookingFlights(params: BookingFlightRequest) {
    const endpoint = `${API_BASE_URL}/api/booking-flight/search`;
    logApiCall("Booking.com Search", endpoint, params);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Booking.com API Failed (${response.status}):`, errorText);
            throw new Error(`Booking.com API failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Booking.com Search", response.status, data);
        return data;
    } catch (error) {
        logApiError("Booking.com Search", error);
        throw error;
    }
}

export async function searchFlightsSimultaneously(
    agodaParams: AgodaFlightRequest,
    bookingParams: BookingFlightRequest
) {
    console.log("--- Starting Simultaneous Search ---");
    try {
        const results = await Promise.allSettled([
            searchAgodaFlights(agodaParams),
            searchBookingFlights(bookingParams),
        ]);

        const agodaResult = results[0].status === "fulfilled" ? results[0].value : null;
        const bookingResult = results[1].status === "fulfilled" ? results[1].value : null;

        if (results[0].status === "rejected") console.error("Agoda Promise Rejected:", results[0].reason);
        if (results[1].status === "rejected") console.error("Booking Promise Rejected:", results[1].reason);

        return { agoda: agodaResult, booking: bookingResult };
    } catch (error) {
        console.error("Simultaneous Search Error:", error);
        throw error;
    }
}

// --- Booking.com FLOW APIs ---

export async function selectFlight(params: any) {
    const endpoint = `${API_BASE_URL}/api/booking-flight/select-flight`;
    logApiCall("Select Flight", endpoint, params);

    try {
        // Retrying here as user reported flaky behavior
        const response = await fetchWithRetry(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Select Flight Failed (${response.status}):`, errorText);
            throw new Error(`Failed to select flight: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Select Flight", response.status, data);
        return data;
    } catch (error) {
        logApiError("Select Flight", error);
        throw error;
    }
}

export async function selectFare(params: any) {
    const endpoint = `${API_BASE_URL}/api/booking-flight/select-fare`;
    logApiCall("Select Fare", endpoint, params);

    try {
        const response = await fetchWithRetry(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Select Fare Failed (${response.status}):`, errorText);
            throw new Error(`Failed to select fare: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Select Fare", response.status, data);
        return data;
    } catch (error) {
        logApiError("Select Fare", error);
        throw error;
    }
}

export async function submitFlightDetails(params: any) {
    const endpoint = `${API_BASE_URL}/api/booking-flight/details`;
    logApiCall("Flight Details", endpoint, params);

    try {
        const response = await fetchWithRetry(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Flight Details Failed (${response.status}):`, errorText);
            throw new Error(`Failed to submit details: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Flight Details", response.status, data);
        return data;
    } catch (error) {
        logApiError("Flight Details", error);
        throw error;
    }
}

export async function selectTicketType(params: any) {
    const endpoint = `${API_BASE_URL}/api/booking-flight/ticket-type`;
    logApiCall("Select Ticket Type", endpoint, params);

    try {
        const response = await fetchWithRetry(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Select Ticket Type Failed (${response.status}):`, errorText);
            throw new Error(`Failed to select ticket type: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Select Ticket Type", response.status, data);
        return data;
    } catch (error) {
        logApiError("Select Ticket Type", error);
        throw error;
    }
}

export async function submitPayment(params: any) {
    const endpoint = `${API_BASE_URL}/api/booking-flight/payment`;
    logApiCall("Payment", endpoint, params);

    try {
        const response = await fetchWithRetry(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Payment Failed (${response.status}):`, errorText);
            throw new Error(`Failed to submit payment: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Payment", response.status, data);
        return data;
    } catch (error) {
        logApiError("Payment", error);
        throw error;
    }
}

// --- Agoda FLOW APIs ---

export async function selectAgodaFlight(params: AgodaSelectFlightRequest) {
    const endpoint = `${API_BASE_URL}/api/agoda/flights/select`;
    logApiCall("Agoda Select Flight", endpoint, params);

    try {
        // Retrying here to fix the intermittent "first fail" issue
        const response = await fetchWithRetry(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Agoda Select Flight Failed (${response.status}):`, errorText);
            throw new Error(`Agoda Failed to select flight: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Agoda Select Flight", response.status, data);
        return data;
    } catch (error) {
        logApiError("Agoda Select Flight", error);
        throw error;
    }
}

export async function submitAgodaDetails(params: AgodaFlightDetailsRequest) {
    const endpoint = `${API_BASE_URL}/api/agoda/flights/details`;
    logApiCall("Agoda Flight Details", endpoint, params);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Agoda Flight Details Failed (${response.status}):`, errorText);
            throw new Error(`Agoda Failed to submit details: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Agoda Flight Details", response.status, data);
        return data;
    } catch (error) {
        logApiError("Agoda Flight Details", error);
        throw error;
    }
}

export async function submitAgodaUPI(params: AgodaUPIRequest) {
    const endpoint = `${API_BASE_URL}/api/agoda/flights/upi`;
    logApiCall("Agoda UPI Payment", endpoint, params);

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(params),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Agoda UPI Payment Failed (${response.status}):`, errorText);
            throw new Error(`Agoda Failed to submit UPI: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        logApiResponse("Agoda UPI Payment", response.status, data);
        return data;
    } catch (error) {
        logApiError("Agoda UPI Payment", error);
        throw error;
    }
}
