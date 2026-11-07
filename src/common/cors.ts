import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Permite cualquier evento que extienda APIGatewayProxyEvent (incluyendo autorizadores personalizados)
type Handler<T extends APIGatewayProxyEvent = APIGatewayProxyEvent> = (
    event: T
) => Promise<APIGatewayProxyResult>;

const CORS_HEADERS = [
    "Content-Type",
    "Authorization",
    "X-Api-Key",
    "X-Amz-Date",
    "X-Amz-Security-Token"
].join(",");

export function withCORS<T extends APIGatewayProxyEvent>(handler: Handler<T>): Handler<T> {
    return async (event: T): Promise<APIGatewayProxyResult> => {
        const allowedOrigins = (process.env.CORS_ORIGINS ?? "").split(",").map((o) => o.trim()).filter(Boolean);

        const origin = event.headers?.origin ?? event.headers?.Origin ?? "";
        const allowedOrigin = allowedOrigins.includes(origin) ? origin : ""; 
    
        const result = await handler(event);
        return {
            ...result,
            headers: {
                ...result.headers, 
                "Access-Control-Allow-Origin": allowedOrigin,
                "Access-Control-Allow-Headers": CORS_HEADERS,
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            }
        };
    };
}