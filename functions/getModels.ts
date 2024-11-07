import { StatusCodes } from "http-status-codes"
import { ddbDocClient } from "../config/db";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

export const getModels = async (event) => {
  try {
    const { Items } = await ddbDocClient.send(new ScanCommand({
      TableName: 'models_softtek'
    }))
  
    return {
      statusCode: StatusCodes.OK,
      body: JSON.stringify(Items),
    };
  } catch (error: any) {
    return {
      statusCode: error?.status || StatusCodes.INTERNAL_SERVER_ERROR,
      body: error?.statusText || 'Not found',
    };
  }
}

