import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Check if service role key exists
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is missing!')
}

// Create admin client with service role key
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null

export async function POST(request: NextRequest) {
  try {
    // Check if service role key is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: '🔑 SERVICE_ROLE_KEY eksik!\n\n1. Supabase Dashboard → Settings → API\n2. service_role key\'ini kopyala\n3. .env.local dosyasına ekle:\n   SUPABASE_SERVICE_ROLE_KEY=your_key_here\n4. Geliştirme sunucusunu yeniden başlat'
        },
        { status: 500 }
      )
    }

    const { email, password, fullName, role } = await request.json()

    // Validate input
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Tüm alanlar gereklidir' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Create user with admin client
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        role: role
      },
      email_confirm: true // Auto-confirm email
    })

    if (error) {
      console.error('User creation error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Ayrıca user_profiles tablosuna da kaydet (trigger otomatik yapacak ama emin olmak için)
    if (data.user) {
      try {
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            role: role
          })
        
        if (profileError) {
          console.warn('Profile creation warning:', profileError)
          // Bu hata kritik değil, trigger zaten yapacak
        }
      } catch (profileErr) {
        console.warn('Profile creation error (non-critical):', profileErr)
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name: fullName,
        role: role
      }
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Check if service role key is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: '🔑 SERVICE_ROLE_KEY eksik! .env.local dosyasına Supabase service_role key\'ini ekleyin.'
        },
        { status: 500 }
      )
    }

    // List all users with profile information
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Get user profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, role, created_at, updated_at')

    if (profileError) {
      console.warn('Profile fetch warning:', profileError)
      // Fallback to auth users only
      return NextResponse.json({
        success: true,
        users: authUsers.users
      })
    }

    // Merge auth users with profiles
    const usersWithProfiles = authUsers.users.map(user => {
      const profile = profiles.find(p => p.id === user.id)
      return {
        ...user,
        profile: profile || {
          full_name: user.user_metadata?.full_name || user.email,
          role: user.user_metadata?.role || 'sales'
        }
      }
    })

    return NextResponse.json({
      success: true,
      users: usersWithProfiles
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if service role key is configured
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          error: '🔑 SERVICE_ROLE_KEY eksik! .env.local dosyasına Supabase service_role key\'ini ekleyin.'
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID gereklidir' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Kullanıcı silindi'
    })

  } catch (error) {
    console.error('API route error:', error)
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}