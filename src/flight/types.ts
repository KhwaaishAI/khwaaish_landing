export interface FlightSearchParams {
    departureFrom: string;
    arrivalTo: string;
    departureDate: string;
    returnDate: string;
    cabinType: string;
    adults: number;
    selectedDepartureTime: string;
    maxStops: string;
}

export interface AgodaFlightRequest {
    departure_from: string;
    arrival_to: string;
    depart_date: string;
    return_date: string;
    cabin_type: string;
    adults: number;
    selected_departure_time: string;
    max_stops: string;
}

export interface BookingFlightRequest {
    from_destination: string;
    to_destination: string;
    date: string;
    number_of_people: number;
}

export interface FlightResult {
    airline: string;
    flightNumber: string;
    departure: string;
    arrival: string;
    duration: string;
    price: number;
    stops: number;
}

export interface SelectFlightRequest {
    session_id: string;
    flight_time: string;
}

export interface SelectFareRequest {
    session_id: string;
    card_index: number;
}

export interface FlightDetailsRequest {
    session_id: string;
    first_name: string;
    last_name: string;
    gender: string;
    email: string;
    phone_number: string;
}

export interface SelectTicketTypeRequest {
    session_id: string;
    ticket_index: number;
}

export interface PaymentRequest {
    session_id: string;
    cardholder_name: string;
    card_number: string;
    expiry_mm_yy: string;
    cvc: string;
    card_brand: string;
}

// --- Agoda Booking Flow Types ---

export interface AgodaSelectFlightRequest {
    session_id: string;
    departure_time: string;
}

export interface AgodaFlightDetailsRequest {
    session_id: string;
    contact_first_name: string;
    contact_last_name: string;
    contact_email: string;
    contact_phone: string;
    passenger_first_name: string;
    passenger_last_name: string;
    gender: string; // "male", "female", etc.
    dob_day: string;
    dob_month: string;
    dob_year: string;
    nationality: string;
}

export interface AgodaUPIRequest {
    session_id: string;
    upi_id: string;
}
