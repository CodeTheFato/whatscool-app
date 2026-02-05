"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Check, Building2, Phone, MessageSquare, UserCog } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SchoolPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [formData, setFormData] = useState({
    schoolName: "",
    taxId: "",
    schoolType: "",
    studentCount: "",
    city: "",
    state: "",
    mainEmail: "",
    officePhone: "",
    whatsapp: "",
    whatsappType: "personal",
    timezone: "America/Sao_Paulo",
    responsibleName: "",
    role: "",
    loginEmail: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Add form submission logic here
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const stepIcons = [Building2, Phone, MessageSquare, UserCog]
  const stepLabels = ["School", "Contact", "WhatsApp", "Admin"]

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((step) => {
        const Icon = stepIcons[step - 1]
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => goToStep(step)}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 font-semibold transition-colors ${step === currentStep
                  ? "bg-primary text-primary-foreground border-primary"
                  : step < currentStep
                    ? "bg-primary/20 text-primary border-primary"
                    : "bg-background text-muted-foreground border-border"
                  }`}
              >
                {step < currentStep ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </button>
              <span className="text-xs font-medium text-muted-foreground">{stepLabels[step - 1]}</span>
            </div>
            {step < 4 && <div className={`w-12 h-0.5 mx-2 ${step < currentStep ? "bg-primary" : "bg-border"}`} />}
          </div>
        )
      })}
    </div>
  )

  return (
    <main className="flex justify-center">
      <div className="w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Register School</h1>
          <p className="text-muted-foreground mt-2">Fill in the school information to get started</p>
        </div>

        <StepIndicator />

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School name *</Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => handleChange("schoolName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / CNPJ</Label>
                  <Input
                    id="taxId"
                    value={formData.taxId}
                    onChange={(e) => handleChange("taxId", e.target.value)}
                    placeholder="00.000.000/0000-00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="schoolType">School type</Label>
                  <Select value={formData.schoolType} onValueChange={(value) => handleChange("schoolType", value)}>
                    <SelectTrigger id="schoolType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preschool">Preschool</SelectItem>
                      <SelectItem value="elementary">Elementary School</SelectItem>
                      <SelectItem value="middle">Middle School</SelectItem>
                      <SelectItem value="high">High School</SelectItem>
                      <SelectItem value="other">Other / Complementary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentCount">Approximate number of students</Label>
                  <Select
                    value={formData.studentCount}
                    onValueChange={(value) => handleChange("studentCount", value)}
                  >
                    <SelectTrigger id="studentCount">
                      <SelectValue placeholder="Select quantity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-50">0-50 students</SelectItem>
                      <SelectItem value="51-100">51-100 students</SelectItem>
                      <SelectItem value="101-300">101-300 students</SelectItem>
                      <SelectItem value="301-500">301-500 students</SelectItem>
                      <SelectItem value="500+">More than 500 students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      placeholder="e.g., CA, NY, TX"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary" />
                  School Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mainEmail">Main email *</Label>
                  <Input
                    id="mainEmail"
                    type="email"
                    value={formData.mainEmail}
                    onChange={(e) => handleChange("mainEmail", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="officePhone">Office phone *</Label>
                  <Input
                    id="officePhone"
                    type="tel"
                    value={formData.officePhone}
                    onChange={(e) => handleChange("officePhone", e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  WhatsApp for Platform
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">School WhatsApp number *</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    placeholder="+1 555 123-4567"
                    required
                  />
                  <p className="text-xs text-muted-foreground">E.164 format - +1 555 123-4567</p>
                </div>

                <div className="space-y-3">
                  <Label>WhatsApp type</Label>
                  <RadioGroup
                    value={formData.whatsappType}
                    onValueChange={(value) => handleChange("whatsappType", value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="personal" id="personal" />
                      <Label htmlFor="personal" className="font-normal cursor-pointer">
                        Personal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="business" id="business" />
                      <Label htmlFor="business" className="font-normal cursor-pointer">
                        WhatsApp Business
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">School timezone *</Label>
                  <Select
                    value={formData.timezone}
                    onValueChange={(value) => handleChange("timezone", value)}
                    required
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                      <SelectItem value="America/Chicago">America/Chicago (CST)</SelectItem>
                      <SelectItem value="America/Denver">America/Denver (MST)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/Los Angeles (PST)</SelectItem>
                      <SelectItem value="America/Sao_Paulo">America/São Paulo (BRT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-primary" />
                  Administrator Account
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="responsibleName">Responsible person name *</Label>
                  <Input
                    id="responsibleName"
                    value={formData.responsibleName}
                    onChange={(e) => handleChange("responsibleName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loginEmail">Login email *</Label>
                  <Input
                    id="loginEmail"
                    type="email"
                    value={formData.loginEmail}
                    onChange={(e) => handleChange("loginEmail", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-start space-x-2 pt-4">
                  <Checkbox
                    id="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) => handleChange("agreeToTerms", checked as boolean)}
                    required
                  />
                  <Label htmlFor="agreeToTerms" className="font-normal text-sm leading-relaxed cursor-pointer">
                    I agree to the Terms of Use and Privacy Policy *
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button type="button" onClick={nextStep} className="flex items-center gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit">Register School</Button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
