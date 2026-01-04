import React from "react";
import PopupLoader from "../PopupLoader";
import type {
  ShoppersStopAddress,
  ShoppersStopBill,
} from "../../types/shoppersstop";

type Props = {
  open: boolean;
  addresses: ShoppersStopAddress[];
  selectedAddressId: string;
  setSelectedAddressId: (v: string) => void;

  bill?: ShoppersStopBill | null;

  onContinue: () => void;
  onCancelBack: () => void;

  loading: boolean;
};

export default function ShoppersStopSelectAddressPopup({
  open,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  bill,
  onContinue,
  onCancelBack,
  loading,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">
          Select Shipping Address
        </h2>
        <p className="text-sm text-gray-400">
          Choose an address from your Shoppers Stop account
        </p>

        {bill ? (
          <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-400">Bill</p>
            <p className="text-sm text-white mt-1">
              Payable: {bill.total_payable}
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          {addresses.map((addr, i) => {
            // ---- LOGIC UNCHANGED: selection is based on address_id ----
            const id = addr.address_id;
            const isSelected = selectedAddressId === id;

            // UI mapping (no logic changes)
            const name = addr.label || addr.name || "Saved address";
            const addressText = addr.address || "";
            const phone = addr.phone || "";
            const isDefault = i === 0; // purely UI hint; does not affect selection logic

            return (
              <div
                key={id || `${i}`}
                onClick={() => {
                  console.log("SHOPPERSSTOP UI address clicked:", id, addr);
                  setSelectedAddressId(id);
                }}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                      isSelected
                        ? "border-red-500 bg-red-500"
                        : "border-gray-500"
                    }`}
                  >
                    {isSelected ? (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-semibold text-white">{name}</h3>

                      {isDefault ? (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                          Default
                        </span>
                      ) : null}
                    </div>

                    {phone ? (
                      <p className="text-sm text-gray-300 mt-1">{phone}</p>
                    ) : null}

                    {addressText ? (
                      <p className="text-sm text-gray-400 mt-2">
                        {addressText}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancelBack}
            disabled={loading}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onContinue}
            disabled={!selectedAddressId || loading}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <PopupLoader /> : null}
            Pay
          </button>
        </div>
      </div>
    </div>
  );
}
