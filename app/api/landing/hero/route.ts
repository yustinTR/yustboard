import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import prisma from '@/lib/database/prisma';

export async function GET() {
  try {
    const hero = await prisma.landingHero.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(hero || null);
  } catch (error) {
    console.error('Error fetching hero content:', error);
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
    
    // Deactivate all existing heroes
    await prisma.landingHero.updateMany({
      where: { active: true },
      data: { active: false }
    });
    
    // Create new hero
    const hero = await prisma.landingHero.create({
      data: body
    });
    
    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error creating hero content:', error);
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
    
    const hero = await prisma.landingHero.update({
      where: { id },
      data
    });
    
    return NextResponse.json(hero);
  } catch (error) {
    console.error('Error updating hero content:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}