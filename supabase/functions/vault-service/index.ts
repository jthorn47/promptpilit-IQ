import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Database {
  public: {
    Tables: {
      vault_files: {
        Row: {
          id: string
          name: string
          original_name: string
          file_path: string
          file_size: number
          mime_type: string
          company_id: string
          uploaded_by: string
          folder_path: string | null
          is_shared: boolean
          checksum: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          original_name: string
          file_path: string
          file_size: number
          mime_type: string
          company_id: string
          uploaded_by: string
          folder_path?: string | null
          is_shared?: boolean
          checksum: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          is_shared?: boolean
          folder_path?: string | null
          updated_at?: string
        }
      }
      vault_share_links: {
        Row: {
          id: string
          file_id: string
          token: string
          expires_at: string | null
          max_uses: number | null
          view_count: number
          is_active: boolean
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          file_id: string
          token: string
          expires_at?: string | null
          max_uses?: number | null
          view_count?: number
          is_active?: boolean
          created_by: string
          created_at?: string
        }
        Update: {
          expires_at?: string | null
          max_uses?: number | null
          is_active?: boolean
        }
      }
    }
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/').filter(Boolean)
    
    // Extract the path after /vault-service/
    const serviceIndex = pathSegments.indexOf('vault-service')
    const servicePath = pathSegments.slice(serviceIndex + 1)

    console.log('🔧 Vault Service:', req.method, servicePath.join('/'))
    console.log('🔧 Full URL:', req.url)

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const method = req.method
    const [resource, resourceId, action] = servicePath

    // Routes
    if (resource === 'files') {
      if (method === 'GET' && !resourceId) {
        // GET /files - List files with optional filters
        const query = url.searchParams.get('query')
        const fileType = url.searchParams.get('fileType')
        const folderPath = url.searchParams.get('folderPath')
        const isShared = url.searchParams.get('isShared')

        let queryBuilder = supabaseClient
          .from('vault_files')
          .select('*')
          .order('created_at', { ascending: false })

        if (query) {
          queryBuilder = queryBuilder.or(`name.ilike.%${query}%,original_name.ilike.%${query}%`)
        }
        if (fileType) {
          queryBuilder = queryBuilder.eq('mime_type', fileType)
        }
        if (folderPath) {
          queryBuilder = queryBuilder.eq('folder_path', folderPath)
        }
        if (isShared !== null && isShared !== undefined) {
          queryBuilder = queryBuilder.eq('is_shared', isShared === 'true')
        }

        const { data, error } = await queryBuilder
        if (error) throw error

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (method === 'POST' && servicePath[1] === 'upload') {
        // POST /files/upload - Upload file
        const formData = await req.formData()
        const file = formData.get('file') as File
        const folderPath = formData.get('folderPath') as string || '/'

        if (!file) {
          return new Response(JSON.stringify({ error: 'No file provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `${folderPath}/${fileName}`.replace(/\/+/g, '/')

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('vault')
          .upload(filePath, file)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        // Calculate checksum (simplified)
        const arrayBuffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

        // Save file metadata to database
        const { data, error } = await supabaseClient
          .from('vault_files')
          .insert({
            name: fileName,
            original_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            mime_type: file.type,
            company_id: user.user_metadata?.company_id || 'default',
            uploaded_by: user.id,
            folder_path: folderPath,
            checksum,
          })
          .select()
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (method === 'GET' && resourceId) {
        // GET /files/:id - Get specific file
        const { data, error } = await supabaseClient
          .from('vault_files')
          .select('*')
          .eq('id', resourceId)
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (method === 'DELETE' && resourceId) {
        // DELETE /files/:id - Delete file
        const { data: fileData, error: fetchError } = await supabaseClient
          .from('vault_files')
          .select('file_path')
          .eq('id', resourceId)
          .single()

        if (fetchError) throw fetchError

        // Delete from storage
        const { error: storageError } = await supabaseClient.storage
          .from('vault')
          .remove([fileData.file_path])

        if (storageError) {
          console.error('Storage deletion error:', storageError)
        }

        // Delete from database
        const { error } = await supabaseClient
          .from('vault_files')
          .delete()
          .eq('id', resourceId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (method === 'POST' && resourceId && action === 'share') {
        // POST /files/:id/share - Create share link
        const { expires_at, max_uses } = await req.json()
        
        const token = crypto.randomUUID()
        
        const { data, error } = await supabaseClient
          .from('vault_share_links')
          .insert({
            file_id: resourceId,
            token,
            expires_at,
            max_uses,
            created_by: user.id,
          })
          .select()
          .single()

        if (error) throw error

        // Update file as shared
        await supabaseClient
          .from('vault_files')
          .update({ is_shared: true })
          .eq('id', resourceId)

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (method === 'GET' && resourceId && action === 'shares') {
        // GET /files/:id/shares - Get file shares
        const { data, error } = await supabaseClient
          .from('vault_share_links')
          .select('*')
          .eq('file_id', resourceId)
          .order('created_at', { ascending: false })

        if (error) throw error

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    if (resource === 'shares') {
      if (method === 'PUT' && resourceId) {
        // PUT /shares/:id - Update share
        const updateData = await req.json()
        
        const { data, error } = await supabaseClient
          .from('vault_share_links')
          .update(updateData)
          .eq('id', resourceId)
          .select()
          .single()

        if (error) throw error

        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (method === 'DELETE' && resourceId) {
        // DELETE /shares/:id - Delete share
        const { error } = await supabaseClient
          .from('vault_share_links')
          .delete()
          .eq('id', resourceId)

        if (error) throw error

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    if (resource === 'stats') {
      // GET /stats - Get vault statistics
      const { data: files, error } = await supabaseClient
        .from('vault_files')
        .select('file_size, is_shared, created_at')

      if (error) throw error

      const totalFiles = files.length
      const totalSize = files.reduce((sum, file) => sum + file.file_size, 0)
      const sharedFiles = files.filter(file => file.is_shared).length
      
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recentUploads = files.filter(file => 
        new Date(file.created_at) > weekAgo
      ).length

      return new Response(JSON.stringify({
        data: {
          total_files: totalFiles,
          total_size: totalSize,
          shared_files: sharedFiles,
          recent_uploads: recentUploads,
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (resource === 'search') {
      // GET /search - Search files
      const query = url.searchParams.get('q') || ''
      const fileType = url.searchParams.get('fileType')
      const folderPath = url.searchParams.get('folderPath')

      let queryBuilder = supabaseClient
        .from('vault_files')
        .select('*')
        .or(`name.ilike.%${query}%,original_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (fileType) {
        queryBuilder = queryBuilder.eq('mime_type', fileType)
      }
      if (folderPath) {
        queryBuilder = queryBuilder.eq('folder_path', folderPath)
      }

      const { data, error } = await queryBuilder
      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Vault service error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})