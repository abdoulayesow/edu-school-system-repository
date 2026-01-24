"use client"

import { useState, useRef } from "react"
import { useExpenseWizard } from "../wizard-context"
import { useI18n } from "@/components/i18n-provider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Receipt, FileText, Info, Upload, X, FileImage, File as FileIcon } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function StepReceipt() {
  const { state, updateData } = useExpenseWizard()
  const { t, locale } = useI18n()
  const { data } = state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        locale === "fr"
          ? `Le fichier est trop volumineux. Taille maximale: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
          : `File is too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      )
      return
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "application/pdf"]
    if (!validTypes.includes(file.type)) {
      setFileError(
        locale === "fr"
          ? "Type de fichier non pris en charge. Utilisez: JPG, PNG, GIF, WebP, ou PDF"
          : "Unsupported file type. Use: JPG, PNG, GIF, WebP, or PDF"
      )
      return
    }

    setFileError(null)
    setIsProcessing(true)

    try {
      // Read file as base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64Data = event.target?.result as string
        updateData({
          receiptFile: file,
          receiptFileData: base64Data,
          receiptFileName: file.name,
          receiptFileType: file.type,
        })
        setIsProcessing(false)
      }
      reader.onerror = () => {
        setFileError(
          locale === "fr"
            ? "Erreur lors de la lecture du fichier"
            : "Error reading file"
        )
        setIsProcessing(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setFileError(
        locale === "fr"
          ? "Erreur lors du traitement du fichier"
          : "Error processing file"
      )
      setIsProcessing(false)
    }
  }

  const handleRemoveFile = () => {
    updateData({
      receiptFile: null,
      receiptFileData: null,
      receiptFileName: null,
      receiptFileType: null,
    })
    setFileError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const isImageFile = data.receiptFileType?.startsWith("image/")

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          {t.expenseWizard?.receiptDocumentation || "Receipt & Documentation"}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          {locale === "fr"
            ? "Ajoutez un reçu ou des notes supplémentaires (optionnel)"
            : "Add a receipt or additional notes (optional)"}
        </p>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Optional Step Notice */}
        <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 animate-in fade-in duration-300">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            {locale === "fr"
              ? "Cette étape est optionnelle. Vous pouvez passer à l'étape suivante sans ajouter de reçu."
              : "This step is optional. You can proceed to the next step without adding a receipt."}
          </AlertDescription>
        </Alert>

        {/* Billing Reference ID */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: "100ms" }}>
          <Label htmlFor="billingReferenceId" className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
              <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            {t.expenses?.billingReference || "Billing Reference"}{" "}
            <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">
              ({t.common?.optional || "optional"})
            </span>
          </Label>
          <Input
            id="billingReferenceId"
            value={data.billingReferenceId || ""}
            onChange={(e) => updateData({ billingReferenceId: e.target.value })}
            placeholder={t.expenses?.billingReferencePlaceholder || "Invoice or receipt number"}
            className="border-2 focus:border-orange-500 dark:focus:border-orange-400 transition-colors"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "fr"
              ? "Numéro de facture, reçu, ou référence de transaction"
              : "Invoice number, receipt number, or transaction reference"}
          </p>
        </div>

        {/* Receipt File Upload */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: "200ms" }}>
          <Label htmlFor="receiptFile" className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/30">
              <FileImage className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            {t.expenses?.receiptFile || "Receipt File"}{" "}
            <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">
              ({t.common?.optional || "optional"})
            </span>
          </Label>

          {/* File Upload Area */}
          {!data.receiptFileName ? (
            <div className="relative">
              <input
                ref={fileInputRef}
                id="receiptFile"
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all duration-300 flex flex-col items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {locale === "fr" ? "Traitement..." : "Processing..."}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t.expenses?.uploadReceiptFile || "Upload receipt"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {locale === "fr"
                          ? "JPG, PNG, GIF, WebP, ou PDF (max 5MB)"
                          : "JPG, PNG, GIF, WebP, or PDF (max 5MB)"}
                      </p>
                    </div>
                  </>
                )}
              </Button>
            </div>
          ) : (
            /* File Preview */
            <div className="rounded-xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              {isImageFile && data.receiptFileData ? (
                /* Image Preview */
                <div className="relative group">
                  <img
                    src={data.receiptFileData}
                    alt="Receipt preview"
                    className="w-full h-auto max-h-96 object-contain bg-white dark:bg-slate-900"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      {locale === "fr" ? "Supprimer" : "Remove"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* PDF Preview */
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50">
                      <FileIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-purple-900 dark:text-purple-100 mb-1">
                        {data.receiptFileName}
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {data.receiptFileType === "application/pdf" ? "PDF Document" : "File"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div className="px-4 py-2 bg-purple-100/50 dark:bg-purple-900/30 border-t border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  {locale === "fr" ? "✓ Fichier téléchargé" : "✓ File uploaded"}
                </p>
              </div>
            </div>
          )}

          {fileError && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
              <AlertDescription>{fileError}</AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.expenses?.receiptOptionalFile || "Upload a receipt image or document (optional)"}
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
          <span className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-wider">
            {locale === "fr" ? "Notes" : "Notes"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
        </div>

        {/* Notes */}
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: "300ms" }}>
          <Label htmlFor="notes" className="text-base font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            {t.expenses?.notes || "Additional Notes"}{" "}
            <span className="text-slate-500 dark:text-slate-400 font-normal text-sm">
              ({t.common?.optional || "optional"})
            </span>
          </Label>
          <Textarea
            id="notes"
            value={data.notes || ""}
            onChange={(e) => updateData({ notes: e.target.value })}
            placeholder={
              locale === "fr"
                ? "Ajoutez des notes ou commentaires supplémentaires..."
                : "Add any additional notes or comments..."
            }
            rows={5}
            className="resize-none border-2 focus:border-orange-500 dark:focus:border-orange-400 transition-colors"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {locale === "fr"
              ? "Contexte additionnel, raisons spéciales, ou autres informations pertinentes"
              : "Additional context, special reasons, or other relevant information"}
          </p>
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="pt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <Receipt className="w-3.5 h-3.5" />
          {locale === "fr"
            ? "Les reçus aident à la vérification et à l'audit"
            : "Receipts help with verification and auditing"}
        </div>
      </div>
    </div>
  )
}
