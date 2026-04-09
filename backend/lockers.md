## Lockers

### Endpoints:

#### GET /api/v1/lockers/

- Roles:  Operator, Admin

Response `200 OK`:
```json
[
  {
    "lockerBoxId": "510520e8-3e12-4332-b3b5-7d5b54d19991",
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "code": "A-01",
    "size": "S",
    "status": "AVAILABLE",
    "version": 0,
    "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
    "createdAt": "2026-04-09T12:50:59.303Z",
    "updatedAt": "2026-04-09T12:50:59.303Z",
    "isDeleted": false,
    "deletedAt": null,
    "station": {
      "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
      "address": "Tel Aviv, Dizengoff 10",
      "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
      "city": "Tel Aviv"
    },
    "pricePerHour": "5"
  },
  {
    "lockerBoxId": "e53ef165-f9dd-40d7-854f-d439a64b4741",
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "code": "A-02",
    "size": "S",
    "status": "AVAILABLE",
    "version": 0,
    "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
    "createdAt": "2026-04-09T12:50:59.303Z",
    "updatedAt": "2026-04-09T12:50:59.303Z",
    "isDeleted": false,
    "deletedAt": null,
    "station": {
      "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
      "address": "Tel Aviv, Dizengoff 10",
      "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
      "city": "Tel Aviv"
    },
    "pricePerHour": "5"
  },
  {
    "lockerBoxId": "b8e1ced2-273c-4d1c-b348-04974254d5b7",
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "code": "A-03",
    "size": "S",
    "status": "AVAILABLE",
    "version": 0,
    "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
    "createdAt": "2026-04-09T12:50:59.303Z",
    "updatedAt": "2026-04-09T12:50:59.303Z",
    "isDeleted": false,
    "deletedAt": null,
    "station": {
      "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
      "address": "Tel Aviv, Dizengoff 10",
      "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
      "city": "Tel Aviv"
    },
    "pricePerHour": "5"
  },
  {
    "lockerBoxId": "41e9a0a8-df84-4cd3-b6b9-499c9d0d69af",
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "code": "A-04",
    "size": "M",
    "status": "AVAILABLE",
    "version": 0,
    "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
    "createdAt": "2026-04-09T12:50:59.303Z",
    "updatedAt": "2026-04-09T12:50:59.303Z",
    "isDeleted": false,
    "deletedAt": null,
    "station": {
      "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
      "address": "Tel Aviv, Dizengoff 10",
      "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
      "city": "Tel Aviv"
    },
    "pricePerHour": "7.5"
  },
  {
    "lockerBoxId": "d9e0010b-bc46-40f2-b07c-0a6f26b61b93",
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "code": "A-05",
    "size": "M",
    "status": "AVAILABLE",
    "version": 0,
    "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
    "createdAt": "2026-04-09T12:50:59.303Z",
    "updatedAt": "2026-04-09T12:50:59.303Z",
    "isDeleted": false,
    "deletedAt": null,
    "station": {
      "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
      "address": "Tel Aviv, Dizengoff 10",
      "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
      "city": "Tel Aviv"
    },
    "pricePerHour": "7.5"
  },
  {
    "lockerBoxId": "214710ed-d78e-4735-84d7-2ad0753a068b",
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "code": "A-06",
    "size": "M",
    "status": "AVAILABLE",
    "version": 0,
    "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
    "createdAt": "2026-04-09T12:50:59.303Z",
    "updatedAt": "2026-04-09T12:50:59.303Z",
    "isDeleted": false,
    "deletedAt": null,
    "station": {
      "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
      "address": "Tel Aviv, Dizengoff 10",
      "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
      "city": "Tel Aviv"
    },
    "pricePerHour": "7.5"
  }
]
```


#### GET /api/v1/lockers/boxes

- Roles:  All

- Query params: stationId, size, status

For example:

- /api/v1/lockers/boxes?status=RESERVED&size=M&stationId=e1cdfac0-44b9-4157-a13f-e0e49cacaa9b
- /api/v1/lockers/boxes?size=M


Response `200 OK`:
```json
[
  {
    "lockerBoxId": "510520e8-3e12-4332-b3b5-7d5b54d19991",
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "code": "A-01",
    "size": "S",
    "status": "RESERVED",
    "version": 0,
    "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
    "createdAt": "2026-04-09T12:50:59.303Z",
    "updatedAt": "2026-04-09T15:06:26.033Z",
    "isDeleted": false,
    "deletedAt": null,
    "station": {
      "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
      "address": "Tel Aviv, Dizengoff 10",
      "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
      "city": "Tel Aviv"
    },
    "pricePerHour": "5"
  }
]
```


#### GET /api/v1/lockers/boxes/:id

- Roles:  Operator, Admin, User

Response `200 OK`:
```json
{
  "lockerBoxId": "e53ef165-f9dd-40d7-854f-d439a64b4741",
  "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
  "code": "A-02",
  "size": "S",
  "status": "AVAILABLE",
  "version": 0,
  "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
  "createdAt": "2026-04-09T12:50:59.303Z",
  "updatedAt": "2026-04-09T12:50:59.303Z",
  "isDeleted": false,
  "deletedAt": null,
  "station": {
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "address": "Tel Aviv, Dizengoff 10",
    "cityId": "bf5455e6-3a67-484d-a617-59fc5b9b834c",
    "city": "Tel Aviv"
  },
  "pricePerHour": "5"
}
```

Response `404 Not Found`:
```json
{
  "status": "error",
  "message": "Locker doesn't exist"
}
```

#### POST /api/v1/lockers/boxes

- Roles:  Operator, Admin

- Request Body:
```json
{
  "stationId": "e1cdfac0-44b9-4157-a13f-e0e49cacaa9b",
  "code": "A007",
  "size": "L"
}
```

Response `200 OK`:
```json
{
  "id": "c89e43b3-5b28-410a-a9f7-453b81cf076f",
  "stationId": "e1cdfac0-44b9-4157-a13f-e0e49cacaa9b"
}
```

Response `400 Bad Request`:
```json
{
  "status": "error",
  "message": "Station doesn't exists"
}
```

#### PATCH /api/v1/lockers/boxes/:id/status

- Roles:  Operator, Admin

- Request Body:
```json
{
  "status": "RESERVED"
}
```

Response `200 OK`:
```json
{
  "lockerBoxId": "510520e8-3e12-4332-b3b5-7d5b54d19991",
  "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
  "code": "A-01",
  "size": "S",
  "status": "RESERVED",
  "version": 0,
  "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
  "createdAt": "2026-04-09T12:50:59.303Z",
  "updatedAt": "2026-04-09T15:06:26.033Z",
  "isDeleted": false,
  "deletedAt": null
}
```

Response `404 Not Found`:
```json
{
  "status": "error",
  "message": "Locker not found"
}
```

#### PATCH /api/v1/lockers/boxes/:id/delete

- Roles:  Operator

Response `200 OK`:
```json
{
  "message": "Locker deleted",
  "station": {
    "lockerBoxId": "510520e8-3e12-4332-b3b5-7d5b54d19991",
    "stationId": "22be00a2-1adf-4d03-931c-2dffa291015a",
    "code": "A-01",
    "size": "S",
    "status": "RESERVED",
    "version": 0,
    "lastStatusChangedAt": "2026-04-09T12:50:59.303Z",
    "createdAt": "2026-04-09T12:50:59.303Z",
    "updatedAt": "2026-04-09T15:16:45.891Z",
    "isDeleted": true,
    "deletedAt": "2026-04-09T15:16:45.889Z"
  }
}
```

Response `404 Not Found`:
```json
{
  "status": "error",
  "message": "Locker not found"
}
```