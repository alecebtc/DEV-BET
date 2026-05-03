import { useEffect, useRef, useState } from "react";
import { X, Send, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  user_id: string;
  sender_role: "user" | "admin";
  body: string;
  created_at: string;
}

interface Props {
  userId: string;
  open: boolean;
  onClose: () => void;
}

export function SupportChat({ userId, open, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at")
      .then(({ data }) => {
        if (active && data) setMessages(data as Message[]);
      });

    const channel = supabase
      .channel(`support-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${userId}` },
        (payload) => {
          setMessages((prev) => {
            const m = payload.new as Message;
            if (prev.find((p) => p.id === m.id)) return prev;
            return [...prev, m];
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [open, userId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { error } = await supabase
      .from("support_messages")
      .insert({ user_id: userId, sender_role: "user", body });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setText("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 end-0 z-[55] flex w-full max-w-sm flex-col border-s border-border bg-card shadow-2xl">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Support Chat</h3>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Start a conversation with our support team.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.sender_role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                m.sender_role === "user"
                  ? "bg-[image:var(--gradient-button)] text-primary-foreground"
                  : "border border-border bg-background text-foreground"
              }`}
            >
              <div>{m.body}</div>
              <div className="mt-1 text-[10px] opacity-70">
                {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          maxLength={2000}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-md bg-[image:var(--gradient-button)] text-primary-foreground disabled:opacity-50"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
