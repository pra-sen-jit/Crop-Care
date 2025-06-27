"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react"
import Swal from "sweetalert2"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    category: "",
    message: "",
  })
  const [countryCode, setCountryCode] = useState("+91")
  const FORMSPREE_ENDPOINT = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  const handleInputChange = (field: string, value: string) => {
    if (field === "phone") {
      // Only allow digits, max 10
      const digits = value.replace(/\D/g, "").slice(0, 10)
      setFormData((prev) => ({ ...prev, phone: digits }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validation (basic)
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill out all required fields.",
      })
      return
    }
    if (formData.phone && formData.phone.length !== 10) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Phone number must be exactly 10 digits.",
      })
      return
    }
    // Prepare data for Formspree
    const payload: Record<string, string> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone ? `${countryCode}${formData.phone}` : '',
      subject: formData.subject,
      category: formData.category,
      message: formData.message,
    }
    // Remove empty optional fields
    Object.keys(payload).forEach((key) => {
      if (!payload[key]) delete payload[key]
    })
    try {
      if (!FORMSPREE_ENDPOINT) {
        Swal.fire({
          icon: "error",
          title: "Configuration Error",
          text: "Formspree endpoint is not set. Please check your .env.local and restart the server.",
        });
        return;
      }
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        Swal.fire({
          title: "Message Sent!",
          text: "We'll get back to you soon!",
          icon: "success",
        })
        setFormData({ name: "", email: "", phone: "", subject: "", category: "", message: "" })
        setCountryCode("+91")
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data?.errors?.[0]?.message || data?.message || "Something went wrong. Please try again.",
        })
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong. Please try again.",
      })
    }
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Get in touch with our team for support, feedback, or collaboration opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-2">For general inquiries and support</p>
                <a href="mailto:support@cropcare.com" className="text-green-600 dark:text-green-400 hover:underline">
                  support@cropcare.com
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Call Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-2">Technical support hotline</p>
                <a href="tel:+911234567890" className="text-green-600 dark:text-green-400 hover:underline">
                  +91 123 456 7890
                </a>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Visit Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Agricultural Technology Center
                  <br />
                  123 Innovation Drive
                  <br />
                  New Delhi, India 110001
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Business Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  <p>
                    <strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM
                  </p>
                  <p>
                    <strong>Saturday:</strong> 10:00 AM - 4:00 PM
                  </p>
                  <p>
                    <strong>Sunday:</strong> Closed
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="flex rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                        <select
                          id="countryCode"
                          value={countryCode}
                          onChange={e => setCountryCode(e.target.value)}
                          className="px-2 py-2 bg-gray-50 text-gray-700 border-none focus:ring-0 w-auto min-w-[70px] text-sm h-10"
                          required
                        >
                          <option value="+1">us +1</option>
                          <option value="+44">uk +44</option>
                          <option value="+91">in +91</option>
                          <option value="+33">fr +33</option>
                          <option value="+49">de +49</option>
                          <option value="+81">jp +81</option>
                          <option value="+86">cn +86</option>
                          <option value="+234">ng +234</option>
                          <option value="+27">za +27</option>
                          <option value="+20">eg +20</option>
                        </select>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="123 456 7890"
                          value={formData.phone}
                          onChange={e => handleInputChange("phone", e.target.value)}
                          maxLength={10}
                          pattern="\d{10}"
                          required={false}
                          className="flex-1 px-3 py-2 border-none focus:ring-0 text-sm h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical-support">Technical Support</SelectItem>
                          <SelectItem value="disease-prediction">Disease Prediction</SelectItem>
                          <SelectItem value="crop-recommendation">Crop Recommendation</SelectItem>
                          <SelectItem value="weather-forecast">Weather Forecast</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your inquiry"
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide detailed information about your inquiry..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How accurate is the disease prediction?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Our CNN model achieves 95% accuracy in disease detection, trained on thousands of crop disease images
                  from various agricultural regions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Which crops are supported?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We currently support 25+ major crops including rice, wheat, corn, tomato, potato, cotton, and various
                  fruits and vegetables.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is the service free to use?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Basic features are free for all users. Premium features with advanced analytics and personalized
                  recommendations are available through subscription plans.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How often is weather data updated?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Weather data is updated every hour with real-time information from meteorological stations and
                  satellite imagery for accurate forecasting.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
