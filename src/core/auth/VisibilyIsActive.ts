import { UserRole } from "./userRole"
// SO DE BASE NAO VAMOS USAR NO DDD 

export class VisibilityPolicy {

  static canView(  isActive: boolean, role: UserRole): boolean {
    if (role === UserRole.ADMIN) return true
    return isActive === true
  }
}
