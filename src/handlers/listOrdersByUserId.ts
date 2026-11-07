import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { internalError, forbidden, notFound, ok} from "../lib/response";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../lib/dynamodb";
import { withCORS } from "../common/cors";

const ORDERS_TABLE = process.env.ORDERS_TABLE;

async function listOrdersByUserIdHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {

        const userId = event.pathParameters?.userId;

        const callerId = event.requestContext.authorizer?.userId as string;

        if(userId !== callerId){
            return forbidden("Solo puedes listar tus propias ordenes")
        }

        const result = await dynamo.send(
            new QueryCommand({
                TableName: ORDERS_TABLE,
                IndexName: "UserOrdersIndex",
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: { ":userId": userId },
                //Conseguir mas recientes primero
                ScanIndexForward: false
            })
        )

        return ok({ order: result.Items ?? {} });

    } catch (error) {
        console.error("Error en listOrders:", error);
        return internalError();
    }
}
export const listOrdersByUserId = withCORS(listOrdersByUserIdHandler);