// Vault module permissions
export const VAULT_PERMISSIONS = {
  view_vault: 'view_vault',
  upload_files: 'upload_files',
  share_files: 'share_files',
  delete_files: 'delete_files',
  manage_vault: 'manage_vault'
} as const;

export type VaultPermission = typeof VAULT_PERMISSIONS[keyof typeof VAULT_PERMISSIONS];

// Default role mappings for Vault
export const VAULT_ROLE_PERMISSIONS = {
  super_admin: [
    VAULT_PERMISSIONS.view_vault,
    VAULT_PERMISSIONS.upload_files,
    VAULT_PERMISSIONS.share_files,
    VAULT_PERMISSIONS.delete_files,
    VAULT_PERMISSIONS.manage_vault
  ],
  company_admin: [
    VAULT_PERMISSIONS.view_vault,
    VAULT_PERMISSIONS.upload_files,
    VAULT_PERMISSIONS.share_files
  ],
  learner: [
    VAULT_PERMISSIONS.view_vault
  ]
} as const;