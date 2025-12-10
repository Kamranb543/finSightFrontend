"use client";

import { useState, useRef, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Bot, User, Download, RotateCcw } from "lucide-react";
import { apiClient, ApiError } from "@/lib/api/client";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface TaxSummary {
  total_income: number;
  total_deductions: number;
  taxable_income: number;
  estimated_tax: number;
  withholding_tax: number;
  net_payable: number;
  net_refund: number;
  is_refund: boolean;
  tax_year: number;
  category: string;
}

export default function TaxFilingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useSelector((state: RootState) => state.auth);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize conversation on mount
  useEffect(() => {
    if (!hasInitialized && user) {
      setHasInitialized(true);
      handleInitialGreeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasInitialized]);

  const handleInitialGreeting = async () => {
    setIsTyping(true);
    try {
      const data = await apiClient.post<{ response: string }>("/auth/tax-filing/chat/", { message: "" });
      
      if (!data.response) {
        throw new Error("Invalid response from server");
      }
      
      const botMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages([botMessage]);
    } catch (error) {
      console.error("Error initializing chat:", error);
      const errorMessage = error instanceof ApiError ? error.message : "Sorry, I'm having trouble connecting. Please make sure the backend server is running.";
      const botMessage: Message = {
        id: Date.now().toString(),
        text: errorMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsTyping(true);

    try {
      const data = await apiClient.post<{ response: string; is_complete?: boolean; tax_summary?: TaxSummary }>(
        "/auth/tax-filing/chat/",
        { message: currentInput }
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (data.is_complete && data.tax_summary) {
        setIsComplete(true);
        setTaxSummary(data.tax_summary);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = error instanceof ApiError ? error.message : "Sorry, I encountered an error. Please try again.";
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleDownloadPDF = async () => {
    try {
      // For PDF downloads, we need to use fetch directly to get blob
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";
      const response = await fetch(`${API_BASE_URL}/auth/tax-filing/download-pdf/`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tax_summary_${taxSummary?.tax_year || '2025'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert(error instanceof Error ? error.message : "Failed to download PDF. Please try again.");
    }
  };

  const handleResetSession = async () => {
    if (!confirm("Are you sure you want to start a new session? This will clear the current conversation.")) {
      return;
    }

    setIsResetting(true);
    try {
      await apiClient.post("/auth/tax-filing/reset/");

      // Clear local state
      setMessages([]);
      setIsComplete(false);
      setTaxSummary(null);
      setHasInitialized(false);
      
      // Reinitialize
      await handleInitialGreeting();
    } catch (error) {
      console.error("Error resetting session:", error);
      const errorMessage = error instanceof ApiError ? error.message : "Failed to reset session. Please try again.";
      alert(errorMessage);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout title="Tax Filing Assistant">
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 -mb-4 sm:-mb-6 lg:-mb-8 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] lg:h-[calc(100vh-8rem)] w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)]">
          <div className="flex flex-col h-full w-full">
          {/* Chat Header */}
          <div className="bg-card/50 backdrop-blur-sm border-b border-border/50 p-3 sm:p-4 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-foreground text-sm sm:text-base truncate">Tax Filing Assistant</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">Ask me anything about taxes</p>
                </div>
              </div>
              {messages.length > 0 && !isComplete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetSession}
                  disabled={isResetting}
                  className="text-muted-foreground hover:text-foreground text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 flex-shrink-0"
                >
                  <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{isResetting ? "Resetting..." : "Reset"}</span>
                  <span className="sm:hidden">{isResetting ? "..." : "Reset"}</span>
                </Button>
              )}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto bg-card/30 backdrop-blur-sm p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-3 sm:space-y-4 px-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                    Welcome to Tax Filing Assistant
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground max-w-md">
                    I can help you with tax deductions, forms, calculations, and more. 
                    Start by asking a question!
                  </p>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-2 sm:gap-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in slide-in-from-bottom-4 duration-500`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {message.sender === "bot" && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-300">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm shadow-md hover:shadow-lg transition-shadow"
                      : "bg-muted text-foreground rounded-tl-sm shadow-sm hover:shadow-md transition-shadow"
                  } animate-in zoom-in-95 duration-300`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                </div>
                {message.sender === "user" && (
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-300">
                    <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 sm:gap-3 justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 sm:px-4 sm:py-3 shadow-sm animate-in zoom-in-95 duration-300">
                  <div className="flex gap-1.5 items-center">
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms] [animation-duration:1.4s]" />
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:200ms] [animation-duration:1.4s]" />
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:400ms] [animation-duration:1.4s]" />
                    <span className="ml-2 text-[10px] sm:text-xs text-muted-foreground/70 animate-pulse">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Tax Summary Card */}
          {isComplete && taxSummary && (
            <div className="p-3 sm:p-4 lg:p-6">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg lg:text-xl">Tax Summary for {taxSummary.tax_year}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Income</p>
                      <p className="text-base sm:text-lg font-semibold break-words">Rs {taxSummary.total_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Total Deductions</p>
                      <p className="text-base sm:text-lg font-semibold break-words">Rs {taxSummary.total_deductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Taxable Income</p>
                      <p className="text-base sm:text-lg font-semibold break-words">Rs {taxSummary.taxable_income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Estimated Tax</p>
                      <p className="text-base sm:text-lg font-semibold break-words">Rs {taxSummary.estimated_tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Withholding Tax</p>
                      <p className="text-base sm:text-lg font-semibold break-words">Rs {taxSummary.withholding_tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {taxSummary.is_refund ? "Expected Refund" : "Net Tax Payable"}
                      </p>
                      <p className={`text-base sm:text-lg font-semibold break-words ${taxSummary.is_refund ? "text-green-500" : "text-destructive"}`}>
                        {taxSummary.is_refund ? "Rs " : "Rs "}
                        {(taxSummary.is_refund ? taxSummary.net_refund : taxSummary.net_payable).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">
                    This is a demo calculation for preview purposes only.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={handleDownloadPDF}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={handleResetSession}
                      disabled={isResetting}
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      {isResetting ? "Resetting..." : "New Session"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="bg-card/50 backdrop-blur-sm border-t border-border/50 p-3 sm:p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isComplete ? "Start a new session..." : "Type your response..."}
                disabled={isTyping || isComplete}
                className="flex-1 bg-background/50 border-border/50 focus:border-primary text-sm sm:text-base h-9 sm:h-10"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!input.trim() || isTyping || isComplete}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-6 h-9 sm:h-10 flex-shrink-0"
              >
                <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </form>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

