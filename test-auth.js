
import fetch from 'node-fetch'

const BASE_URL = 'http://localhost:3001/api/auth'

async function testAuth() {
  const email = `test_${Date.now()}@example.com`
  const password = 'Password123!'
  
  console.log(`Trying to register user: ${email}`)

  // 1. Register
  try {
    const registerRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        name: 'Test User',
        role: 'admin'
      })
    })

    const registerData = await registerRes.json()
    console.log('Register Response:', registerRes.status, registerData)

    if (!registerRes.ok) {
      console.error('Registration failed')
      return
    }

    // 2. Login
    console.log('Trying to login...')
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password
      })
    })

    const loginData = await loginRes.json()
    console.log('Login Response:', loginRes.status, loginData)

    if (loginRes.ok) {
      console.log('SUCCESS: Login working correctly')
    } else {
      console.error('FAILED: Login failed')
    }

  } catch (error) {
    console.error('Test script error:', error)
  }
}

testAuth()
