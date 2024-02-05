import { NextResponse } from 'next/server';

export const sendErrorResponse = (
  message: string,
  status: number
): NextResponse => {
  console.error(message);
  return NextResponse.json({ message }, { status });
};

export const sendInformationResponse = (
  message: string,
  status: number
): NextResponse => {
  console.log(message);
  return NextResponse.json({ message }, { status });
};

export function handleErrorResponse(error: Error): NextResponse {
  console.error('Error:', error.message);
  const status =
    error.message === 'User not found' ||
    error.message === 'User email is required'
      ? 404
      : 500;
  return sendErrorResponse(error.message, status);
}
