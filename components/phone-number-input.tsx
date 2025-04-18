"use client"

import { useState } from "react"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { savePhoneNumber } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { phoneNumberSchema } from "@/lib/actions"

interface PhoneNumberInputProps {
  orderId: string
  initialPhoneNumber?: string
}

export function PhoneNumberInput({ orderId, initialPhoneNumber }: PhoneNumberInputProps) {
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || "")
  const [isEditing, setIsEditing] = useState(!initialPhoneNumber)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    // Reset states
    setError(null)
    setSuccess(false)

    try {
      // Validate phone number using zod
      phoneNumberSchema.parse(phoneNumber)

      setIsSubmitting(true)

      // Show loading toast
      const loadingToast = toast({
        title: "Updating phone number",
        description: "Please wait while we save your phone number",
      })

      await savePhoneNumber(orderId, phoneNumber)

      // Dismiss loading toast
      loadingToast.dismiss()

      setSuccess(true)
      setIsEditing(false)

      toast({
        title: "Phone number saved",
        description: "Your phone number has been saved successfully",
        variant: "success",
      })
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      } else {
        setError("Failed to save phone number. Please try again.")

        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to save phone number",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setSuccess(false)
  }

  return (
    <div className="grid gap-2">
      <div className="text-sm font-medium text-muted-foreground">Phone Number</div>

      {!initialPhoneNumber && !success && (
        <div className="flex items-center gap-2 text-sm text-red-500 mb-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Please provide your phone number for order updates</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="tel"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value)
            setError(null)
          }}
          placeholder="e.g. 08012345678"
          disabled={!isEditing || isSubmitting}
          className={`flex-1 transition-all duration-300 shadow-amber ${error ? "border-red-500" : ""}`}
        />

        {isEditing ? (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-amber-500 text-white hover:bg-amber-600 sm:w-auto w-full transition-all duration-300 button-hover shadow-amber"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        ) : (
          <Button
            onClick={handleEdit}
            variant="outline"
            className="border-amber-500/20 hover:bg-amber-500/10 hover:text-amber-500 sm:w-auto w-full transition-all duration-300 button-hover shadow-amber"
          >
            Edit
          </Button>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 flex items-center gap-1 animate-fade-in">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-500 flex items-center gap-1 animate-fade-in">
          <Check className="h-3 w-3 flex-shrink-0" />
          Phone number saved successfully
        </div>
      )}
    </div>
  )
}
