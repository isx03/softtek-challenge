import { getModels } from '../functions/getModels';
import { ddbDocClient } from '../config/db';
import { StatusCodes } from 'http-status-codes';

// Mock de ddbDocClient
jest.mock('../config/db', () => ({
  ddbDocClient: {
    send: jest.fn(),
  },
}));

describe('getModels Lambda', () => {
  it('should return models successfully', async () => {
    const mockResponse = { Items: [{ id: '1', name: 'Model1' }] };
    (ddbDocClient.send as jest.Mock).mockResolvedValue(mockResponse)

    const event = {};
    const result = await getModels(event as any);

    expect(result.statusCode).toBe(StatusCodes.OK);
    expect(JSON.parse(result.body)).toEqual(mockResponse.Items);
  });

  it('should return error if DynamoDB fails', async () => {
    const mockError = { status: 500, statusText: 'Internal Server Error' };
    (ddbDocClient.send as jest.Mock).mockRejectedValue(mockError);

    const event = {};
    const result = await getModels(event as any);

    expect(result.statusCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(result.body).toBe(mockError.statusText);
  });
});