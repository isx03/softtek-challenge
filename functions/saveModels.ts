import { StatusCodes } from 'http-status-codes'
import { Film, People , Planet , Specie , Starship , Vehicle } from '../interfaces';
import axios from 'axios';
import { EnglishSpanish } from '../enums/EnglishSpanish';
import { ddbDocClient } from '../config/db';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const saveModels = async (event) => {
  try {
    const body = JSON.parse(event.body)
  
    const responseSwapi = await axios.get<Film | People | Planet | Specie | Starship | Vehicle>(`https://swapi.py4e.com/api/${body.type}/${body.id}`)
  
    let modelTranslated: any = {
      id: `${body.type}-${body.id}`
    }
  
    Object.entries(responseSwapi.data).forEach(([key, value]) => {
      const translatedText:string = EnglishSpanish[key as keyof typeof EnglishSpanish]
      modelTranslated[translatedText] = value
    })
  
    await ddbDocClient.send(new PutCommand({
      TableName: "models_softtek",
      Item: modelTranslated,
    }))
  
    return {
      statusCode: StatusCodes.CREATED,
      body: JSON.stringify(modelTranslated),
    };
  } catch (error: any) {
    return {
      statusCode: error?.status || StatusCodes.INTERNAL_SERVER_ERROR,
      body: error?.statusText || 'Not found',
    };
  }
}

