import { Permission } from 'src/security/permissions/entities/permission.entity';
import { Role } from 'src/security/roles/entities/role.entity';

export const parseTimeToMilliseconds = (time: string): number | null => {
  const timeRegex = /^(\d+)([smhd])$/i;
  const matches = time.match(timeRegex);

  if (!matches || matches.length !== 3) return null;

  const value = parseInt(matches[1], 10);
  const unit = matches[2].toLowerCase();

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
};

export async function userPermissionCodeName(roles: Role[]) {
  const codeNames = new Set<string>();

  roles.forEach((role) => {
    if (role.permissions) {
      role.permissions.forEach((permission: Permission) => {
        codeNames.add(permission.code_name);
      });
    }
  });

  return [...codeNames];
}
