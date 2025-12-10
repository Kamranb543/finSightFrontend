"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, Pencil, Check, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { apiClient, ApiError } from "@/lib/api/client";

interface ExtractedData {
  merchant_name: string | null;
  date: string | null;
  total: string | null;
  subtotal: string | null;
  tax: string | null;
  document_type: string | null;
  suggested_category: string | null;
}

export default function DataExtractionPage() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setExtractedData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await apiClient.post<{ data: ExtractedData }>("/auth/scan-document/", formData);
      setExtractedData(result.data);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : "Failed to analyze document";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleEdit = (key: string, value: string | null) => {
    setEditingKey(key);
    setEditValue(value || "");
  };

  const handleSaveEdit = (key: string) => {
    if (extractedData) {
      setExtractedData({
        ...extractedData,
        [key]: editValue || null,
      });
    }
    setEditingKey(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditValue("");
  };

  const formatKey = (key: string) => {
    return key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleReset = () => {
    setImagePreview(null);
    setExtractedData(null);
    setError(null);
    setSuccessMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!extractedData) return;

    // Validate required fields
    if (!extractedData.merchant_name) {
      setError("Merchant name (description) is required");
      return;
    }
    if (!extractedData.total) {
      setError("Total amount is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Map document_type to transaction type: invoice=INCOME, receipt=EXPENSE
      const transactionType = extractedData.document_type?.toLowerCase() === "invoice" ? "INCOME" : "EXPENSE";

      // Parse amount (handle both string and number)
      const totalStr = String(extractedData.total);
      const amount = parseFloat(totalStr.replace(/[^0-9.-]/g, ""));
      const taxStr = extractedData.tax ? String(extractedData.tax) : null;
      const tax = taxStr ? parseFloat(taxStr.replace(/[^0-9.-]/g, "")) : null;

      const payload = {
        description: extractedData.merchant_name,
        amount: amount,
        type: transactionType,
        tax: tax,
        category_name: extractedData.suggested_category || "",
        is_approved: false,
      };

      await apiClient.post("/auth/transactions/", payload);

      setSuccessMessage("Transaction saved successfully!");
      
      // Redirect to transactions page after 2 seconds
      setTimeout(() => {
        router.push("/transactions");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout title="Data Extraction">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Upload a Document</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Upload an invoice, receipt, or bank statement. FinSight will analyze the document and extract the key data points automatically.
            </p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              {/* Upload Area / Image Preview */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !imagePreview && fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center transition-colors relative overflow-hidden",
                  !imagePreview && "cursor-pointer h-[250px] sm:h-[350px] lg:h-[400px]",
                  imagePreview && "min-h-[250px] sm:min-h-[350px] lg:min-h-[400px]",
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!imagePreview && (
                  <>
                    <div className="bg-secondary p-3 sm:p-4 rounded-full mb-3 sm:mb-4">
                      <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 px-4">Click to upload or drag and drop</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">PNG, JPG, JPEG</p>
                  </>
                )}

                {imagePreview && (
                  <div className="relative w-full">
                    <Image
                      src={imagePreview}
                      alt="Document preview"
                      width={800}
                      height={600}
                      className="w-full h-auto max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] object-contain"
                    />

                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                        <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 text-primary animate-spin mb-3 sm:mb-4" />
                        <p className="text-base sm:text-lg font-medium text-primary text-center">Analyzing Document...</p>
                        <p className="text-xs sm:text-sm text-muted-foreground text-center">Extracting merchant, date, and amount</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-center">
                  {error}
                </div>
              )}

              {/* Success message */}
              {successMessage && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-center">
                  {successMessage}
                </div>
              )}

              {/* Extracted Data Table */}
              {extractedData && !isAnalyzing && (
                <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold">Extracted Data</h3>
                    <Button variant="outline" size="sm" onClick={handleReset} className="text-xs sm:text-sm">
                      Upload New
                    </Button>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-secondary/50">
                        <tr>
                          <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Field</th>
                          <th className="text-left px-3 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm">Value</th>
                          <th className="text-right px-3 sm:px-4 py-2 sm:py-3 font-medium text-xs sm:text-sm w-20">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(extractedData).map(([key, value]) => (
                          <tr key={key} className="border-t border-border">
                            <td className="px-3 sm:px-4 py-2 sm:py-3 font-medium text-muted-foreground text-xs sm:text-sm">
                              {formatKey(key)}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                              {editingKey === key ? (
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="h-8 text-xs sm:text-sm"
                                  autoFocus
                                />
                              ) : (
                                <span className={!value ? "text-muted-foreground italic" : ""}>
                                  {value || "Not detected"}
                                </span>
                              )}
                            </td>
                            <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                              {editingKey === key ? (
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8 text-green-500 hover:text-green-600"
                                    onClick={() => handleSaveEdit(key)}
                                  >
                                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 sm:h-8 sm:w-8"
                                  onClick={() => handleEdit(key, value)}
                                >
                                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {Object.entries(extractedData).map(([key, value]) => (
                      <div key={key} className="border border-border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">{formatKey(key)}</span>
                          {editingKey !== key && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEdit(key, value)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        {editingKey === key ? (
                          <div className="space-y-2">
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="h-8 text-xs"
                              autoFocus
                            />
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-green-500 hover:text-green-600"
                                onClick={() => handleSaveEdit(key)}
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={handleCancelEdit}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className={!value ? "text-muted-foreground italic text-xs" : "text-xs"}>
                            {value || "Not detected"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-3 sm:pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-4 sm:px-8 text-xs sm:text-sm w-full sm:w-auto"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Save Transaction
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
