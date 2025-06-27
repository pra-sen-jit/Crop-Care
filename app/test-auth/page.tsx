"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [testData, setTestData] = useState({
    email: "test@example.com",
    password: "TestPass123!",
    firstName: "Test",
    lastName: "User",
    username: "testuser123"
  })

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading(true)
    try {
      const result = await testFn()
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: true, data: result }
      }))
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }))
    }
    setIsLoading(false)
  }

  const testDatabaseConnection = async () => {
    const response = await fetch('/api/test-db')
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data
  }

  const testSignup = async () => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...testData,
        confirmPassword: testData.password,
        acceptTerms: true
      })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data
  }

  const testLogin = async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: testData.email,
        password: testData.password,
        rememberMe: false
      })
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data
  }

  const testLogout = async () => {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data
  }

  const runAllTests = async () => {
    setTestResults({})
    await runTest('database', testDatabaseConnection)
    await runTest('signup', testSignup)
    await runTest('login', testLogin)
    await runTest('logout', testLogout)
  }

  const TestResult = ({ testName, result }: { testName: string, result: any }) => (
    <div className="flex items-center gap-2 p-2 border rounded">
      {result?.success ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-red-600" />
      )}
      <span className="font-medium">{testName}</span>
      {result?.success ? (
        <span className="text-green-600 text-sm">✓ Passed</span>
      ) : (
        <span className="text-red-600 text-sm">✗ {result?.error}</span>
      )}
    </div>
  )

  return (
    <div className="container px-4 py-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Authentication System Test</CardTitle>
          <CardDescription>
            Test the functionality of signup, login, and logout features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Data Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Test Email</Label>
              <Input
                id="email"
                value={testData.email}
                onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Test Password</Label>
              <Input
                id="password"
                value={testData.password}
                onChange={(e) => setTestData(prev => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={testData.firstName}
                onChange={(e) => setTestData(prev => ({ ...prev, firstName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={testData.username}
                onChange={(e) => setTestData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>

          {/* Test Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runAllTests} disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Run All Tests
            </Button>
            <Button variant="outline" onClick={() => runTest('database', testDatabaseConnection)}>
              Test Database
            </Button>
            <Button variant="outline" onClick={() => runTest('signup', testSignup)}>
              Test Signup
            </Button>
            <Button variant="outline" onClick={() => runTest('login', testLogin)}>
              Test Login
            </Button>
            <Button variant="outline" onClick={() => runTest('logout', testLogout)}>
              Test Logout
            </Button>
          </div>

          {/* Test Results */}
          {Object.keys(testResults).length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Test Results:</h3>
              {Object.entries(testResults).map(([testName, result]) => (
                <TestResult key={testName} testName={testName} result={result} />
              ))}
            </div>
          )}

          {/* Status Summary */}
          {Object.keys(testResults).length > 0 && (
            <Alert>
              <AlertDescription>
                {Object.values(testResults).every((r: any) => r.success) ? (
                  <span className="text-green-600 font-medium">
                    ✅ All authentication features are working correctly!
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">
                    ❌ Some authentication features need attention.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How to test:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Click "Run All Tests" to test all authentication features</li>
              <li>Or test individual components using the specific buttons</li>
              <li>Check the results to see if signup, login, and logout work</li>
              <li>Green checkmarks indicate working features</li>
              <li>Red X marks indicate issues that need fixing</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}