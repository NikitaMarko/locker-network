## Stations

### Endpoints:

#### GET /api/v1/lockers/stations/all

Response `200 OK`:
```json
[  
  {
    "stationId": "5d433dfc-44ce-4fa5-9422-b816a379be0d",
    "cityId": "23101b25-e4c2-4592-a27b-21ba05dedda3",
    "address": null,
    "latitude": 123.124,
    "longitude": 123.124,
    "status": "ACTIVE",
    "createdAt": "2026-04-08T23:06:19.717Z",
    "updatedAt": "2026-04-08T23:06:19.717Z",
    "isDeleted": false,
    "deletedAt": null,
    "lockers": [],
    "city": {
      "code": "TLV",
      "name": "Tel Aviv"
    }
  },
  {
    "stationId": "00629150-2394-4216-bce0-31d99f149a6f",
    "cityId": "23101b25-e4c2-4592-a27b-21ba05dedda3",
    "address": null,
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "ACTIVE",
    "createdAt": "2026-04-08T23:29:35.171Z",
    "updatedAt": "2026-04-08T23:57:46.576Z",
    "isDeleted": true,
    "deletedAt": "2026-04-08T23:57:46.574Z",
    "lockers": [],
    "city": {
      "code": "TLV",
      "name": "Tel Aviv"
    }
  },
  {
    "stationId": "23a843dc-b43b-467b-8902-bd37d7ef7a23",
    "cityId": "23101b25-e4c2-4592-a27b-21ba05dedda3",
    "address": null,
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "INACTIVE",
    "createdAt": "2026-04-09T00:22:43.869Z",
    "updatedAt": "2026-04-09T00:55:50.054Z",
    "isDeleted": true,
    "deletedAt": "2026-04-09T00:55:50.052Z",
    "lockers": [],
    "city": {
      "code": "TLV",
      "name": "Tel Aviv"
    }
  },
  {
    "stationId": "59cc1902-a082-4b61-8cf1-0d8586579ff4",
    "cityId": "6594dd53-269a-4ecc-9611-1d352013f973",
    "address": null,
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T07:49:57.919Z",
    "updatedAt": "2026-04-09T07:49:57.919Z",
    "isDeleted": false,
    "deletedAt": null,
    "lockers": [
      {
        "lockerBoxId": "0b8d7383-35eb-402f-9b8d-7675ba97912d",
        "stationId": "59cc1902-a082-4b61-8cf1-0d8586579ff4",
        "code": "A001",
        "size": "M",
        "status": "AVAILABLE",
        "version": 0,
        "lastStatusChangedAt": "2026-04-09T08:17:19.212Z",
        "createdAt": "2026-04-09T08:17:19.212Z",
        "updatedAt": "2026-04-09T08:17:19.212Z",
        "isDeleted": false,
        "deletedAt": null,
        "pricePerHour": "7.5"
      },
      {
        "lockerBoxId": "68a7af2f-2f99-40b8-8f68-c4878e8ade65",
        "stationId": "59cc1902-a082-4b61-8cf1-0d8586579ff4",
        "code": "A003",
        "size": "L",
        "status": "AVAILABLE",
        "version": 0,
        "lastStatusChangedAt": "2026-04-09T08:17:32.118Z",
        "createdAt": "2026-04-09T08:17:32.118Z",
        "updatedAt": "2026-04-09T08:17:32.118Z",
        "isDeleted": false,
        "deletedAt": null,
        "pricePerHour": "10"
      }
    ],
    "city": {
      "code": "HFA",
      "name": "Haifa"
    }
  },
  {
    "stationId": "cc642bfa-446c-45a4-9d8e-5695b613e96f",
    "cityId": "6594dd53-269a-4ecc-9611-1d352013f973",
    "address": "test",
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "INACTIVE",
    "createdAt": "2026-04-09T07:48:37.905Z",
    "updatedAt": "2026-04-09T08:09:32.216Z",
    "isDeleted": true,
    "deletedAt": "2026-04-09T08:09:32.215Z",
    "lockers": [],
    "city": {
      "code": "HFA",
      "name": "Haifa"
    }
  }
]
```


#### GET /api/v1/lockers/stations

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
    "stationId": "59cc1902-a082-4b61-8cf1-0d8586579ff4",
    "cityId": "6594dd53-269a-4ecc-9611-1d352013f973",
    "cityCode": "HFA",
    "cityName": "Haifa",
    "address": null,
    "latitude": 34.405045,
    "longitude": 37.706076,
    "status": "ACTIVE",
    "createdAt": "2026-04-09T07:49:57.919Z",
    "updatedAt": "2026-04-09T07:49:57.919Z",
    "isDeleted": false,
    "deletedAt": null,
    "distance": "0.09",
    "lockers": [
      {
        "lockerBoxId": "0b8d7383-35eb-402f-9b8d-7675ba97912d",
        "stationId": "59cc1902-a082-4b61-8cf1-0d8586579ff4",
        "code": "A001",
        "size": "M",
        "status": "AVAILABLE",
        "createdAt": "2026-04-09T08:17:19.212",
        "updatedAt": "2026-04-09T08:17:19.212",
        "pricePerHour": "7.5"
      },
      {
        "lockerBoxId": "1adf60e2-5d7f-4490-9dcc-670b4acbcd2a",
        "stationId": "59cc1902-a082-4b61-8cf1-0d8586579ff4",
        "code": "A002",
        "size": "M",
        "status": "AVAILABLE",
        "createdAt": "2026-04-09T08:17:25.117",
        "updatedAt": "2026-04-09T08:17:25.117",
        "pricePerHour": "7.5"
      },
      {
        "lockerBoxId": "68a7af2f-2f99-40b8-8f68-c4878e8ade65",
        "stationId": "59cc1902-a082-4b61-8cf1-0d8586579ff4",
        "code": "A003",
        "size": "L",
        "status": "AVAILABLE",
        "createdAt": "2026-04-09T08:17:32.118",
        "updatedAt": "2026-04-09T08:17:32.118",
        "pricePerHour": "10"
      }
    ]
  }
]
```


#### GET /api/v1/lockers/stations/:id

Response `200 OK`:
```json
{
  "stationId": "cc642bfa-446c-45a4-9d8e-5695b613e96f",
  "cityId": "6594dd53-269a-4ecc-9611-1d352013f973",
  "address": "test",
  "latitude": 34.405045,
  "longitude": 37.706076,
  "status": "INACTIVE",
  "createdAt": "2026-04-09T07:48:37.905Z",
  "updatedAt": "2026-04-09T08:09:32.216Z",
  "isDeleted": true,
  "deletedAt": "2026-04-09T08:09:32.215Z",
  "lockers": [],
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

- Request Body: 
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