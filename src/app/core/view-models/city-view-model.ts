


    export class CityViewModel {
       constructor() {
            
                this.id = 0;
            
                this.provinceId = 0;
            
                this.code = null;
            
                this.name = null;
            
                this.level = 0;
            
                this.sortOrder = 0;
            
                this.isEnabled = null;
            
                this.createdBy = null;
            
                this.createdDate = new Date();
            
                this.updatedBy = null;
            
                this.updatedDate = null;
            
        }
        
            public id: number;
        
            public provinceId: number;
        
            public code: string|null;
        
            public name: string|null;
        
            public level: number;
        
            public sortOrder: number;
        
            public isEnabled: boolean | null;
        
            public createdBy: string|null;
        
            public createdDate: Date;
        
            public updatedBy: string | null;
        
            public updatedDate: Date | null;
        
    }
