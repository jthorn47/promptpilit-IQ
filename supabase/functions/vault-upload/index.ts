import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Check upload permissions
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const hasUploadPermission = userRoles?.some(ur => 
      ['super_admin', 'company_admin'].includes(ur.role)
    )

    if (!hasUploadPermission) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to upload files' }),
        { status: 403, headers: corsHeaders }
      )
    }

    // Get user's company
    const { data: userCompany } = await supabase
      .from('user_roles')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const folderPath = formData.get('folderPath') as string || '/'

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/png',
      'image/jpeg',
      'text/csv',
      'application/zip'
    ]

    const maxFileSize = 100 * 1024 * 1024 // 100MB
    const uploadResults = []

    for (const file of files) {
      try {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          uploadResults.push({
            filename: file.name,
            success: false,
            error: `File type ${file.type} not allowed`
          })
          continue
        }

        // Validate file size
        if (file.size > maxFileSize) {
          uploadResults.push({
            filename: file.name,
            success: false,
            error: 'File size exceeds 100MB limit'
          })
          continue
        }

        // Generate unique filename
        const fileId = crypto.randomUUID()
        const fileExtension = file.name.split('.').pop()
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storagePath = `${folderPath}${fileId}_${sanitizedName}`

        // Upload to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('vault')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (storageError) {
          console.error('Storage upload error:', storageError)
          uploadResults.push({
            filename: file.name,
            success: false,
            error: storageError.message
          })
          continue
        }

        // Generate checksum for file integrity
        const fileBuffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest('SHA-256', fileBuffer)
        const checksum = Array.from(new Uint8Array(hashBuffer))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')

        // Create database record
        const { data: fileRecord, error: dbError } = await supabase
          .from('vault_files')
          .insert({
            id: fileId,
            name: sanitizedName,
            original_name: file.name,
            file_path: storagePath,
            file_size: file.size,
            mime_type: file.type,
            uploaded_by: user.id,
            company_id: userCompany?.company_id,
            folder_path: folderPath,
            checksum: checksum
          })
          .select()
          .single()

        if (dbError) {
          // Clean up storage if DB insert fails
          await supabase.storage.from('vault').remove([storagePath])
          console.error('Database insert error:', dbError)
          uploadResults.push({
            filename: file.name,
            success: false,
            error: 'Failed to create file record'
          })
          continue
        }

        // Get public URL for the file
        const { data: urlData } = supabase.storage
          .from('vault')
          .getPublicUrl(storagePath)

        // Log upload action
        await supabase.rpc('log_vault_action', {
          p_file_id: fileId,
          p_action: 'file_uploaded',
          p_details: {
            filename: file.name,
            file_size: file.size,
            mime_type: file.type
          }
        })

        uploadResults.push({
          filename: file.name,
          success: true,
          fileId: fileId,
          url: urlData.publicUrl,
          size: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString()
        })

      } catch (error) {
        console.error('Upload error for file:', file.name, error)
        uploadResults.push({
          filename: file.name,
          success: false,
          error: 'Upload failed due to server error'
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results: uploadResults,
        message: `Processed ${files.length} file(s)`
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Vault upload error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})