## Stations

### Endpoints:

#### GET /api/v1/lockers/stations/all

- Roles:  Operator, Admin

Response `200 OK`:
```json
[
  {
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
    "address": "Tel Aviv, Dizengoff 10",
    "latitude": 32.0853,
    "longitude": 34.7818,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T12:49:18.974Z",
    "updatedAt": "2026-04-09T12:49:18.974Z",
    "isDeleted": false,
    "deletedAt": null,
    "city": {
      "code": "TLV",
      "name": "Tel Aviv"
    },
    "_count": {
      "lockers": 9
    }
  },
  {
    "stationId": "63cdf8d3-ed56-402f-aaa3-4d62d5706da6",
    "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
    "address": "Tel Aviv, Rothschild 20",
    "latitude": 32.0662,
    "longitude": 34.7778,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T12:49:18.974Z",
    "updatedAt": "2026-04-09T12:49:18.974Z",
    "isDeleted": false,
    "deletedAt": null,
    "city": {
      "code": "TLV",
      "name": "Tel Aviv"
    },
    "_count": {
      "lockers": 9
    }
  },
  {
    "stationId": "3b969aa1-b57b-4c83-ba9e-c6dd71c508a7",
    "cityId": "2d5f991d-690c-41ec-bf79-ec2fce4c858e",
    "address": "test",
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T12:53:06.839Z",
    "updatedAt": "2026-04-09T12:53:06.839Z",
    "isDeleted": false,
    "deletedAt": null,
    "city": {
      "code": "HFA",
      "name": "Haifa"
    },
    "_count": {
      "lockers": 2
    }
  },
  {
    "stationId": "e1cdfac0-44b9-4157-a13f-e0e49cacaa9b",
    "cityId": "2d5f991d-690c-41ec-bf79-ec2fce4c858e",
    "address": "test",
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T12:53:16.600Z",
    "updatedAt": "2026-04-09T12:53:16.600Z",
    "isDeleted": false,
    "deletedAt": null,
    "city": {
      "code": "HFA",
      "name": "Haifa"
    },
    "_count": {
      "lockers": 1
    }
  }
]
```


#### GET /api/v1/lockers/stations

- Roles:  All

- Query params: city, lat, lng, radius, status

For example:

- /api/v1/lockers/stations?city=HFA&lat=34.405045&lng=37.706075&radius=5000.0&status=ACTIVE
- /api/v1/lockers/stations?lat=34.405045&lng=37.706075&radius=5000.0
- /api/v1/lockers/stations?city=HFA&status=ACTIVE
- /api/v1/lockers/stations

Response `200 OK`:
```json
[
  {
    "stationId": "3b969aa1-b57b-4c83-ba9e-c6dd71c508a7",
    "cityId": "2d5f991d-690c-41ec-bf79-ec2fce4c858e",
    "address": "test",
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T12:53:06.839Z",
    "updatedAt": "2026-04-09T12:53:06.839Z",
    "isDeleted": false,
    "deletedAt": null,
    "distance": "0.09",
    "city": {
      "code": "HFA",
      "name": "Haifa"
    },
    "_count": {
      "lockers": 2
    }
  },
  {
    "stationId": "e1cdfac0-44b9-4157-a13f-e0e49cacaa9b",
    "cityId": "2d5f991d-690c-41ec-bf79-ec2fce4c858e",
    "address": "test",
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T12:53:16.600Z",
    "updatedAt": "2026-04-09T12:53:16.600Z",
    "isDeleted": false,
    "deletedAt": null,
    "distance": "0.09",
    "city": {
      "code": "HFA",
      "name": "Haifa"
    },
    "_count": {
      "lockers": 1
    }
  },
  {
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
    "address": "Tel Aviv, Dizengoff 10",
    "latitude": 32.0853,
    "longitude": 34.7818,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T12:49:18.974Z",
    "updatedAt": "2026-04-09T12:49:18.974Z",
    "isDeleted": false,
    "deletedAt": null,
    "distance": null,
    "city": {
      "code": "TLV",
      "name": "Tel Aviv"
    },
    "_count": {
      "lockers": 9
    }
  },
  {
    "stationId": "63cdf8d3-ed56-402f-aaa3-4d62d5706da6",
    "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
    "address": "Tel Aviv, Rothschild 20",
    "latitude": 32.0662,
    "longitude": 34.7778,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T12:49:18.974Z",
    "updatedAt": "2026-04-09T12:49:18.974Z",
    "isDeleted": false,
    "deletedAt": null,
    "distance": null,
    "city": {
      "code": "TLV",
      "name": "Tel Aviv"
    },
    "_count": {
      "lockers": 9
    }
  }
]
```


#### GET /api/v1/lockers/stations/:id

- Roles:  Operator, Admin, User

Response `200 OK`:
```json
{
  "stationId": "3b969aa1-b57b-4c83-ba9e-c6dd71c508a7",
  "cityId": "2d5f991d-690c-41ec-bf79-ec2fce4c858e",
  "address": "test",
  "latitude": 34.405045,
  "longitude": 37.706076,
  "status": "ACTIVE",
  "createdAt": "2026-04-09T12:53:06.839Z",
  "updatedAt": "2026-04-09T12:53:06.839Z",
  "isDeleted": false,
  "deletedAt": null,
  "lockers": [
    {
      "lockerBoxId": "a04cb01d-1dea-4ea0-a08a-efdc7ecb71c4",
      "stationId": "3b969aa1-b57b-4c83-ba9e-c6dd71c508a7",
      "code": "A003",
      "size": "L",
      "status": "AVAILABLE",
      "version": 0,
      "lastStatusChangedAt": "2026-04-09T12:53:29.245Z",
      "createdAt": "2026-04-09T12:53:29.245Z",
      "updatedAt": "2026-04-09T12:53:29.245Z",
      "isDeleted": false,
      "deletedAt": null,
      "pricePerHour": "10"
    },
    {
      "lockerBoxId": "3a79899d-5fb7-4348-9f31-f3b26abde5a4",
      "stationId": "3b969aa1-b57b-4c83-ba9e-c6dd71c508a7",
      "code": "A004",
      "size": "L",
      "status": "AVAILABLE",
      "version": 0,
      "lastStatusChangedAt": "2026-04-09T12:53:37.523Z",
      "createdAt": "2026-04-09T12:53:37.523Z",
      "updatedAt": "2026-04-09T12:53:37.523Z",
      "isDeleted": false,
      "deletedAt": null,
      "pricePerHour": "10"
    }
  ],
  "city": {
    "code": "HFA",
    "name": "Haifa"
  }
}
```

Response `404 Not Found`:
```json
{
  "status": "error",
  "message": "Station doesn't exist"
}
```

#### POST /api/v1/lockers/stations

- Roles:  Operator, Admin

- Request Body: address optional
```json
{
  "city": "HFA",
  "latitude": 34.405045,
  "longitude":37.706076,
  "address": "test"
}
```

Response `200 OK`:
```json
{
  "id": "fe264178-39cc-4c41-92f5-996e85c56e21",
  "city": "HFA"
}
```

Response `400 Bad Request`:
```json
{
  "status": "error",
  "message": "City not found"
}
```

#### PATCH /api/v1/lockers/stations/:id/status

- Roles:  Operator, Admin

- Request Body:
```json
{
  "status": "INACTIVE"
}
```

Response `200 OK`:
```json
{
  "stationId": "59cc1902-a082-4b61-8cf1-0d8586579ff4",
  "cityId": "6594dd53-269a-4ecc-9611-1d352013f973",
  "address": null,
  "latitude": 34.405045,
  "longitude": 37.706076,
  "status": "INACTIVE",
  "createdAt": "2026-04-09T07:49:57.919Z",
  "updatedAt": "2026-04-09T08:59:28.084Z",
  "isDeleted": false,
  "deletedAt": null
}
```

Response `404 Not Found`:
```json
{
  "status": "error",
  "message": "Station not found"
}
```

#### PATCH /api/v1/lockers/stations/:id/delete

- Roles:  Operator

Response `200 OK`:
```json
{
  "message": "Station deleted",
  "station": {
    "stationId": "cc642bfa-446c-45a4-9d8e-5695b613e96f",
    "cityId": "6594dd53-269a-4ecc-9611-1d352013f973",
    "address": "test",
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "INACTIVE",
    "createdAt": "2026-04-09T07:48:37.905Z",
    "updatedAt": "2026-04-09T09:01:53.901Z",
    "isDeleted": true,
    "deletedAt": "2026-04-09T09:01:53.900Z"
  }
}
```

Response `404 Not Found`:
```json
{
  "status": "error",
  "message": "Station not found"
}
```