Write-Host "🚀 Starting Complete Booking Flow Test`n" -ForegroundColor Green

$API = "http://localhost:5000/api"
$ErrorActionPreference = "Stop"

function Make-Request {
    param(
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body,
        [string]$Token
    )
    
    $url = "$API$Endpoint"
    $headers = @{ 'Content-Type' = 'application/json' }
    if ($Token) {
        $headers['Authorization'] = "Bearer $Token"
    }
    
    try {
        if ($Body) {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json) -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -UseBasicParsing
        }
        return @{
            Status = $response.StatusCode
            Data = $response.Content | ConvertFrom-Json
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.Value__
        $errorBody = $_.Exception.Response.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        return @{
            Status = $statusCode
            Data = $errorBody
            Error = $_
        }
    }
}

try {
    # Step 1: Register
    Write-Host "📝 Step 1: Register a test user"
    $email = "testuser$(Get-Random)@example.com"
    $registerResult = Make-Request -Method POST -Endpoint "/auth/register" -Body @{
        name = "Test User $(Get-Random)"
        email = $email
        password = "Test@12345"
    }
    
    if ($registerResult.Status -ne 201) {
        Write-Host "❌ Registration failed: $($registerResult.Status)" -ForegroundColor Red
        Write-Host $registerResult.Data
        exit 1
    }
    
    $token = $registerResult.Data.token
    $userId = $registerResult.Data._id
    Write-Host "✅ Registration successful" -ForegroundColor Green
    Write-Host "   User ID: $userId"
    Write-Host "   Email: $email`n" -ForegroundColor Gray

    # Step 2: Get trips
    Write-Host "🏝️  Step 2: Get available trips"
    $tripsResult = Make-Request -Method GET -Endpoint "/trips" -Token $token
    
    if ($tripsResult.Status -ne 200) {
        Write-Host "❌ Failed to get trips: $($tripsResult.Status)" -ForegroundColor Red
        exit 1
    }
    
    $trips = $tripsResult.Data
    $trip = $trips[0]
    Write-Host "✅ Found $($trips.Count) trips" -ForegroundColor Green
    Write-Host "   Using: $($trip.title)" -ForegroundColor Gray
    Write-Host "   Price: `$$($trip.price)" -ForegroundColor Gray
    Write-Host "   ID: $($trip._id)`n" -ForegroundColor Gray

    # Step 3: Create booking
    Write-Host "📅 Step 3: Create booking"
    $pickupDate = (Get-Date).AddDays(1).ToString("yyyy-MM-dd")
    $travelDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
    
    Write-Host "   Pickup Date: $pickupDate" -ForegroundColor Gray
    Write-Host "   Travel Date: $travelDate" -ForegroundColor Gray
    Write-Host "   Address: 123 Main Street, NYC" -ForegroundColor Gray
    
    $bookingResult = Make-Request -Method POST -Endpoint "/bookings" -Token $token -Body @{
        tripId = $trip._id
        pickupDate = $pickupDate
        travelDate = $travelDate
        pickupAddress = "123 Main Street, New York, NY"
        numTravelers = 1
        totalPrice = $trip.price
        paymentMethod = "cash"
    }
    
    if ($bookingResult.Status -ne 201) {
        Write-Host "❌ Booking creation failed: $($bookingResult.Status)" -ForegroundColor Red
        Write-Host "Error: $($bookingResult.Data.message)" -ForegroundColor Red
        if ($bookingResult.Error) {
            Write-Host $bookingResult.Error
        }
        exit 1
    }
    
    $booking = $bookingResult.Data
    Write-Host "✅ Booking created successfully" -ForegroundColor Green
    Write-Host "   Booking ID: $($booking._id)" -ForegroundColor Gray
    Write-Host "   Status: $($booking.status)" -ForegroundColor Gray
    Write-Host "   Payment Status: $($booking.paymentStatus)`n" -ForegroundColor Gray

    # Step 4: Process payment
    Write-Host "💳 Step 4: Process payment"
    $paymentResult = Make-Request -Method POST -Endpoint "/payments/process-payment" -Token $token -Body @{
        bookingId = $booking._id
        amount = $booking.totalPrice
        paymentMethod = "cash"
    }
    
    if ($paymentResult.Status -ne 200) {
        Write-Host "❌ Payment failed: $($paymentResult.Status)" -ForegroundColor Red
        Write-Host "Error: $($paymentResult.Data.message)" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Payment processed successfully" -ForegroundColor Green
    Write-Host "   Payment ID: $($paymentResult.Data.paymentId)" -ForegroundColor Gray
    Write-Host "   Amount: `$$($paymentResult.Data.amount)" -ForegroundColor Gray
    Write-Host "   Status: $($paymentResult.Data.status)`n" -ForegroundColor Gray

    # Success
    Write-Host "🎉 ============================================" -ForegroundColor Green
    Write-Host "   ✅ ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host "   Booking and payment flow working correctly" -ForegroundColor Green
    Write-Host "============================================`n" -ForegroundColor Green

} catch {
    Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
