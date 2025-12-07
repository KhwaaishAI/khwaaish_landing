import { useState } from "react";

interface AuthDobPopupProps {
  onClose: (name: string) => void;
  onBack?: () => void;
}

export default function AuthDobPopup({ onClose, onBack }: AuthDobPopupProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60">
      <div
        className="relative bg-black/95 border border-white/20 shadow-2xl text-white font-[Poppins]"
        style={{ width: 512, minHeight: 400, borderRadius: 10 }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-6 top-6 text-xs text-white/60 hover:text-white"
          >
            &lt; Back
          </button>
        )}
        <div className="px-10 pt-8 pb-6">
          <div className="text-center mb-4 space-y-1">
            <img
              src="/images/LOGO.png"
              alt="Khwaaish"
              className="h-8 mx-auto object-contain"
            />
            <h2 className="text-base font-semibold">Complete Your Profile</h2>
            <p className="text-[11px] text-white/60">
              Perfect Ready to continue
            </p>
          </div>

          <div className="space-y-3 text-[11px]">
            <div>
              <label className="block mb-1 text-white/70">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md bg-white/5 border border-white/25 px-3 py-2 text-sm outline-none placeholder-white/40"
                placeholder="Rahul Patel"
              />
            </div>

            <div>
              <label className="block mb-1 text-white/70">Date of Birth</label>
              <div className="relative">
                <button
                  onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                  className={`w-full rounded-md bg-white/5 border border-white/25 px-3 py-2 text-sm outline-none text-left transition-colors hover:bg-white/10 ${selectedDate ? "text-white" : "text-white/40"
                    }`}
                >
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                    : "Select Date of Birth"}
                </button>

                {isCalendarOpen && (
                  <div className="absolute top-0 left-0 z-20">
                    <Calendar
                      selectedDate={selectedDate}
                      onChange={(date) => {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-white/70">Gender</label>
              <div className="flex gap-3">
                {["Male", "Female", "Others"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={`flex-1 rounded-md border px-3 py-2 text-sm outline-none transition-colors ${gender === g
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-white/5 border-white/25 text-white/70 hover:bg-white/10"
                      }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                console.log("Selected Date:", selectedDate);
                console.log("Gender:", gender);
                onClose(name);
              }}
              className="mt-6 w-full h-10 rounded-full bg-red-600 text-xs font-medium hover:bg-red-500"
            >
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calendar({
  selectedDate,
  onChange,
}: {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}) {
  const [viewDate, setViewDate] = useState(new Date(2000, 0, 1));
  const [view, setView] = useState<"days" | "years">("days");

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  ).getDay();

  const handlePrev = () => {
    if (view === "days") {
      setViewDate(
        new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
      );
    } else {
      setViewDate(new Date(viewDate.getFullYear() - 12, 0, 1));
    }
  };

  const handleNext = () => {
    if (view === "days") {
      setViewDate(
        new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
      );
    } else {
      setViewDate(new Date(viewDate.getFullYear() + 12, 0, 1));
    }
  };

  const years = Array.from({ length: 12 }, (_, i) => {
    const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;
    return startYear + i;
  });

  return (
    <div
      className="mt-1 rounded-xl bg-black border border-white/20 text-white flex flex-col"
      style={{
        width: 332,
        height: 350,
        borderRadius: 12,
        padding: 24,
      }}
    >
      <div className="flex items-center justify-between text-xs mb-4">
        <button onClick={handlePrev} className="text-white/60 hover:text-white p-1">
          {"<"}
        </button>
        <button
          onClick={() => setView(view === "days" ? "years" : "days")}
          className="font-semibold hover:text-white/80"
        >
          {view === "days"
            ? viewDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })
            : `${years[0]} - ${years[years.length - 1]}`}
        </button>
        <button onClick={handleNext} className="text-white/60 hover:text-white p-1">
          {">"}
        </button>
      </div>

      {view === "days" ? (
        <>
          <div className="grid grid-cols-7 gap-1 text-[10px] text-white/50 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <span key={d} className="text-center">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-xs">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(
                viewDate.getFullYear(),
                viewDate.getMonth(),
                day
              );
              const isSelected =
                selectedDate?.toDateString() === date.toDateString();
              return (
                <button
                  key={day}
                  onClick={() => onChange(date)}
                  className={`h-8 w-8 rounded-full text-center flex items-center justify-center transition-colors ${isSelected
                    ? "bg-red-600 text-white"
                    : "bg-transparent text-white/80 hover:bg-white/10"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-3 gap-3 text-sm flex-1">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => {
                setViewDate(new Date(year, viewDate.getMonth(), 1));
                setView("days");
              }}
              className={`rounded-lg hover:bg-white/10 ${viewDate.getFullYear() === year ? "bg-white/20" : ""
                }`}
            >
              {year}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
