import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

/**
 * Setup Swagger/OpenAPI documentation
 * Accessible at /api/docs when NODE_ENV !== 'production'
 */
export function setupSwagger(app: Express, version: string = '1.0.0'): void {
    const config = new DocumentBuilder()
        .setTitle('Locker Network API')
        .setDescription(
            `
            🔐 Locker Network Backend API
            
            ## Key Features:
            - User authentication (JWT with refresh token)
            - Locker management & reservations
            - Station management
            - Audit logging
            - Rate limiting & security
            
            ## Auth Flow:
            1. Register/Login → returns accessToken (JWT) + refreshToken (httpOnly cookie)
            2. Include accessToken in Authorization header: \`Bearer <token>\`
            3. When accessToken expires, use /refresh endpoint with refreshToken
            4. Logout to invalidate both tokens
            
            ## Security:
            - All endpoints protected with JWT (except /register, /login, /refresh)
            - Rate limiting on auth endpoints
            - CORS, CSRF protection
            - Helmet security headers
            - Password hashing with Argon2
            - Token versioning for instant logout
            `
        )
        .setVersion(version)
        .setContact({
            name: 'API Support',
            email: 'support@lockernetwork.com',
        })
        .setLicense({
            name: 'ISC',
            url: 'https://opensource.org/licenses/ISC',
        })
        .addServer('http://localhost:3555', 'Development')
        .addServer('https://api.lockernetwork.com', 'Production')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT access token',
            },
            'bearer'
        )
        .addCookieAuth('refreshToken', {
            type: 'apiKey',
            in: 'cookie',
            description: 'httpOnly cookie with refresh token',
        }, 'cookie')
        .addTag('Auth', 'Authentication endpoints (register, login, logout)')
        .addTag('Users', 'User profile endpoints')
        .addTag('Lockers', 'Locker box management')
        .addTag('Stations', 'Locker station management')
        .addTag('Bookings', 'Locker booking/reservation endpoints')
        .addTag('Audit', 'Audit logs for compliance')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            displayOperationId: true,
            filter: true,
            showRequestHeaders: true,
            docExpansion: 'list',
            defaultModelsExpandDepth: 1,
            defaultModelExpandDepth: 1,
        },
        customCss: '.topbar { display: none }',
        customSiteTitle: 'Locker Network API',
    });
}

export default setupSwagger;

