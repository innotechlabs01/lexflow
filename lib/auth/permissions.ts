import type { UserRole } from '@/types/auth'

export type Resource =
  | 'organizations'
  | 'users'
  | 'cases'
  | 'clients'
  | 'documents'
  | 'hearings'
  | 'tasks'
  | 'notifications'
  | 'memberships'
  | 'audit_logs'

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'

/**
 * Role-based access control matrix
 * Defines what each role can do with each resource
 */
const PERMISSIONS: Record<UserRole, Record<Resource, Action[]>> = {
  super_admin: {
    organizations: ['create', 'read', 'update', 'delete', 'manage'],
    users: ['create', 'read', 'update', 'delete', 'manage'],
    cases: ['create', 'read', 'update', 'delete', 'manage'],
    clients: ['create', 'read', 'update', 'delete', 'manage'],
    documents: ['create', 'read', 'update', 'delete', 'manage'],
    hearings: ['create', 'read', 'update', 'delete', 'manage'],
    tasks: ['create', 'read', 'update', 'delete', 'manage'],
    notifications: ['create', 'read', 'update', 'delete', 'manage'],
    memberships: ['create', 'read', 'update', 'delete', 'manage'],
    audit_logs: ['read'],
  },
  admin: {
    organizations: ['read'],
    users: ['create', 'read', 'update', 'delete'],
    cases: ['create', 'read', 'update', 'delete', 'manage'],
    clients: ['create', 'read', 'update', 'delete'],
    documents: ['create', 'read', 'update', 'delete'],
    hearings: ['create', 'read', 'update', 'delete'],
    tasks: ['create', 'read', 'update', 'delete'],
    notifications: ['create', 'read', 'update', 'delete'],
    memberships: ['read'],
    audit_logs: ['read'],
  },
  lawyer: {
    organizations: [],
    users: ['read'],
    cases: ['create', 'read', 'update'],
    clients: ['create', 'read', 'update'],
    documents: ['create', 'read', 'update', 'delete'],
    hearings: ['create', 'read', 'update'],
    tasks: ['create', 'read', 'update', 'delete'],
    notifications: ['read'],
    memberships: [],
    audit_logs: [],
  },
  client: {
    organizations: [],
    users: [],
    cases: ['read'],
    clients: [],
    documents: ['read'],
    hearings: ['read'],
    tasks: [],
    notifications: ['read'],
    memberships: [],
    audit_logs: [],
  },
}

/**
 * Check if a role has permission to perform an action on a resource
 */
export function hasPermission(
  role: UserRole,
  resource: Resource,
  action: Action
): boolean {
  const rolePermissions = PERMISSIONS[role]
  if (!rolePermissions) {
    return false
  }

  const resourcePermissions = rolePermissions[resource]
  if (!resourcePermissions) {
    return false
  }

  return resourcePermissions.includes(action)
}

/**
 * Check if user can manage (full CRUD) a resource
 */
export function canManageResource(role: UserRole, resource: Resource): boolean {
  return hasPermission(role, resource, 'manage') || hasPermission(role, resource, 'delete')
}

/**
 * Get all allowed actions for a role on a resource
 */
export function getAllowedActions(role: UserRole, resource: Resource): Action[] {
  return PERMISSIONS[role]?.[resource] ?? []
}

/**
 * Check if user can create a resource
 */
export function canCreate(role: UserRole, resource: Resource): boolean {
  return hasPermission(role, resource, 'create')
}

/**
 * Check if user can read a resource
 */
export function canRead(role: UserRole, resource: Resource): boolean {
  return hasPermission(role, resource, 'read')
}

/**
 * Check if user can update a resource
 */
export function canUpdate(role: UserRole, resource: Resource): boolean {
  return hasPermission(role, resource, 'update')
}

/**
 * Check if user can delete a resource
 */
export function canDelete(role: UserRole, resource: Resource): boolean {
  return hasPermission(role, resource, 'delete')
}

/**
 * Check if user has any access to a resource
 */
export function canAccessResource(role: UserRole, resource: Resource): boolean {
  const actions = getAllowedActions(role, resource)
  return actions.length > 0
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    super_admin: 'Super Administrador',
    admin: 'Administrador',
    lawyer: 'Abogado',
    client: 'Cliente',
  }
  return names[role] || role
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
  const descriptions: Record<UserRole, string> = {
    super_admin: 'Acceso total a todas las organizaciones y funciones del sistema.',
    admin: 'Administrador de la organización con acceso completo a casos, clientes y configuración.',
    lawyer: 'Abogado de la organización con acceso a sus casos y clientes asignados.',
    client: 'Cliente con acceso limitado a sus propios casos y documentos compartidos.',
  }
  return descriptions[role] || ''
}

/**
 * Get available roles for selection (based on current user role)
 */
export function getAvailableRolesFor(currentUserRole: UserRole): UserRole[] {
  switch (currentUserRole) {
    case 'super_admin':
      return ['super_admin', 'admin', 'lawyer', 'client']
    case 'admin':
      return ['admin', 'lawyer', 'client']
    case 'lawyer':
      return ['client']
    default:
      return []
  }
}

/**
 * Check if role is elevated (higher privilege)
 */
export function isElevatedRole(role: UserRole): boolean {
  return role === 'super_admin' || role === 'admin'
}

/**
 * Role hierarchy level (higher = more privileges)
 */
export function getRoleLevel(role: UserRole): number {
  const levels: Record<UserRole, number> = {
    super_admin: 4,
    admin: 3,
    lawyer: 2,
    client: 1,
  }
  return levels[role] || 0
}

/**
 * Compare roles: returns 1 if role1 > role2, -1 if role1 < role2, 0 if equal
 */
export function compareRoles(role1: UserRole, role2: UserRole): number {
  const level1 = getRoleLevel(role1)
  const level2 = getRoleLevel(role2)
  return Math.sign(level1 - level2)
}