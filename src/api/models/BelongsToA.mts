import { belongsToI } from "./BelongsToI.mjs";

export abstract class belongsToA implements belongsToI{
    organizationIds: string[];

    constructor(){
        this.organizationIds = [];
    }

    deleteOrganizationId(organizationId:string):boolean {
        const elementToRemove = this.organizationIds.indexOf(organizationId);
        if(elementToRemove){
          this.organizationIds.splice(elementToRemove);
          return true;
        }else {
          return false;
        }
      }
  
      addOrganistionId(organizationId:string):boolean{
        const pos = this.organizationIds.indexOf(organizationId);
        if(pos){
          return false;
        }else {
          this.organizationIds.push(organizationId);
          return true;
        }
      }
}