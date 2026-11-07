import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { internalError, forbidden, notFound, ok} from "../lib/response";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "../lib/dynamodb";
import { withCORS } from "../common/cors";

const ORDERS_TABLE = process.env.ORDERS_TABLE;

async function getOrderHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const orderId = event.pathParameters?.id;

        if(!orderId){
            return notFound("La orden no se pudo encontrar.")
        }

        const callerId = event.requestContext.authorizer?.userId as string;

        const result = await dynamo.send(
            new GetCommand({TableName: ORDERS_TABLE, Key: { orderId } })
        )

        if(!result.Item){
            return notFound("La orden no se pudo encontrar.")
        }

        //validación para que solo el dueño pueda ver la orden.

        if(result.Item.userId !== callerId){
            return forbidden("Solo puedes ver las órdenes que hayas generado tu")
        }

        return ok({ order: result.Item });



    } catch (error) {
        console.error("Error en getOrder:", error);
        return internalError();
    }
}
export const getOrder = withCORS(getOrderHandler);