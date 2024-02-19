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
  if (status !== 202) {
    console.log(message);
  }
  return NextResponse.json({ message }, { status });
};
