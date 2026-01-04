import type { Address, AddressFromAPI } from "../../types/flipkart_old";
import PopupLoader from "../PopupLoader";

type Props = {
  open: boolean;

  addresses: AddressFromAPI[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;

  address: Address;
  setAddress: (a: Address) => void;

  onCancel: () => void;
  onUseThisAddress: () => void;
  onSaveAndPlaceOrder: () => void;

  forceNewAddress: boolean;

  loadingBuy: boolean;
};

export default function AddressPopup({
  open,
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  address,
  setAddress,
  onCancel,
  onUseThisAddress,
  onSaveAndPlaceOrder,
  forceNewAddress,
  loadingBuy,
}: Props) {
  if (!open) return null;
  console.log("AddressPopup:", {
    forceNewAddress,
    addressesLen: addresses.length,
  });

  // Address selection UI
  if (!forceNewAddress && addresses.length > 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-semibold text-white">
            Select Shipping Address
          </h2>
          <p className="text-sm text-gray-400">
            Choose an address from your Flipkart account
          </p>

          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.address_id}
                onClick={() => setSelectedAddressId(addr.address_id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAddressId === addr.address_id
                    ? "border-red-500 bg-red-500/10"
                    : "border-gray-700 bg-gray-800 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedAddressId === addr.address_id
                        ? "border-red-500 bg-red-500"
                        : "border-gray-500"
                    }`}
                  >
                    {selectedAddressId === addr.address_id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white">{addr.name}</h3>
                      {addr.is_default && (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{addr.phone}</p>
                    <p className="text-sm text-gray-400 mt-2">{addr.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onUseThisAddress}
              disabled={!selectedAddressId || loadingBuy}
              className="flex-1 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingBuy ? <PopupLoader /> : "Use This Address"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // New address UI (when no saved addresses)
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 p-6 rounded-2xl w-96 space-y-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white">
          Add Shipping Address
        </h2>
        <p className="text-sm text-gray-400">
          No addresses found in your account. Please add a new address.
        </p>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Full Name"
            value={address.name}
            onChange={(e) => setAddress({ ...address, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={address.phone}
            onChange={(e) =>
              setAddress({
                ...address,
                phone: e.target.value.replace(/\D/g, "").slice(0, 10),
              })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
          <input
            type="text"
            placeholder="Pincode"
            value={address.pincode}
            onChange={(e) =>
              setAddress({
                ...address,
                pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
          <input
            type="text"
            placeholder="Locality/Area"
            value={address.locality}
            onChange={(e) =>
              setAddress({ ...address, locality: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none"
          />
          <textarea
            placeholder="Full Address (House No, Building, Street)"
            value={address.address_line1}
            onChange={(e) =>
              setAddress({ ...address, address_line1: e.target.value })
            }
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-gray-700 text-white outline-none min-h-[80px]"
            rows={3}
          />
        </div>

        <button
          onClick={onSaveAndPlaceOrder}
          disabled={loadingBuy}
          className="w-full py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loadingBuy ? <PopupLoader /> : "Save Address & Place Order"}
        </button>
      </div>
    </div>
  );
}
