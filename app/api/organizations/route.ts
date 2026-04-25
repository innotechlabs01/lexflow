import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { organizations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      slug, 
      plan, 
      contactEmail, 
      contactPhone, 
      website,
      industry,
      employeeCount,
      address,
      city,
      country
    } = body

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nombre y slug son requeridos' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await db.query.organizations.findFirst({
      where: eq(organizations.slug, slug),
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Esta URL ya está en uso. Por favor usa otra.' },
        { status: 400 }
      )
    }

    // Convert employeeCount to number or null
    const employeeCountNum = employeeCount ? parseInt(employeeCount, 10) : null

    // Create organization
    const [org] = await db
      .insert(organizations)
      .values({
        name,
        slug,
        plan: plan as 'free' | 'pro' | 'enterprise',
        status: 'trial', // Todos empiezan en trial
        logoUrl: null, // No logo URL provided in form
        settings: {}, // Empty settings object
        industry: industry || null,
        employeeCount: employeeCountNum,
        address: address || null,
        city: city || null,
        country: country || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        website: website || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning()

    // Settings should already be parsed as an object by Drizzle due to mode: 'json'
    const parsedSettings = org.settings ?? {}

    return NextResponse.json({
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      status: org.status,
      logoUrl: org.logoUrl,
      settings: parsedSettings,
      industry: org.industry,
      employeeCount: org.employeeCount,
      address: org.address,
      city: org.city,
      country: org.country,
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone,
      website: org.website,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
      // Stats for new organization
      userCount: 0,
      clientCount: 0,
      caseCount: 0,
    })
  } catch (error) {
    console.error('[API] Error creating organization:', error)
    return NextResponse.json(
      { error: 'Error al crear organización' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de organización es requerido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { 
      name, 
      slug, 
      plan, 
      contactEmail, 
      contactPhone, 
      website,
      industry,
      employeeCount,
      address,
      city,
      country,
      status,
      logoUrl,
      settings
    } = body

    // Check if organization exists
    const existingOrg = await db.query.organizations.findFirst({
      where: eq(organizations.id, id),
    })

    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    // Check if slug is being changed and already exists
    if (slug && slug !== existingOrg.slug) {
      const slugExists = await db.query.organizations.findFirst({
        where: eq(organizations.slug, slug),
      })

      if (slugExists && slugExists.id !== id) {
        return NextResponse.json(
          { error: 'Esta URL ya está en uso. Por favor usa otra.' },
          { status: 400 }
        )
      }
    }

    // Convert employeeCount to number or null if provided
    const employeeCountNum = employeeCount !== undefined && employeeCount !== null 
      ? parseInt(employeeCount, 10) 
      : existingOrg.employeeCount

    // Update organization
    const [org] = await db
      .update(organizations)
      .set({
        name: name ?? existingOrg.name,
        slug: slug ?? existingOrg.slug,
        plan: plan ?? existingOrg.plan,
        status: status ?? existingOrg.status,
        logoUrl: logoUrl ?? existingOrg.logoUrl,
        settings: settings ?? existingOrg.settings,
        industry: industry ?? existingOrg.industry,
        employeeCount: employeeCountNum,
        address: address ?? existingOrg.address,
        city: city ?? existingOrg.city,
        country: country ?? existingOrg.country,
        contactEmail: contactEmail ?? existingOrg.contactEmail,
        contactPhone: contactPhone ?? existingOrg.contactPhone,
        website: website ?? existingOrg.website,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, id))
      .returning()

    // Settings should already be parsed as an object by Drizzle due to mode: 'json'
    const parsedSettings = org.settings ?? {}

    return NextResponse.json({
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      status: org.status,
      logoUrl: org.logoUrl,
      settings: parsedSettings,
      industry: org.industry,
      employeeCount: org.employeeCount,
      address: org.address,
      city: org.city,
      country: org.country,
      contactEmail: org.contactEmail,
      contactPhone: org.contactPhone,
      website: org.website,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
    })
  } catch (error) {
    console.error('[API] Error updating organization:', error)
    return NextResponse.json(
      { error: 'Error al actualizar organización' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de organización es requerido' },
        { status: 400 }
      )
    }

    // Check if organization exists
    const existingOrg = await db.query.organizations.findFirst({
      where: eq(organizations.id, id),
    })

    if (!existingOrg) {
      return NextResponse.json(
        { error: 'Organización no encontrada' },
        { status: 404 }
      )
    }

    // Delete organization
    await db
      .delete(organizations)
      .where(eq(organizations.id, id))

    return NextResponse.json({
      success: true,
      message: 'Organización eliminada correctamente'
    })
  } catch (error) {
    console.error('[API] Error deleting organization:', error)
    return NextResponse.json(
      { error: 'Error al eliminar organización' },
      { status: 500 }
    )
  }
}