import {v4 as uuidv4} from 'uuid';

export class Processor{
    id;
    constructor(){
      this.id = uuidv4();
    }

    getid(){
      return this.id;
    }
 };