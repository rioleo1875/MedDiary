// Test OTP endpoint
fetch('http://localhost:3000/auth/send-otp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email: 'test@example.com' })
})
.then(res => res.json())
.then(data => console.log('OTP Response:', data))
.catch(err => console.error('OTP Error:', err));
