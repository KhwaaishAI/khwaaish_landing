"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import mapIcon from '@/assets/map.png'
import { usePharmEasyFlow } from "./PharmEasyFlowContext"

interface AddressFormData {
  houseNumber: string
  streetName: string
  area: string
  state: string
  recipientName: string
}

export function ConfirmAddressModal() {
  const { setStep, updateAddress, orderData } = usePharmEasyFlow();
  const [formData, setFormData] = useState<AddressFormData>({
    houseNumber: orderData.address?.houseNumber || "",
    streetName: orderData.address?.streetName || "",
    area: orderData.address?.area || "",
    state: orderData.address?.state || "",
    recipientName: orderData.address?.recipientName || "",
  })

  useEffect(() => {
    if (orderData.address) {
      setFormData({
        houseNumber: orderData.address.houseNumber || "",
        streetName: orderData.address.streetName || "",
        area: orderData.address.area || "",
        state: orderData.address.state || "",
        recipientName: orderData.address.recipientName || "",
      });
    }
  }, [orderData.address]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, reverse geocode to get address
          console.log("Location:", position.coords);
        },
        () => {
          console.log("Location access denied");
        }
      );
    }
  }

  const handleConfirmPay = () => {
    // Validate form
    if (!formData.houseNumber || !formData.streetName || !formData.area || !formData.state || !formData.recipientName) {
      alert("Please fill in all fields");
      return;
    }

    updateAddress(formData);
    setStep("payment");
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-lg w-full max-w-sm p-6 border border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-lg font-semibold">Confirm Address</h2>
          <button
            onClick={() => setStep("order")}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Map Image */}
        <div className="relative rounded-lg overflow-hidden mb-6">
          <img src={mapIcon} alt="Location map with address pin" className="w-full h-48 object-cover" />
          <button
            onClick={handleUseCurrentLocation}
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-colors text-nowrap"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1a11 11 0 0 0-11 11 11 11 0 0 0 11 11 11 11 0 0 0 11-11 11 11 0 0 0-11-11m0 20a9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9" />
            </svg>
            Use Current Location
          </button>
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="houseNumber" className="text-slate-400 text-xs mb-2 block">
              House number
            </label>
            <input
              id="houseNumber"
              name="houseNumber"
              type="text"
              placeholder="e.g. 2/58 A"
              value={formData.houseNumber}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="streetName" className="text-slate-400 text-xs mb-2 block">
              Street name
            </label>
            <input
              id="streetName"
              name="streetName"
              type="text"
              placeholder="e.g. MB Colony"
              value={formData.streetName}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="area" className="text-slate-400 text-xs mb-2 block">
              Area / City
            </label>
            <input
              id="area"
              name="area"
              type="text"
              placeholder="e.g. Hyderabad"
              value={formData.area}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="state" className="text-slate-400 text-xs mb-2 block">
              State
            </label>
            <input
              id="state"
              name="state"
              type="text"
              placeholder="e.g. Telangana"
              value={formData.state}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* Recipient Name */}
        <div className="mb-6">
          <label htmlFor="recipientName" className="text-slate-400 text-xs mb-2 block">
            Recipient Name
          </label>
          <input
            id="recipientName"
            name="recipientName"
            type="text"
            placeholder="John Doe"
            value={formData.recipientName}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
          />
        </div>

        {/* Confirm & Pay Button */}
        <Button
          onClick={handleConfirmPay}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-full transition-colors"
        >
          CONFIRM & PROCEED TO PAYMENT
        </Button>
      </div>
    </div>
  )
}
