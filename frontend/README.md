Smart Locker System — README
🎯 Описание проекта
•	USER — бронирование и освобождение ячеек
•	OPERATOR — управление состоянием ячеек (открыть/закрыть/сбросить ошибку)
•	ADMIN — статистика, события, управление пользователями
✔ Фронтенд (готово)
Фронтенд реализован на React + TypeScript и включает:
🔐 Авторизация
•	AuthProvider с глобальным состоянием пользователя
•	автоматическое восстановление сессии через /auth/me
•	login/logout
•	refresh flow (интерцептор готов, ждёт backend)
•	useAuth() для доступа к данным пользователя
•	ProtectedRoute
•	RoleGuard
📦 Работа с ячейками
•	отображение списка ячеек
•	фильтрация
•	поиск
•	действия:
o	забронировать
o	освободить
o	открыть
o	закрыть
o	сбросить ошибку
🛠 Операторский модуль
•	таблица ячеек
•	действия оператора
•	useOperatorLockers
🏢 Админ панель
•	статистика
•	последние события
•	список пользователей (UI готов, API ждёт backend)
•	useAdminDashboard
🧱 Типизация (готово)
Все типы вынесены в shared/types:
•	User
•	Locker
•	AdminStats
•	AdminEvent
•	Role
🧪 Моки
Пока backend отсутствует, используется моковый httpClient с in memory базой.
❗ Что НЕ сделано (и требуется backend)
•	Реальные API запросы (сейчас заглушки)
•	Реальный refresh token flow
•	Обработка ошибок сервера
•	Настоящая база данных
•	Реальная логика бронирования/открытия/ошибок
🔗 API контракт для backend
🔐 AUTH API
POST /auth/login
Авторизация.
Request
json
{
"email": "string",
"password": "string"
}
Response
json
{
"accessToken": "string",
"refreshToken": "string",
"user": { ...User }
}
POST /auth/register
Регистрация.
GET /auth/me
Возвращает текущего пользователя по accessToken.
POST /auth/refresh
Обновление accessToken.
POST /auth/logout
Инвалидирует refreshToken.
📦 LOCKERS API
GET /lockers
Список всех ячеек.
Response
json
[
{
"id": "string",
"number": 1,
"status": "FREE | BUSY | ERROR",
"userId": "string | null"
}
]
GET /lockers/:id
Конкретная ячейка.
POST /lockers/:id/book
(ROLE: USER)
POST /lockers/:id/release
(ROLE: USER)
POST /lockers/:id/open
(ROLE: OPERATOR)
POST /lockers/:id/close
(ROLE: OPERATOR)
POST /lockers/:id/reset-error
(ROLE: OPERATOR)
🏢 ADMIN API
GET /admin/stats
Статистика:
json
{
"users": 100,
"lockers": 50,
"free": 20,
"busy": 25,
"errors": 5
}
GET /admin/events
Последние события.
GET /admin/users
Список пользователей.
PATCH /admin/users/:id
Изменение роли / блокировка.
🧱 Модели данных
User
{
"userId": "string",
"email": "string",
"name": "string",
"role": "USER" | "OPERATOR" | "ADMIN",
"phone": "string | null"
}
Locker
{
"id": "string",
"number": 1,
"status": "FREE" | "BUSY" | "ERROR",
"userId": "string | null"
}
AdminEvent
{
"id": "string",
"timestamp": "string",
"type": "string",
"message": "string"
}

