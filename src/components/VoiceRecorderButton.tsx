import React, { useRef, useState } from "react";
const TRANSCRIBE_BASE_URL = "https://voice.khwaaish.com"
;

interface VoiceRecorderButtonProps {
  onTextReady: (text: string) => void;
}

export default function VoiceRecorderButton({ onTextReady }: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const mimeTypeRef = useRef<string>("audio/webm");

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Prefer an m4a-compatible container (audio/mp4). If not supported,
      // gracefully fall back to webm so recording still works.
      const preferredMime = "audio/mp4";
      const fallbackMime = "audio/webm";
      const mimeType =
        (window as any).MediaRecorder &&
        (MediaRecorder as any).isTypeSupported &&
        (MediaRecorder as any).isTypeSupported(preferredMime)
          ? preferredMime
          : fallbackMime;

      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
        if (!blob.size) return;

        setIsTranscribing(true);
        try {
          const formData = new FormData();
          const fileName = mimeTypeRef.current === "audio/mp4" ? "recording.m4a" : "recording.webm";
          formData.append("file", blob, fileName);
          // Hint to backend that we want English transcription
          formData.append("language", "en");

          const res = await fetch(`${TRANSCRIBE_BASE_URL}/transcribe`, {
            method: "POST",
            body: formData,
          });

          const data = await res.json();
          console.log("/transcribe response", data);

          // If backend says this was only an audio event (no actual speech),
          // skip inserting weird tokens like "(twelve second pause)".
          const words = data?.raw?.words as Array<{ type?: string }> | undefined;
          const onlyAudioEvents =
            Array.isArray(words) &&
            words.length > 0 &&
            words.every((w) => (w?.type || "").toLowerCase() === "audio_event");

          if (onlyAudioEvents) {
            return;
          }

          let finalText = "";
          if (data && typeof data.text === "string" && data.text.trim()) {
            finalText = data.text.trim();
          } else if (data && data.raw && typeof data.raw.text === "string" && data.raw.text.trim()) {
            finalText = data.raw.text.trim();
          }

          if (finalText) {
            onTextReady(finalText);
          }
        } catch (error) {
          console.error("Transcription error", error);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error", err);
      setIsRecording(false);
    }
  };

  const disabled = isTranscribing;

  return (
    <button
      type="button"
      onClick={handleToggleRecording}
      disabled={disabled}
      className={`p-2 rounded-full flex items-center justify-center transition-colors border border-transparent ${
        disabled
          ? "bg-white/10 cursor-not-allowed"
          : isRecording
          ? "bg-red-600 hover:bg-red-500"
          : "bg-white/10 hover:bg-white/20"
      }`}
    >
      {isTranscribing ? (
        <svg
          className="w-4 h-4 animate-spin text-white"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      ) : (
        <svg
          className="w-5 h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 1a3 3 0 00-3 3v6a3 3 0 006 0V4a3 3 0 00-3-3z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10a7 7 0 0014 0M12 17v4m0 0h-3m3 0h3"
          />
        </svg>
      )}
    </button>
  );
}
