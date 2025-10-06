# Location API Documentation

## Overview

This API provides location-based functionality for finding nearby users and managing user locations.

## Endpoints

### 1. Update User Location

**POST** `/api/users/update-location`

Updates the current user's location coordinates and city.

**Headers:**

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "lat": 40.7128,
  "lng": -74.0059,
  "city": "New York" // optional
}
```

**Response:**

```json
{
  "message": "Location updated successfully",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "city": "New York",
    "location": {
      "type": "Point",
      "coordinates": [-74.0059, 40.7128]
    }
  },
  "location": {
    "type": "Point",
    "coordinates": [-74.0059, 40.7128]
  }
}
```

### 2. Get Current Location

**GET** `/api/users/current-location`

Retrieves the current user's location information.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "location": {
    "type": "Point",
    "coordinates": [-74.0059, 40.7128]
  },
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0059
  },
  "city": "New York",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### 3. Find Nearby Users

**GET** `/api/users/nearby?radius=5000`

Finds users within a specified radius or in the same city.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `radius` (optional): Search radius in meters (default: 5000)

**Response:**

```json
{
  "users": [
    {
      "_id": "user_id",
      "name": "Jane Smith",
      "city": "New York",
      "location": {
        "type": "Point",
        "coordinates": [-74.006, 40.7129]
      },
      "distance": 15
    }
  ],
  "total": 1,
  "radius": 5000,
  "userLocation": {
    "lat": 40.7128,
    "lng": -74.0059,
    "city": "New York"
  }
}
```

## Error Handling

### Common Error Responses

**400 Bad Request:**

```json
{
  "error": "Latitude and longitude are required"
}
```

**401 Unauthorized:**

```json
{
  "error": "No token provided"
}
```

**404 Not Found:**

```json
{
  "error": "User location not set or invalid. Please update your location first."
}
```

**500 Internal Server Error:**

```json
{
  "error": "Server error while updating location"
}
```

## Setup Instructions

1. **Environment Variables:**
   Create a `.env` file with:

   ```
   MONGO_URI=mongodb://localhost:27017/your-database-name
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   ```

2. **Database Index:**
   The User model automatically creates a 2dsphere index for location queries.

3. **Testing:**
   Run the test script:
   ```bash
   node test-location.js
   ```

## Features Fixed

✅ **Location Update Validation:**

- Validates latitude/longitude ranges
- Ensures coordinates are numbers
- Proper error handling

✅ **Nearby Users Query:**

- Improved error handling
- Distance calculation
- Better response format
- Handles edge cases

✅ **Additional Endpoints:**

- GET current location endpoint
- Better error messages
- Comprehensive validation

## Usage Examples

### Update Location

```bash
curl -X POST http://localhost:5000/api/users/update-location \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7128, "lng": -74.0059, "city": "New York"}'
```

### Get Nearby Users

```bash
curl -X GET "http://localhost:5000/api/users/nearby?radius=1000" \
  -H "Authorization: Bearer your_jwt_token"
```

### Get Current Location

```bash
curl -X GET http://localhost:5000/api/users/current-location \
  -H "Authorization: Bearer your_jwt_token"
```
