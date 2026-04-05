# Step 1: Test registration
Write-Host "📝 Testing registration..." -ForegroundColor Cyan

$email = "testuser$(Get-Random)@example.com"
$body = @{
    name = "Test $(Get-Random)"
    email = $email
    password = "Test@123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method POST `
    -Headers @{'Content-Type' = 'application/json'} `
    -Body $body `
    -UseBasicParsing

$data = $response.Content | ConvertFrom-Json
$token = $data.token

Write-Host "✅ Registration successful" -ForegroundColor Green
Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
Write-Host ""

# Step 2: Test get trips (no auth needed)
Write-Host "🏝️  Testing GET /trips (no auth)..." -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/trips" `
    -Method GET `
    -Headers @{'Content-Type' = 'application/json'} `
    -UseBasicParsing

$trips = $response.Content | ConvertFrom-Json
$trip = $trips[0]
Write-Host "✅ Got trips" -ForegroundColor Green
Write-Host "   Trip ID: $($trip._id)" -ForegroundColor Gray
Write-Host "   Trip Title: $($trip.title)" -ForegroundColor Gray
Write-Host ""

# Step 3: Test booking creation (requires auth)
Write-Host "📅 Testing booking creation (with auth)..." -ForegroundColor Cyan
$pickupDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
$travelDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")

$bookingBody = @{
    tripId = $trip._id
    pickupDate = $pickupDate
    travelDate = $travelDate
    pickupAddress = "123 Main St, NYC"
    numTravelers = 1
    totalPrice = $trip.price
    paymentMethod = "cash"
} | ConvertTo-Json

Write-Host "   Sending request with token..." -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/bookings" `
        -Method POST `
        -Headers @{
            'Content-Type' = 'application/json'
            'Authorization' = "Bearer $token"
        } `
        -Body $bookingBody `
        -UseBasicParsing

    $booking = $response.Content | ConvertFrom-Json
    Write-Host "✅ Booking created!" -ForegroundColor Green
    Write-Host "   Booking ID: $($booking._id)" -ForegroundColor Gray
    Write-Host "   Status: $($booking.status)" -ForegroundColor Gray
    Write-Host ""

    # Step 4: Test payment
    Write-Host "💳 Testing payment..." -ForegroundColor Cyan
    $paymentBody = @{
        bookingId = $booking._id
        amount = $booking.totalPrice
        paymentMethod = "cash"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/payments/process-payment" `
        -Method POST `
        -Headers @{
            'Content-Type' = 'application/json'
            'Authorization' = "Bearer $token"
        } `
        -Body $paymentBody `
        -UseBasicParsing

    $payment = $response.Content | ConvertFrom-Json
    Write-Host "✅ Payment successful!" -ForegroundColor Green
    Write-Host "   Payment ID: $($payment.paymentId)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🎉 All tests passed!" -ForegroundColor Green

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $errorContent = $_.Exception.Response.Content.ReadAsStream() | ForEach-Object {
        [System.IO.StreamReader]::new($_).ReadToEnd()
    }
    Write-Host "   Status: $statusCode" -ForegroundColor Red
    Write-Host "   Response: $errorContent" -ForegroundColor Red
}
