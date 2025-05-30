import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const contact = await prisma.landingContact.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(contact || null);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    
    // Deactivate all existing contact info
    await prisma.landingContact.updateMany({
      where: { active: true },
      data: { active: false }
    });
    
    // Create new contact info
    const contact = await prisma.landingContact.create({
      data: body
    });
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error creating contact info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    const contact = await prisma.landingContact.update({
      where: { id },
      data
    });
    
    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}