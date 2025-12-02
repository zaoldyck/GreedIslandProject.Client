


    export class LureFishVariantViewModel {
       constructor() {
            
                this.id = 0;
            
                this.lureFishSpeciesId = 0;
            
                this.name = null;
            
                this.scientificName = null;
            
                this.description = null;
            
                this.imageUrl = null;
            
                this.sortOrder = 0;
            
                this.isEnabled = null;
            
                this.createdBy = null;
            
                this.createdDate = new Date();
            
                this.updatedBy = null;
            
                this.updatedDate = null;
            
        }
        
            public id: number;
        
            public lureFishSpeciesId: number;
        
            public name: string|null;
        
            public scientificName: string | null;
        
            public description: string | null;
        
            public imageUrl: string | null;
        
            public sortOrder: number;
        
            public isEnabled: boolean | null;
        
            public createdBy: string|null;
        
            public createdDate: Date;
        
            public updatedBy: string | null;
        
            public updatedDate: Date | null;
        
    }
