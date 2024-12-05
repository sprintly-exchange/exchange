export interface belongsToI{
    organizationIds: string[];
    deleteOrganizationId(organizationId:string):boolean;
    addOrganistionId(organizationId:string):boolean;
}