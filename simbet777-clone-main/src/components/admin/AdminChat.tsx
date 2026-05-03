import { useEffect, useRef, useState } from "react";
import { Send, Loader2, MessageSquare, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  user_id: string;
  sender_role: "user" | "admin";
  body: string;
  created_at: string;
}

interface ChatThread {
  user_id: string;
  username: string;
  email: string;
  lastMessage: string;
  lastAt: string;
}

export function AdminChat() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadThreads = async () => {
    const { data: msgs } = await supabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (!msgs) return;
    const map = new Map<string, Message>();
    for (const m of msgs as Message[]) {
      if (!map.has(m.user_id)) map.set(m.user_id, m);
    }
    const ids = Array.from(map.keys());
    if (ids.length === 0) {
      setThreads([]);
      return;
    }
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, username, email")
      .in("id", ids);
    const profMap = new Map((profs ?? []).map((p) => [p.id, p]));
    setThreads(
      ids.map((id) => {
        const last = map.get(id)!;
        const p = profMap.get(id);
        return {
          user_id: id,
          username: p?.username ?? "Unknown",
          email: p?.email ?? "",
          lastMessage: last.body,
          lastAt: last.created_at,
        };
      }),
    );
  };

  const loadMessages = async (uid: string) => {
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", uid)
      .order("created_at");
    setMessages((data ?? []) as Message[]);
  };

  useEffect(() => {
    loadThreads();
    const ch = supabase
      .channel("admin-support")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload) => {
          loadThreads();
          const m = payload.new as Message;
          if (activeUser && m.user_id === activeUser) {
            setMessages((prev) =>
              prev.find((p) => p.id === m.id) ? prev : [...prev, m],
            );
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [activeUser]);

  useEffect(() => {
    if (activeUser) loadMessages(activeUser);
  }, [activeUser]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!activeUser) return;
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { error } = await supabase
      .from("support_messages")
      .insert({ user_id: activeUser, sender_role: "admin", body });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setText("");
  };

  return (
    <div className="grid h-[70vh] grid-cols-1 gap-4 lg:grid-cols-[280px,1fr]">
      <div className="overflow-y-auto rounded-xl border border-border bg-card/60 p-3 backdrop-blur">
        <h3 className="mb-3 px-2 font-semibold text-foreground">Active chats</h3>
        {threads.length === 0 && (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">No chats yet</p>
        )}
        <div className="space-y-1">
          {threads.map((t) => (
            <button
              key={t.user_id}
              onClick={() => setActiveUser(t.user_id)}
              className={`flex w-full items-start gap-2 rounded-md p-2 text-start transition ${
                activeUser === t.user_id
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <UserIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{t.username}</div>
                <div className="truncate text-xs">{t.lastMessage}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col rounded-xl border border-border bg-card/60 backdrop-blur">
        {!activeUser ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageSquare className="h-10 w-10" />
            <p className="text-sm">Select a conversation to reply</p>
          </div>
        ) : (
          <>
            <div className="border-b border-border p-3">
              <div className="font-semibold text-foreground">
                {threads.find((t) => t.user_id === activeUser)?.username ?? "Conversation"}
              </div>
              <div className="text-xs text-muted-foreground">
                {threads.find((t) => t.user_id === activeUser)?.email}
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      m.sender_role === "admin"
                        ? "bg-[image:var(--gradient-button)] text-primary-foreground"
                        : "border border-border bg-background text-foreground"
                    }`}
                  >
                    <div>{m.body}</div>
                    <div className="mt-1 text-[10px] opacity-70">
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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
                placeholder="Reply as support..."
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
          </>
        )}
      </div>
    </div>
  );
}
