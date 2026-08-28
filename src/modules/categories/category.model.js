import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {type: String,required: true,trim: true,maxlength: 100},
  
    description: {type: String,trim: true,maxlength: 500,default: ""},
   
    organizationId: {type: mongoose.Schema.Types.ObjectId,ref: "Organization", required: true,index: true},
   
    isActive: {type: Boolean,default: true},

  },{timestamps: true}
);

// Prevent duplicate category names
// inside the same organization.

categorySchema.index( {organizationId: 1,name: 1},{unique: true} );
 
const Category = mongoose.model("Category", categorySchema);

export default Category;
