# Backend Controllers and Response Formats

## controllers/admin/auth/adminController.js

### Function: `login`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Invalid email or password" }
```

```javascript
{
      status: true,
      message: admin.isDefaultPassword
        ? "Logged in with default password, please change your password"
        : "Admin logged in successfully",
      mustChangePassword: admin.isDefaultPassword,
      data: admin,
    }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `sendChangePasswordOtp`

**Responses:**


```javascript
{ status: false, message: "Admin not found" }
```

```javascript
{ status: false, message: "Failed to send OTP email" }
```

```javascript
{ status: true, message: "OTP sent to your email" }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `changePassword`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Admin not found" }
```

```javascript
{
        status: false,
        message: "Invalid or expired OTP",
      }
```

```javascript
{ status: true, message: "Password changed successfully, please login again with new password", data: admin }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `getMyProfile`

**Responses:**


```javascript
{ status: false, message: "Admin not found" }
```

```javascript
{ status: true, message: "Profile fetched successfully", data: admin }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
---

## controllers/admin/hotelController/adminHotelController.js

### Function: `createHotel`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: true, message: "Hotel created successfully", data: hotelInsert }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `getMyHotels`

**Responses:**


```javascript
{ status: true, message: "Hotels fetched successfully", data: hotels }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `updateHotel`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Hotel not found" }
```

```javascript
{ status: true, message: "Hotel updated successfully", data: hotel }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `deleteHotel`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Hotel not found" }
```

```javascript
{ status: true, message: "Hotel deleted successfully", data: hotel }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `createManager`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Hotel not found" }
```

```javascript
{ status: false, message: "Employee already exists with this email" }
```

```javascript
{ status: true, message: "Manager created successfully, default password is the manager email", data: managerInsert }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `getMyManagers`

**Responses:**


```javascript
{ status: true, message: "Managers fetched successfully", data: managers }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `updateManager`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Manager not found" }
```

```javascript
{ status: false, message: "You are not allowed to manage this manager" }
```

```javascript
{ status: false, message: "Hotel not found" }
```

```javascript
{ status: true, message: "Manager updated successfully", data: manager }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `deleteManager`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Manager not found" }
```

```javascript
{ status: false, message: "You are not allowed to manage this manager" }
```

```javascript
{ status: true, message: "Manager deleted successfully", data: manager }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `getMyDashboardStats`

**Responses:**


```javascript
{
      status: true,
      message: "Stats fetched successfully",
      data: {
        totalBookings: totalBookings,
        totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0
      }
    }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
---

## controllers/employee/auth/employeeController.js

### Function: `login`

**Responses:**


```javascript
{ status: false, error: v.errors }
```

```javascript
{
        status: false,
        message: "Your account is deactivated, please contact admin",
      }
```

```javascript
{
        status: true,
        message: employee.isDefaultPassword
          ? "Logged in with default password, please change your password"
          : "Employee logged in successfully",
        mustChangePassword: employee.isDefaultPassword,
        data: employee,
      }
```

```javascript
{
        status: false,
        message: "Invalid email or password",
      }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `changePassword`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Employee not found",
      }
```

```javascript
{
        status: false,
        message: "Old password is incorrect",
      }
```

```javascript
{
        status: false,
        message: "New password must be different from old password",
      }
```

```javascript
{
      status: true,
      message: "Password changed successfully, please login again with new password",
      data: employee,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `forgotPassword`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Employee not found with this email",
      }
```

```javascript
{
        status: false,
        message: "Failed to send OTP email",
      }
```

```javascript
{
      status: true,
      message: "Password reset OTP sent to your email",
      data: {
        email: employee.email,
      },
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getMyProfile`

**Responses:**


```javascript
{
        status: false,
        message: "Employee not found",
      }
```

```javascript
{
      status: true,
      message: "Profile fetched successfully",
      data: employee,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/employee/hotelController/bookingController.js

### Function: `getHotelBookings`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can view own hotel bookings",
      }
```

```javascript
{
        status: false,
        message: "Hotel not found or you are not the manager of this hotel",
      }
```

```javascript
{
      status: true,
      message: "Bookings fetched successfully",
      data: bookings,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `checkInBooking`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can check-in a booking",
      }
```

```javascript
{
        status: false,
        message: "Booking not found",
      }
```

```javascript
{ status: false, message: "You are not the manager of this hotel" }
```

```javascript
{
        status: false,
        message: "You are not the manager of this hotel",
      }
```

```javascript
{
        status: false,
        message: `Booking cannot be checked in, it is ${booking.bookingStatus}`,
      }
```

```javascript
{
        status: false,
        message: "Payment is pending, please complete the payment before check-in",
      }
```

```javascript
{
      status: true,
      message: "Booking checked in successfully",
      data: booking,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `checkOutBooking`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can check-out a booking",
      }
```

```javascript
{
        status: false,
        message: "Booking not found",
      }
```

```javascript
{ status: false, message: "You are not the manager of this hotel" }
```

```javascript
{
        status: false,
        message: "You are not the manager of this hotel",
      }
```

```javascript
{
        status: false,
        message: `Booking cannot be checked out, it is ${booking.bookingStatus}`,
      }
```

```javascript
{
      status: true,
      message: "Booking checked out successfully, room is available again",
      data: booking,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/employee/hotelController/hotelController.js

### Function: `registerHotel`

**Responses:**


```javascript
{ status: false, message: "Hotels can only be created by the hotel admin" }
```
### Function: `getMyHotels`

**Responses:**


```javascript
{
        status: false,
        message: "Only manager can view own hotels",
      }
```

```javascript
{
      status: true,
      message: "Hotels fetched successfully",
      data: hotels,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/employee/hotelController/offerController.js

### Function: `createOffer`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can create offers",
      }
```

```javascript
{
        status: false,
        message: "Hotel not found, not approved yet or you are not the manager of this hotel",
      }
```

```javascript
{
        status: false,
        message: "validTill must be after validFrom",
      }
```

```javascript
{
        status: false,
        message: "Offer code already exists for this hotel",
      }
```

```javascript
{
      status: true,
      message: "Offer created successfully",
      data: offerInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getMyOffers`

**Responses:**


```javascript
{
        status: false,
        message: "Only manager can view own offers",
      }
```

```javascript
{
      status: true,
      message: "Offers fetched successfully",
      data: offers,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `updateOffer`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can update offers",
      }
```

```javascript
{
        status: false,
        message: "Offer not found",
      }
```

```javascript
{ status: false, message: "You are not the manager of this hotel" }
```

```javascript
{
        status: false,
        message: "You are not the manager of this hotel",
      }
```

```javascript
{
        status: false,
        message: "validTill must be after validFrom",
      }
```

```javascript
{
      status: true,
      message: "Offer updated successfully",
      data: offer,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `deleteOffer`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can delete offers",
      }
```

```javascript
{
        status: false,
        message: "Offer not found",
      }
```

```javascript
{ status: false, message: "You are not the manager of this hotel" }
```

```javascript
{
        status: false,
        message: "You are not the manager of this hotel",
      }
```

```javascript
{
      status: true,
      message: "Offer deleted successfully",
      data: offer,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/employee/hotelController/roomController.js

### Function: `createHotelRoom`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can add rooms",
      }
```

```javascript
{
        status: false,
        message: "Hotel not found, not approved yet or you are not the manager of this hotel",
      }
```

```javascript
{
        status: false,
        message: "Room number already exists in this hotel",
      }
```

```javascript
{
      status: true,
      message: "Room created successfully",
      data: roomInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getHotelRooms`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can view own hotel rooms",
      }
```

```javascript
{
        status: false,
        message: "Hotel not found or you are not the manager of this hotel",
      }
```

```javascript
{
      status: true,
      message: "Rooms fetched successfully",
      data: rooms,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `updateHotelRoom`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can update rooms",
      }
```

```javascript
{
        status: false,
        message: "Room not found",
      }
```

```javascript
{ status: false, message: "You are not the manager of this hotel" }
```

```javascript
{
        status: false,
        message: "You are not the manager of this hotel",
      }
```

```javascript
{
          status: false,
          message: "Room number already exists in this hotel",
        }
```

```javascript
{
      status: true,
      message: "Room updated successfully",
      data: room,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `deleteHotelRooms`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can delete rooms",
      }
```

```javascript
{
        status: false,
        message: "Room not found",
      }
```

```javascript
{ status: false, message: "You are not the manager of this hotel" }
```

```javascript
{
        status: false,
        message: "You are not the manager of this hotel",
      }
```

```javascript
{
      status: true,
      message: "Room deleted successfully",
      data: room,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/shared/HotelControllers/amenityController.js

### Function: `createAmenity`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only admin can create amenities",
      }
```

```javascript
{
        status: false,
        message: "Amenity already exists",
      }
```

```javascript
{
      status: true,
      message: "Amenity created successfully",
      data: amenityInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getAmenities`

**Responses:**


```javascript
{
      status: true,
      message: "Amenities fetched successfully",
      data: amenities,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `updateAmenity`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only admin can update amenities",
      }
```

```javascript
{
        status: false,
        message: "Amenity not found",
      }
```

```javascript
{
      status: true,
      message: "Amenity updated successfully",
      data: amenity,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `deleteAmenity`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only admin can delete amenities",
      }
```

```javascript
{
        status: false,
        message: "Amenity not found",
      }
```

```javascript
{
      status: true,
      message: "Amenity deleted successfully",
      data: amenity,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/shared/HotelControllers/paymentController.js

### Function: `makePayment`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only user can make payment for own booking",
      }
```

```javascript
{
        status: false,
        message: "Booking not found",
      }
```

```javascript
{
        status: false,
        message: "Booking is cancelled, payment not allowed",
      }
```

```javascript
{
        status: false,
        message: "Payment is already done for this booking",
      }
```

```javascript
{
      status: true,
      message: "Payment completed successfully, booking is confirmed",
      data: {
        payment: paymentInsert,
        bookingConfirmation: booking,
      },
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getMyPayments`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
      status: true,
      message: "Payments fetched successfully",
      data: payments,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `refundPayment`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only manager can refund a payment",
      }
```

```javascript
{
        status: false,
        message: "Booking not found",
      }
```

```javascript
{ status: false, message: "You are not the manager of this hotel" }
```

```javascript
{
        status: false,
        message: "You are not the manager of this hotel",
      }
```

```javascript
{
        status: false,
        message: "Only cancelled bookings can be refunded",
      }
```

```javascript
{
        status: false,
        message: `Refund not allowed, payment status is ${booking.paymentStatus}`,
      }
```

```javascript
{
        status: false,
        message: "Payment not found for this booking",
      }
```

```javascript
{
      status: true,
      message: "Payment refunded successfully",
      data: payment,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `createRazorpayOrder`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Check-out date must be after check-in date" }
```

```javascript
{ status: false, message: "Room not found" }
```

```javascript
{ status: false, message: "Room is not available for the selected dates" }
```

```javascript
{ status: false, message: "Razorpay credentials not configured in environment variables" }
```

```javascript
{
      status: true,
      message: "Razorpay order created successfully",
      data: {
        orderId: order.id,
        amount: options.amount,
        currency: options.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      },
    }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
---

## controllers/shared/HotelControllers/roomTypeController.js

### Function: `createRoomType`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only admin can create room types",
      }
```

```javascript
{
        status: false,
        message: "Room type already exists",
      }
```

```javascript
{
      status: true,
      message: "Room type created successfully",
      data: roomTypeInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getRoomTypes`

**Responses:**


```javascript
{
      status: true,
      message: "Room types fetched successfully",
      data: roomTypes,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `updateRoomType`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only admin can update room types",
      }
```

```javascript
{
        status: false,
        message: "Room type not found",
      }
```

```javascript
{
      status: true,
      message: "Room type updated successfully",
      data: roomType,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `deleteRoomType`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only admin can delete room types",
      }
```

```javascript
{
        status: false,
        message: "Room type not found",
      }
```

```javascript
{
      status: true,
      message: "Room type deleted successfully",
      data: roomType,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/shared/Uploads/imageUpload.js

### Function: `ImageUpload`

**Responses:**


```javascript
{
    status: true,
    image: uploadDAta.url,
  }
```
### Function: `videoUpload`

**Responses:**


```javascript
{
    status: true,
    image: uploadDAta.url,
  }
```
### Function: `MultipleImageUpload`

**Responses:**


```javascript
{ status: false, message: "No files uploaded" }
```

```javascript
{
      status: true,
      images: uploadedImages,
    }
```

```javascript
{
      status: false,
      message: "Failed to upload images",
      error: error.message,
    }
```
### Function: `profileImageUpload`

**Responses:**


```javascript
{ status: false, message: "No file uploaded" }
```

```javascript
{
      status: true,
      url: uploadData.url,
    }
```

```javascript
{
      status: false,
      message: "Failed to upload profile image",
      error: error.message,
    }
```
### Function: `hotelImageUpload`

**Responses:**


```javascript
{ status: false, message: "No file uploaded" }
```

```javascript
{
      status: true,
      url: uploadData.url,
    }
```

```javascript
{
      status: false,
      message: "Failed to upload hotel image",
      error: error.message,
    }
```
### Function: `hotelVideoUpload`

**Responses:**


```javascript
{ status: false, message: "No file uploaded" }
```

```javascript
{
      status: true,
      url: uploadData.url,
    }
```

```javascript
{
      status: false,
      message: "Failed to upload hotel video",
      error: error.message,
    }
```
---

## controllers/shared/address/countrystateController.js

### Function: `createCountryState`

**Responses:**


```javascript
{ message: 'Country and State created successfully', countryState }
```

```javascript
{ message: 'Error creating Country and State', error: error.message }
```
### Function: `getAllCountryStates`

**Responses:**


```javascript
{ status: true, message: 'Country and State fetched successfully', data: countryStates }
```

```javascript
{ status: false, message: 'Error fetching Country and State', error: error.message }
```
---

## controllers/shared/otp/otpController.js

### Function: `sendOtp`

**Responses:**


```javascript
{
        status: false,
        message: "Invalid input",
        errors: result.error.issues,
      }
```

```javascript
{
        status: false,
        message: "Failed to send OTP",
      }
```

```javascript
{
      status: true,
      message: "OTP sent successfully",
    }
```

```javascript
{
      status: false,
      message: "Server error",
    }
```
### Function: `verifyOtp`

**Responses:**


```javascript
{
        status: false,
        message: "Invalid email or OTP",
        errors: result.error.issues,
      }
```

```javascript
{
        status: false,
        message: "Invalid or expired OTP",
      }
```

```javascript
{
      status: true,
      message: "OTP verified successfully",
    }
```

```javascript
{
      status: false,
      message: "Server error",
    }
```
---

## controllers/superadmin/auth/superadminController.js

### Function: `register`

**Responses:**


```javascript
{
      status: false,
      message: "Validation failed",
      errors: inputs.error.issues,
    }
```

```javascript
{
      status: true,
      message: "Admin created successfully",
      data: adminInsert,
    }
```

```javascript
{
        status: false,
        message: "Email already exists",
        field: Object.keys(error.keyPattern
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `login`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
    }
```

```javascript
{
        status: false,
        message: "Invalid email or password",
      }
```

```javascript
{
        status: false,
        message: "Invalid email or password",
      }
```

```javascript
{
        status: false,
        message: "Failed to send OTP",
      }
```

```javascript
{
      status: true,
      otpRequired: true,
      message: "OTP sent to your email",
      data: {
        email: admin.email,
      },
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `verifyOtp`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Invalid or expired OTP",
      }
```

```javascript
{
        status: false,
        message: "Admin not found",
      }
```

```javascript
{
      status: true,
      message: "OTP verified successfully",
      data: adminData,
      token: adminData.token,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getMyProfile`

**Responses:**


```javascript
{
        status: false,
        message: "Admin not found",
      }
```

```javascript
{
      status: true,
      message: "Profile fetched successfully",
      data: admin,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `createAdmin`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Admin already exists with this email" }
```

```javascript
{
      status: true,
      message: "Admin created successfully, default password is the admin email",
      data: adminInsert,
    }
```

```javascript
{ status: false, message: "Email already exists" }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `getAllAdmins`

**Responses:**


```javascript
{ status: true, message: "Admins fetched successfully", data: admins }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `updateAdmin`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Admin not found" }
```

```javascript
{ status: true, message: "Admin updated successfully", data: admin }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `deleteAdmin`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Admin not found" }
```

```javascript
{ status: true, message: "Admin deleted successfully", data: admin }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `getAllUsers`

**Responses:**


```javascript
{ status: true, message: "Users fetched successfully", data: users }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `updateUserStatus`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "User not found" }
```

```javascript
{ status: true, message: "User status updated", data: userObj }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `deleteUser`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "User not found" }
```

```javascript
{ status: true, message: "User deleted successfully" }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
---

## controllers/superadmin/dashboard/dashboardController.js

### Function: `getDashboard`

**Responses:**


```javascript
{
        status: false,
        message: "Only admin can view dashboard",
      }
```

```javascript
{
      status: true,
      message: "Dashboard fetched successfully",
      data: {
        totalHotels: totalHotels,
        pendingHotels: pendingHotels,
        totalRooms: totalRooms,
        totalCustomers: totalCustomers,
        totalBookings: totalBookings,
        cancelledBookings: cancelledBookings,
        totalRevenue: revenue.length > 0 ? revenue[0].totalRevenue : 0,
        availableRooms: availableRooms,
        occupiedRooms: occupiedRooms,
        totalAdmins: totalAdmins,
        totalManagers: totalManagers,
      },
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `bookingReport`

**Responses:**


```javascript
{
        status: false,
        message: "Only admin can view reports",
      }
```

```javascript
{
      status: true,
      message: "Booking report fetched successfully",
      data: {
        summary: summary,
        bookings: bookings,
      },
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `revenueReport`

**Responses:**


```javascript
{
        status: false,
        message: "Only admin can view reports",
      }
```

```javascript
{
      status: true,
      message: "Revenue report fetched successfully",
      data: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0,
        totalPayments: totalRevenue.length > 0 ? totalRevenue[0].totalPayments : 0,
        totalRefunded: refunds.length > 0 ? refunds[0].totalRefunded : 0,
        totalRefunds: refunds.length > 0 ? refunds[0].totalRefunds : 0,
        revenueByDay: revenueByDay,
      },
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `customerReport`

**Responses:**


```javascript
{
        status: false,
        message: "Only admin can view reports",
      }
```

```javascript
{
      status: true,
      message: "Customer report fetched successfully",
      data: customers,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `hotelReport`

**Responses:**


```javascript
{
        status: false,
        message: "Only admin can view reports",
      }
```

```javascript
{
      status: true,
      message: "Hotel report fetched successfully",
      data: hotels,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `roomOccupancyReport`

**Responses:**


```javascript
{
        status: false,
        message: "Only admin can view reports",
      }
```

```javascript
{
      status: true,
      message: "Room occupancy report fetched successfully",
      data: occupancyByHotel,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `paymentReport`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only admin can view reports",
      }
```

```javascript
{
      status: true,
      message: "Payment report fetched successfully",
      data: {
        summary: summary,
        payments: payments,
      },
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/superadmin/employee/employeeController.js

### Function: `createEmployee`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Managers must be created by an admin for one of their hotels",
      }
```

```javascript
{
        status: false,
        message: "Employee already exists with this email",
      }
```

```javascript
{
      status: true,
      message: "Employee created successfully, default password is the employee email",
      data: employeeInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/superadmin/hotelController/bookingController.js

### Function: `getAllBookings`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only admin can view all bookings",
      }
```

```javascript
{
      status: true,
      message: "Bookings fetched successfully",
      data: bookings,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/superadmin/hotelController/offerController.js

### Function: `getAllOffers`

**Responses:**


```javascript
{
        status: false,
        message: "Only admin can view all offers",
      }
```

```javascript
{
      status: true,
      message: "Offers fetched successfully",
      data: offers,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/superadmin/hotelController/superadminHotelController.js

### Function: `getAllHotels`

**Responses:**


```javascript
{
      status: true,
      message: "Hotels fetched successfully",
      data: hotels,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `approveHotel`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Hotel not found",
      }
```

```javascript
{
        status: false,
        message: `Hotel is already ${hotel.status}`,
      }
```

```javascript
{
          status: false,
          message: "Country not found",
        }
```

```javascript
{
          status: false,
          message: "State not found in this country",
        }
```

```javascript
{
          status: false,
          message: "City not found in this state",
        }
```

```javascript
{
      status: true,
      message: `Hotel ${req.body.status} successfully`,
      data: hotel,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `toggleHotelStatus`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Hotel not found" }
```

```javascript
{
      status: true,
      message: `Hotel successfully ${req.body.isActive ? "activated" : "revoked"}`,
      data: hotel,
    }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `updateHotel`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Hotel not found" }
```

```javascript
{
      status: true,
      message: "Hotel details updated successfully",
      data: hotel,
    }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
### Function: `deleteHotel`

**Responses:**


```javascript
{ status: false, error: v.errors, message: "Validation failed" }
```

```javascript
{ status: false, message: "Hotel not found" }
```

```javascript
{
      status: true,
      message: "Hotel deleted successfully",
      data: hotel,
    }
```

```javascript
{ status: false, message: "Server error", error: error.message }
```
---

## controllers/user/auth/userController.js

### Function: `register`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "User already exists with this email",
      }
```

```javascript
{
      status: true,
      message: "User registered successfully",
      data: userInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `login`

**Responses:**


```javascript
{ status: false, error: v.errors }
```

```javascript
{
        status: false,
        message: "Your account is deactivated, please contact admin",
      }
```

```javascript
{
        status: true,
        message: "User logged in successfully",
        data: user,
      }
```

```javascript
{
        status: false,
        message: "Invalid email or password",
      }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getMyProfile`

**Responses:**


```javascript
{
        status: false,
        message: "User not found",
      }
```

```javascript
{
      status: true,
      message: "Profile fetched successfully",
      data: user,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `changePassword`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "User not found",
      }
```

```javascript
{
        status: false,
        message: "Old password is incorrect",
      }
```

```javascript
{
        status: false,
        message: "New password must be different from old password",
      }
```

```javascript
{
      status: true,
      message: "Password changed successfully, please login again with new password",
      data: user,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `forgotPassword`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "User not found with this email",
      }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `updateMyProfile`

**Responses:**


```javascript
{
        status: false,
        message: "User not found",
      }
```

```javascript
{
      status: true,
      message: "Profile updated successfully",
      data: user,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/user/hotelController/bookingController.js

### Function: `bookRoom`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only user can book a room",
      }
```

```javascript
{ status: false, message: "Payment verification failed. Invalid signature." }
```

```javascript
{
        status: false,
        message: "Check-in date cannot be in the past",
      }
```

```javascript
{
        status: false,
        message: "Check-out date must be after check-in date",
      }
```

```javascript
{
        status: false,
        message: "Room not found",
      }
```

```javascript
{
        status: false,
        message: "Room is under maintenance",
      }
```

```javascript
{
        status: false,
        message: "Hotel not found or not approved",
      }
```

```javascript
{
        status: false,
        message: `Maximum ${room.maxAdults} adults allowed in this room`,
      }
```

```javascript
{
        status: false,
        message: `Maximum ${room.maxChildren} children allowed in this room`,
      }
```

```javascript
{
        status: false,
        message: "Room is not available for the selected dates",
      }
```

```javascript
{
          status: false,
          message: offerResult.error,
        }
```

```javascript
{
      status: true,
      message: "Room booked successfully, please complete the payment",
      data: bookingInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `cancelBooking`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only user can cancel own booking",
      }
```

```javascript
{
        status: false,
        message: "Booking not found",
      }
```

```javascript
{
        status: false,
        message: `Booking cannot be cancelled, it is already ${booking.bookingStatus}`,
      }
```

```javascript
{
      status: true,
      message: booking.paymentStatus == "paid"
        ? "Booking cancelled successfully, refund will be processed"
        : "Booking cancelled successfully",
      data: booking,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getBookingById`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Booking not found",
      }
```

```javascript
{
      status: true,
      message: "Booking details fetched successfully",
      data: bookings[0],
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getMyBookings`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
      status: true,
      message: "Bookings fetched successfully",
      data: bookings,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/user/hotelController/offerController.js

### Function: `getActiveOffers`

**Responses:**


```javascript
{
      status: true,
      message: "Active offers fetched successfully",
      data: offers,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/user/hotelController/roomSelectionController.js

### Function: `selectRoom`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only user can select a room",
      }
```

```javascript
{
        status: false,
        message: "Room not found",
      }
```

```javascript
{
        status: false,
        message: "Hotel not found or not approved",
      }
```

```javascript
{
        status: false,
        message: "Room is already in your selection",
      }
```

```javascript
{
      status: true,
      message: "Room selected successfully",
      data: selectionInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getMySelectedRooms`

**Responses:**


```javascript
{
      status: true,
      message: "Selected rooms fetched successfully",
      data: selections,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `removeSelectedRoom`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Room selection not found",
      }
```

```javascript
{
        status: false,
        message: "Room selection is already finalized with a booking",
      }
```

```javascript
{
      status: true,
      message: "Room selection removed successfully",
      data: selection,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/user/hotelController/userHotelController.js

### Function: `getAllHotels`

**Responses:**


```javascript
{
      status: true,
      message: "Hotels fetched successfully",
      data: hotels,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getHotelById`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Hotel not found",
      }
```

```javascript
{
      status: true,
      message: "Hotel fetched successfully",
      data: hotels[0],
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getRoomsByHotelId`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Hotel not found",
      }
```

```javascript
{
      status: true,
      message: "Rooms fetched successfully",
      data: rooms,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `roomAvailability`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Hotel not found",
      }
```

```javascript
{
      status: true,
      message: "Room availability fetched successfully",
      data: rooms,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getRoomById`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Room not found",
      }
```

```javascript
{
      status: true,
      message: "Room fetched successfully",
      data: rooms[0],
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `search`

**Responses:**


```javascript
{
        status: false,
        message: "search, hotelId or roomId is required",
      }
```

```javascript
{
      status: true,
      message: "Search results fetched successfully",
      data: {
        hotels: hotels,
        rooms: rooms,
      },
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getRoomBookedDates`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
      status: true,
      message: "Booked dates fetched successfully",
      data: bookings,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/user/ratingReviewLiked/reviewController.js

### Function: `addReview`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only user can add a review",
      }
```

```javascript
{
        status: false,
        message: "Hotel not found",
      }
```

```javascript
{
        status: false,
        message: "You can review only after completing a stay in this hotel",
      }
```

```javascript
{
        status: false,
        message: "You have already reviewed this hotel, please update your review",
      }
```

```javascript
{
      status: true,
      message: "Review added successfully",
      data: reviewInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `updateReview`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Review not found",
      }
```

```javascript
{
      status: true,
      message: "Review updated successfully",
      data: review,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `deleteReview`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Review not found",
      }
```

```javascript
{
      status: true,
      message: "Review deleted successfully",
      data: review,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getHotelReviews`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
      status: true,
      message: "Reviews fetched successfully",
      data: {
        averageRating: ratingSummary.length > 0 ? Math.round(ratingSummary[0].averageRating * 10
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

## controllers/user/ratingReviewLiked/wishlistController.js

### Function: `addToWishlist`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Only user can add to wishlist",
      }
```

```javascript
{
        status: false,
        message: "Hotel not found",
      }
```

```javascript
{
          status: false,
          message: "Room not found in this hotel",
        }
```

```javascript
{
        status: false,
        message: "Already added to wishlist",
      }
```

```javascript
{
      status: true,
      message: "Added to wishlist successfully",
      data: wishlistInsert,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `getMyWishlist`

**Responses:**


```javascript
{
      status: true,
      message: "Wishlist fetched successfully",
      data: wishlist,
      pagination: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
### Function: `removeFromWishlist`

**Responses:**


```javascript
{
      status: false,
      error: v.errors,
      message: "Validation failed",
    }
```

```javascript
{
        status: false,
        message: "Wishlist item not found",
      }
```

```javascript
{
      status: true,
      message: "Removed from wishlist successfully",
      data: wishlist,
    }
```

```javascript
{
      status: false,
      message: "Server error",
      error: error.message,
    }
```
---

