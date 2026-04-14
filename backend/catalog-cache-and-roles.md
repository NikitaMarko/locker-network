# Станции, ячейки и кэширование по ролям

Этот документ описывает актуальную схему после переноса station cache в Redis на стороне backend.

## 1. Источники данных

- `PostgreSQL (RDS)` — источник истины и write model
- `Redis` — station cache для публичных и user-read endpoint'ов
- `DynamoDB` — locker cache и таблица async operations

## 2. Как устроен поток обновления

### Станции

```text
POST/PATCH/DELETE station or locker
  -> PostgreSQL
  -> build station projection from RDS
  -> backend writes station cache directly to Redis
```

### Ячейки

```text
POST/PATCH/DELETE locker
  -> PostgreSQL
  -> build locker projection in backend
  -> DynamoDB locker cache
```

## 3. Поведение по ролям

### `guest`

- `GET /api/v1/lockers/stations`
- `GET /api/v1/lockers/boxes`

Источники:

- stations: сначала Redis, потом fallback в RDS projection
- lockers: только DynamoDB

### `user`

- все возможности `guest`
- `GET /api/v1/lockers/stations/:id`
- `GET /api/v1/lockers/boxes/:id`

Источники:

- stations: Redis -> fallback RDS
- lockers: DynamoDB

### `operator`

- читает admin-view напрямую из PostgreSQL
- пишет в PostgreSQL
- после записи backend сам обновляет station cache в Redis
- backend сам обновляет locker cache в DynamoDB

### `admin`

- все возможности `operator`
- `POST /api/v1/lockers/admin/stations/:id/resync-cache`
- `POST /api/v1/lockers/admin/boxes/:id/resync-cache`
- `POST /api/v1/lockers/admin/cache/reconcile`

`resync-cache` для станции пишет projection напрямую в Redis.

`resync-cache` для ячейки пишет locker projection напрямую в DynamoDB.

`cache/reconcile` работает раздельно:

- stations: сравнивает RDS и Redis, затем пишет в Redis напрямую
- lockers: сравнивает RDS и DynamoDB, затем пишет в DynamoDB напрямую

## 4. Что лежит в station cache

- `stationId`, `cityId`, `address`, `latitude`, `longitude`
- `status`
- `version`
- `availableLockers`
- `city`
- вложенный список `lockers`

Версия станции вычисляется как:

- `station.updatedAt.getTime() * 1000 + station.version`

Это позволяет инвалидировать station cache даже при изменениях только в составе ячеек.

## 5. Что лежит в locker cache

- `lockerBoxId`, `stationId`, `code`, `size`, `status`
- `version`
- `lastStatusChangedAt`
- `pricePerHour`
- вложенная информация о станции

Locker cache хранится в DynamoDB, а runtime-статусы ячеек меняются только там.

## 6. Fallback-поведение

Если Redis недоступен:

- station read endpoint'ы читают projection из PostgreSQL
- station reconcile переключается в режим full resync from RDS

Если DynamoDB недоступна:

- locker read endpoint'ы возвращают ошибку, потому что runtime-статусы доступны только в DynamoDB
- locker reconcile переключается в режим full resync from backend state

## 7. Итог

- station cache полностью обслуживается backend + Redis
- locker cache остается в DynamoDB
- PostgreSQL хранит station metadata и locker metadata без runtime-статусов
- DynamoDB является источником истины для locker statuses
