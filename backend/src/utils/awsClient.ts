import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";


const dynamoClient = new DynamoDBClient(
{ region     : process.env.AWS_DYNAMO_REGION || "eu-west-1" ,
});

// @ts-ignore
export const dynamoDocClient = new DynamoDBDocumentClient(dynamoClient);
