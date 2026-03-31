import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {DynamoDBDocumentClient} from "@aws-sdk/lib-dynamodb";


const dynamoClient = new DynamoDBClient({
    region: "eu-west-1" ,
});


export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);
