export interface PolicyRoleBasedRepresentation {
    type: 'role';
    logic: 'POSITIVE',
    name: string;
    roles: PolicyRole[];
}

export interface PolicyRole {
    id: string;
    required: boolean;
}