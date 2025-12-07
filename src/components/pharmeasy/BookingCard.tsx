"use client"

import { useState } from "react"
import { X, MapPin } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import mapImg from '../assets/map.png'
export function BookingCard() {
  const [location, setLocation] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleUseCurrentLocation = () => {
    // Placeholder for geolocation functionality
    setLocation("Current location")
  }

  const handleSendOTP = () => {
    if (!location || !phoneNumber) {
      alert("Please fill in all fields")
      return
    }
    setIsLoading(true)
    // Simulate OTP sending
    setTimeout(() => {
      setIsLoading(false)
      alert("OTP sent to " + phoneNumber)
    }, 1000)
  }

  return (
    <div className="w-full max-w-sm bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
      {/* Header with Close Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Booking Details</h2>
        <button className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Map Section */}
      <div className="relative mb-6 rounded-xl overflow-hidden bg-slate-800 h-48">
        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
          <img src={mapImg} alt="Location map" className="w-full h-full object-cover" />
        </div>
        {/* Location Button */}
        <button
          onClick={handleUseCurrentLocation}
          className="absolute bottom-3 left-3 bg-gradient-to-r from-amber-400 to-red-500 text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 hover:shadow-lg transition-shadow"
        >
          <MapPin className="w-4 h-4" />
          Use current location
        </button>
      </div>

      {/* Location Input */}
      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-2">Enter location</label>
        <Input
          type="text"
          placeholder="e.g., Hyderabad"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-slate-800 border-slate-700 text-white placeholder-slate-500 rounded-lg"
        />
      </div>

      {/* Phone Number Input */}
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-2">Enter Mobile Number</label>
        <div className="flex gap-2">
          <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 flex items-center text-slate-400 text-sm font-medium">
            +91
          </div>
          <Input
            type="tel"
            placeholder="1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="flex-1 bg-slate-800 border-slate-700 text-white placeholder-slate-500 rounded-lg"
          />
        </div>
      </div>

      {/* Send OTP Button */}
      <Button
        onClick={handleSendOTP}
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-full transition-colors disabled:opacity-50"
      >
        {isLoading ? "Sending..." : "SEND OTP"}
      </Button>
    </div>
  )
}
